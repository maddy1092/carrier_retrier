import { decode } from "@msgpack/msgpack";
import amqp from "amqplib/callback_api.js";
import JSON5 from 'json5'
import { isString } from "./helper.mjs";

export function formatDatasetEntry(payload) {
  return (
    [{ index: { _index: 'payment', _id: payload.es_id }}, payload ]
  );
}

function decodeRmqData(message) {
  const msgPckEncoded = Buffer.from(message.data, "base64");

  if (message.basicProperties.contentType === 'application/msgpack') {
    return decode(msgPckEncoded);
  }

  let msgPckEncodeddata =  msgPckEncoded.toString('ascii');
  msgPckEncodeddata = msgPckEncodeddata.replace(/Object/g, 'object');

  return JSON5.parse(msgPckEncodeddata);
}

export function getDatasetFromEvent(event) {
  let dataset = [];
  try {
    for (const queueName in event.rmqMessagesByQueue) {
      event.rmqMessagesByQueue[queueName].forEach((messages) => {
        // Decode base64 and Decode msgpack message from Rabbit MQ
        let decodedPayload = decodeRmqData(messages);

        if (isString(decodedPayload)) {
          decodedPayload = JSON.parse(decodedPayload)

          if (Array.isArray(decodedPayload)) {
            dataset.push(...decodedPayload)
          } else {
            dataset.push(decodedPayload)
          }
            
        } else {

          if (Array.isArray(decodedPayload)) {
            dataset.push(...decodedPayload)
          } else {
            dataset.push(decodedPayload);
          }
        }
      });
    }
  } catch (e) {
    console.error(e);
  }
  console.log(dataset, 'im falseeee');
  return dataset;
}

export function getDatasetFromRabbitMQ(rabbitmqURL) {
  let dataset = [];
  const queueNames = process.env.RABBITMQ_QUEUES.split(",");
  try {
    amqp.connect(rabbitmqURL, function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }
        for (const queueName of queueNames) {
          channel.assertQueue(queueName, {
            durable: true,
          });
          console.log(" [*] Waiting for messages in %s. ", queueName);
          channel.consume(
            queueName,
            async function (message) {
              const decodedPayload = decodeRmqData(message.content.toString());
              if (isString(decodedPayload)) {
                decodedPayload = JSON.parse(decodedPayload)
    
                if (Array.isArray(decodedPayload)) {
                  dataset.push(...decodedPayload)
                } else {
                  dataset.push(decodedPayload)
                }

              } else {
                dataset.push(decodedPayload);    
              }
            },
            {
              noAck: true,
            }
          );
        }
      });
    });
  } catch (e) {
    return [];
  }

  return dataset;
}

export function publishToRabbitMQ(rabbitmqURL, queueName, messages) {
  amqp.connect(rabbitmqURL, function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertQueue(queueName, {
        durable: true,
      });
      console.log(" [*] Sending messages in %s. ", queueName);
      for (const message of messages) {
        channel.sendToQueue(queueName, message);
      }
    });
  });
}
