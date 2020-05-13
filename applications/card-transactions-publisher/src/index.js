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
import { createKafkaProducer } from "./kafka-producer";
import { createCardTransactionPublisher } from "./card-transaction-publisher";

async function run() {
  const kafkaConfig = {
    kafkaHost: `${process.env.KAFKA_HOST_URL}:${process.env.KAFKA_PORT}`,
  };

  let kafkaProducer = createKafkaProducer(kafkaConfig);

  kafkaProducer = await kafkaProducer.connect().catch(() => {
    // handle retry logic here, for this demo just blow up if connection fails
    process.exit(1);
  });

  let cardTransactionPublisher = createCardTransactionPublisher(
    kafkaProducer.send
  );

  cardTransactionPublisher.start();

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
console.log("Starting card transaction publisher...");

run();
