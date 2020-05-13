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
  let scrubber = createScrubber();

  /**
   * mqtt client
   */
  let mqttClientConfig = {
    hostUrl: process.env.SOLACE_MQTT_HOST_URL,
    options: {
      username: process.env.SOLACE_USERNAME,
      password: process.env.SOLACE_PASSWORD,
    },
  };
  let mqttClient = createMqttClient(mqttClientConfig);
  try {
    mqttClient = await mqttClient.connect();
  } catch (err) {
    console.error(err);
  }

  /**
   * configure topic subscriptions
   */
  await mqttClient.subscribe(topic, options, handler);

  // run until sigint
  console.log("Running until a SIGINT signal is received...");
  process.stdin.resume();
  process.on("SIGINT", function () {
    console.log("+-+-+-+-+-+-+-+-+-+-+-+-+-+");
    console.log("+-+-+-+-+-+-+-+-+-+-+-+-+-+");
    process.exit();
  });
}

console.log("+-+-+-+-+-+-+-+-+-+-+-+-+-+");
console.log("+-+-+-+-+-+-+-+-+-+-+-+-+-+");
console.log(new Date().toLocaleTimeString());
console.log("Starting scrubber...");

run();
