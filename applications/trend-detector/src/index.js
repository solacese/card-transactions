/**
 * trend-detector/index.js
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
import { createTrendDetector } from "./trend-detector";

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

  let trendDetector = createTrendDetector(mqttClient.publish);

  // set up topic subscriptions to attract relevant event flows (only authorized—removes dupes with settled and useless declines!)
  try {
    await mqttClient.subscribe(
      "+/Scrubbed/CardTransaction/Authorized",
      { qos: 1 },
      trendDetector.scrubbedCardTransactionEventHandler
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
console.log("Starting trend detector...");

run();
