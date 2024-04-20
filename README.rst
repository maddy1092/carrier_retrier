==========================================
AWS carrierConsumeRabbitMQ lambda
==========================================


-------------
Prerequisites
-------------
1) Node.js 14.x
2) msgpack/msgpack 2.7.2
3) opensearch-project/opensearch 1.0.2
4) amqplib 0.8.0
5) aws-sdk 2.1082.0
6) dotenv 16.0.0
7) axios 0.27.2
8) mocha 9.2.0
9) sentry/serverless 6.18.1

-------------
Install dependencies
-------------
1) To install the dependencies:

.. code::

  npm install

------------------
DESCRIPTION
------------------
This lambda is used to  push successful transactions from ottu after consuming it from Rabbit MQ queues
, Running Lambda will establish the connection to rabbitmq after that it will consume pending messages from two queues named: **estate** and **main** after that
it will add the messages as a document to the elasticsearch

------------------
USAGE
------------------
There is two ways to use Lambda:

1) To test lambda on local first you need to Download and install RabbitMQ locally using the following command:

.. code::

    docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.9-management

Then open any Browser and type http://localhost:15672/ , use the default credentials **guest** for username and password.

Create a new queue/s and publish a message from RabbitMQ for ex:

.. code::

    cm91dGU9cGF5bWVudC9vdHR1L2Rpc0Nsb3N1cmWscmVkaXJlY3RfdXJs2UdodHRwczovL1pXRktLQzExNjUuZXhwYW5kY2FydC5jb20vaW5kZXgucGhwP3JvdXRlPXBheW1lbnQvb3R0dS9jYWxsYmFja7NjdXN0b21lcl9maXJzdF9uYW1loLJjdXN0b21lcl9sYXN0X25hbWWgrmN1c3RvbWVyX2VtYWlstW0uZGlhYkBleHBhbmRjYXJ0LmNvba5jdXN0b21lcl9waG9uZaC2Y3VzdG9tZXJfYWRkcmVzc19saW5lMaC2Y3VzdG9tZXJfYWRkcmVzc19saW5lMqC1Y3VzdG9tZXJfYWRkcmVzc19jaXR5oLZjdXN0b21lcl9hZGRyZXNzX3N0YXRloLhjdXN0b21lcl9hZGRyZXNzX2NvdW50cnmgvGN1c3RvbWVyX2FkZHJlc3NfcG9zdGFsX2NvZGWgpWV4dHJhgLVlbWFpbF9wYXltZW50X2RldGFpbHPCs3Ntc19wYXltZW50X2RldGFpbHPCsHNtc19ub3RpZmljYXRpb27CsmVtYWlsX25vdGlmaWNhdGlvbsKxcHVzaF9ub3RpZmljYXRpb27Cq3ZlbmRvcl9uYW1loKhkdWVfZGF0ZcCwZW1haWxfcmVjaXBpZW50c6CqYXR0YWNobWVudMCwcmVmZXJlbmNlX251bWJlcqVBUTZDSqRkYXRhgLBzdGF0ZV9jaGFuZ2VkX2F0oKlvcGVyYXRpb26ocHVyY2hhc2WscGF5bWVudF9kYXRloLljYXB0dXJlX2RlbGl2ZXJ5X2xvY2F0aW9uwrhjYXB0dXJlX2RlbGl2ZXJ5X2FkZHJlc3PCrWVtYWlsX3NlZW5fYXSgrHByb2R1Y3RfdHlwZaClc3RhdGWnUGVuZGluZ6djcmVhdGVkszAxLzAxLzIwMjEgMTY6MDE6MDinZGV0YWlsc4emQW1vdW50pzU5OS4wMDCnR2F0ZXdheaVrcGF5dK1HYXRld2F5IGNvZGVzkaVrcGF5dKhDdXJyZW5jeaNLV0SoTGFuZ3VhZ2WnRW5nbGlzaLFNZXJjaGFudCBvcmRlciBub6w1XzE2MDk1MDYwNjeuQ3VzdG9tZXIgZW1haWy1bS5kaWFiQGV4cGFuZGNhcnQuY29tq3VuaXRfY29uZmlnwKR1bml0wKNmZWWhMKR0eG5zkA==


Now you should added the credentials for RabbitMQ, queue/s name(The same name for the one you have created) and for the ElasticSearch also and save them as an environment variables in the .env
, After that just run the following:

.. code::

    node index.js

2) To run Lambda on AWS: Publish a message from RabbitMQ and it will automatically run.



------------------
RABBITMQ MESSAGES
------------------
Please note that all Rabbit MQ Messages must be base64 encoded and after Decoding the message, it will
msgpack encoded.


------------------
INDEX SCHEMA
------------------
The payload should be sent in the following schema:

.. code::

const INDEX_SCHEMA = {
  mappings: {
    properties: {
      id: { type: "integer" },
      parent: { type: "integer" },
      es_id: { type: "text" },
      parent_es_id: { type: "text" },
      state: { type: "text" },
      type: { type: "text" },
      operation: { type: "text" },
      merchant_id: { type: "text" },
      is_amount_editable: { type: "boolean" },
      is_sandbox: { type: "boolean" },
      is_deleted: { type: "boolean" },
      amount: { type: "double" },
      due_amount: { type: "double" },
      delivery_fee: { type: "double" },
      paid_amount: { type: "double" },
      remaining_amount: { type: "double" },
      total_refunded_amount: { type: "double" },
      total_voided_amount: { type: "double" },
      total_authorized_amount: { type: "double" },
      pg_code: { type: "text" },
      pg_codes: { type: "text" },
      pg_name: { type: "text" },
      service_code: { type: "text" },
      payment_service: { type: "text" },
      currency_code: { type: "text" },
      language: { type: "text" },
      unit_config: { type: "object" },
      payment_url: { type: "text" },
      attachment_url: { type: "text" },
      disclosure_url: { type: "text" },
      redirect_url: { type: "text" },
      receipt_url: { type: "text" },
      qr_code_url: { type: "text" },
      created: { type: "date" },
      modified: { type: "date" },
      state_changed_at: { type: "date" },
      payment_date: { type: "date" },
      seen_at: { type: "date" },
      email_seen_at: { type: "date" },
      due_datetime: { type: "date" },
      order_no: { type: "text" },
      reference_number: { type: "text" },
      session_id: { type: "text" },
      expiration_time: { type: "text" },
      invalidation_reason: { type: "text" },
      vendor_name: { type: "text" },
      bulk: { type: "integer" },
      transaction_log_id: { type: "integer" },
      mail_log: { type: "integer" },
      email_recipients: { type: "text" },
      capture_delivery_location: { type: "boolean" },
      capture_delivery_address: { type: "boolean" },
      card_type: { type: "text" },
      auth_code: { type: "text" },
      card_number: { type: "text" },
      card_issuer: { type: "text" },
      customer_id: { type: "text" },
      customer_first_name: { type: "text" },
      customer_last_name: { type: "text" },
      customer_email: { type: "text" },
      customer_phone: { type: "text" },
      customer_additional_phone: { type: "text" },
      initiator: { type: "object" },
      extra: { type: "object" },
      billing_address: { type: "object" },
      shipping_address: { type: "object" },
      notifications: { type: "object" },
      data: { type: "object" },
      attempts: {
        type: "nested" ,
        properties: {
          id: { type: "integer" },
          state: { type: "text" },
          transaction: { type: "integer" },
          transaction_es_id: { type: "text" },
          reference_number: { type: "text" },
          message: { type: "text" },
          pg_settings: { type: "integer" },
          amount: { type: "double" },
          fee: { type: "double" },
          total: { type: "double" },
          created: { type: "date" },
          modified: { type: "date" },
          state_changed_at: { type: "date" },
          pg_response: { type: "object" },
          data: { type: "object" },
          request_data: { type: "object" },
          disclosure_url_error: { type: "object" },
          disclosed_data: { type: "object" },      
        }
      },
    }
  }
};

------------------
TESTS
------------------
We have two tests for Creating actual data from multiple queues which are:

1) The first one will test creating the dataset from the event.
2) This one will check if input won’t be processed.

To Run Tests:
On Lambda there is a test button, just add an "is_test" bool field to the input and make it true then the test will be running.
