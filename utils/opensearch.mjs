import { config } from "../config.mjs";
import { getSecrets } from "./secrets.mjs";
import { Client } from "@opensearch-project/opensearch";

async function getOpenSearchCreds() {
  if (config.OPENSEARCH_USERNAME && config.OPENSEARCH_PASSWORD) {
    return {
      username: config.OPENSEARCH_USERNAME,
      password: config.OPENSEARCH_PASSWORD,
    };
  } else {
    const secrets = await getSecrets("opensearch");
    return secrets;
  }
}

async function getOpenSearchClient(url) {
  const credentials = await getOpenSearchCreds()

  return new Client({
    node: url,
    auth: credentials,
  });
}

async function retrieveOpenSearchIndex(client, es_id) {
  const query = {
    query: {
      match: {
        es_id: {
          query: es_id,
        },
      },
    },
  };
  const response = await client.search({
    index: "payment-main",
    body: query,
  });
  console.log("Search Result: ");
  console.log(response.body.hits.hit[0]);
  return response;
}

async function createOpenSearchIndex(client, indexName) {
  console.log("Creating the index: ", indexName);
  await client.indices
    .create({
      index: indexName,
      body: INDEX_SCHEMA,
    })
    .catch((error) => {
      console.log("An error happend, The error is " + error);
    });
  console.log("Creating the index " + index + " is Complete");
}

async function postToOpenSearch(client, dataset) {
  const body = dataset;
  const { body: bulkResponse } = await client.bulk({ refresh: true, body });
  const erroredDocuments = [];

  if (bulkResponse.errors) {
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1],
        });
      }
    });
  }
  return erroredDocuments;
}

export {
  getOpenSearchCreds,
  getOpenSearchClient,
  createOpenSearchIndex,
  postToOpenSearch,
  retrieveOpenSearchIndex
};
