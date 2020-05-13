/**
 * scrubber/index.js
 * @author Andrew Roberts
 */

// polyfill async
import "core-js/stable";
import "regenerator-runtime";
// load env variables
import dotenv from "dotenv";
let result = dotenv.config();
if (result.error) {
  throw result.error;
}
// app modules
import { createMqttClient } from "./mqtt-client";
import { createScrubber } from "./scrubber";

async function run() {
  let mqttClientConfig = {
    hostUrl: process.env.SOLACE_MQTT_HOST_URL,
    options: {
      username: process.env.SOLACE_USERNAME,
      password: process.env.SOLACE_PASSWORD,
    },
  };

  let mqttClient = createMqttClient(mqttClientConfig);

  mqttClient = await mqttClient.connect().catch(() => {
    // handle retry logic here, for this demo just blow up if connection fails
    process.exit(1);
  });

  let scrubber = createScrubber(mqttClient.publish);

  // create partially applied handlers for the event flows this service is interested in
  let handleCardTransactionAuthorizedEvent = scrubber.createCardTransactionEventHandler(
    "*/PII/CardTransactions/Authorized"
  );
  let handleCardTransactionSettledEvent = scrubber.createCardTransactionEventHandler(
    "*/PII/CardTransactions/Settled"
  );
  let handleCardTransactionDeclinedEvent = scrubber.createCardTransactionEventHandler(
    "*/PII/CardTransactions/Declined"
  );

  // set up topic subscriptions to attract relevant event flows
  try {
    await mqttClient.subscribe(
      "*/PII/CardTransactions/Authorized",
      options,
      handleCardTransactionAuthorizedEvent
    );
    await mqttClient.subscribe(
      "*/PII/CardTransactions/Settled",
      options,
      handleCardTransactionSettledEvent
    );
    await mqttClient.subscribe(
      "*/PII/CardTransactions/Declined",
      options,
      handleCardTransactionDeclinedEvent
    );
  } catch (err) {
    // could handle re-try logic here, but don't need to for this demo
    console.error(err);
    process.exit(1);
  }

  // run until sigint
  console.log("Running until a SIGINT signal is received...");
  process.stdin.resume();
  process.on("SIGINT", function () {
    console.log("+-+-+-+-+-+-+-+-+-+-+-+-+-+");
    console.log("+-+-+-+-+-+-+-+-+-+-+-+-+-+");
    process.exit();
  });
}

// start sequence
console.log("+-+-+-+-+-+-+-+-+-+-+-+-+-+");
console.log("+-+-+-+-+-+-+-+-+-+-+-+-+-+");
console.log(new Date().toLocaleTimeString());
console.log("Starting scrubber...");

run();
