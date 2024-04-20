"use strict";

import { config } from "./config.mjs";
import { createRequire } from "module";
import { BrowserTracing } from "@sentry/tracing";
import {
  getDatasetFromEvent,
  getDatasetFromRabbitMQ,
  formatDatasetEntry,
} from "./utils/dataset.mjs";
import { getOpenSearchClient, postToOpenSearch, retrieveOpenSearchIndex } from "./utils/opensearch.mjs";
import { putErrorDocumentOnServer } from "./utils/rest_api.mjs";
import { compareStatesModified, isString } from "./utils/helper.mjs";
const require = createRequire(import.meta.url);
const Sentry = require("@sentry/serverless");

require("dotenv").config();

Sentry.AWSLambda.init({
  dsn: config.SENTRY_DSN,
  integrations: [new BrowserTracing()],
  environment: config.SENTRY_ENVIRONMENT,
  tracesSampleRate: 1.0,
});

export const handler = async (event, context) => {
  let dataset;

  if (config.RABBITMQ_URL && !config.ON_AWS) {
    dataset = getDatasetFromRabbitMQ(config.RABBITMQ_URL);
  } else {
    dataset = getDatasetFromEvent(event);
  }

  let operations = [];
  const client = await getOpenSearchClient(config.OPENSEARCH_URL); // create a new open search client

  if (!dataset.length) {
    console.log('No event parsed')
    return;
  }

  for (let d of dataset) {
    let document = d.document;
    if (isString(d.document)) {
      document = JSON.parse(document);
    }

    try {
      console.log('coming here 1')
      const response = await retrieveOpenSearchIndex(client, document.es_id); // get data from open search
      console.log(JSON.stringify(response, null, 2));
      if (response && response.body.hits && response.body.hits.hits.length > 0) {
        if (compareStatesModified(response.body.hits.hits[0]._source, document)) {  // comparing states of upcoming and stored data
          operations.push(document);
        }
      } else {
        operations.push(document);
      }
    } catch(err) {
      Sentry.captureException({ msg: err });
      continue;
    }
  }

  if (!operations.length) {
    console.log('No operation found to perform');
    return;
  }

  let erroredDocuments = [];
  operations = operations.flatMap((doc) => formatDatasetEntry(doc));    

  try {
    console.log('publishing to es')
    erroredDocuments = await postToOpenSearch(client, operations);

    if (erroredDocuments.length) {
      console.log('sending to delta')
      const payload = erroredDocuments.map(err => {
        return JSON.parse(err.document);
      });
      const data = await putErrorDocumentOnServer(payload)

      if (!data) {
        Sentry.captureException({ erroredDocuments });
        console.log('Sending Messages to Delta :: ');
        return
      }

      if (Array.isArray(data.unpublished_txns) && data.unpublished_txns.length) { 
        Sentry.captureException({ msg: 'unpublished_txns', unpublished_txns: data.unpublished_txns })   // sending unpublished docs to Sentry
      }
    }
  } catch(error) {
    Sentry.captureException({ erroredDocuments: erroredDocuments });
    console.log('Error while => Sending Messages to Delta :: ', error);
  }

  return;
}

if (!config.AWSLAMBDA_SENTRY) {
  Sentry.AWSLambda.wrapHandler(handler);
}
if (config.RABBITMQ_URL) {
  console.log("Running lambda locally");
  handler();
}