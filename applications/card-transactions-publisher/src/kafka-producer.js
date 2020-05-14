/**
 * kafka-producer.js
 * @author Andrew Roberts
 */

import produce from "immer";
import kafka from "kafka-node";

/**
 * A factory function that returns a client object that wraps kafka-node.
 * If kafkaHost or options are not provided, the client will attempt to
 * connect using sensible defaults.
 * @param {*} options
 */
export function createKafkaProducer({
  kafkaHost = "10.3.100.196:9092",
  ...rest
}) {
  /**
   * private object properties
   */
  let kafkaClient = null;
  let kafkaProducer = null;

  /**
   * event handlers
   */

  let onReady = () => {
    logInfo(`Ready to send messages`);
  };

  let onError = (error) => {
    logError(error);
  };

  /**
   * event handler setters
   */

  function setOnReady(_onReady) {
    onReady = _onReady;
  }

  function setOnError(_onError) {
    onError = _onError;
  }

  /**
   * Resolves with a ready to use Kafka Producer client object,
   * rejects if there is an error while connecting.
   * https://github.com/SOHU-Co/kafka-node#producer
   */
  async function connect() {
    return new Promise((resolve, reject) => {
      // create connection with the Kafka server
      kafkaClient = new kafka.KafkaClient({
        kafkaHost,
        ...rest,
      });
      kafkaProducer = new kafka.Producer(kafkaClient);
      // configure client event handlers on the kafka producer client object
      kafkaProducer.on("ready", () => {
        onReady();
        // resolve with extended Kafka Producer client
        resolve(
          produce({}, (draft) => {
            // overloaded Kafka Producer client methods
            draft.send = send;
            // Kafka Producer client methods
            draft.createTopics = kafkaProducer.createTopics;
            // Producer event handler setters
            draft.setOnReady = setOnReady;
            draft.setOnError = setOnError;
            // utility functions
            draft.logInfo = logInfo;
            draft.logError = logError;
          })
        );
      });
      kafkaProducer.on("error", (error) => {
        onError(error);
      });
    });
  }

  /**
   * Overloaded Kafka Producer method that sends one message at a time,
   * on whatever topic is provided as an argument. This method will
   * serialize the provided message argument before attempting to send.
   * @param {string} topic
   * @param {*} message
   */
  async function send({ topic, message, ...options }) {
    return new Promise(async (resolve, reject) => {
      // guard: attempt to serialize payload, reject if serialization fails
      let serializedMessage = await serialize(message).catch(() => reject());
      // form payload object
      let payload = [
        {
          topic,
          messages: [serializedMessage],
          ...options,
        },
      ];
      kafkaProducer.send(payload, function (err, data) {
        // guard: err indicates that there was a failure when sending messages
        if (err) {
          reject();
        }
        // otherwise,
        logInfo("Published message");
        console.dir(message);
        resolve();
      });
    });
  }
  /**
   * info level logger
   * @param {string} message
   */
  function logInfo(message) {
    const log = {
      time: new Date().toISOString(),
      msg: message,
    };
    console.log(JSON.stringify(log));
  }

  /**
   * error level logger
   * @param {string} message
   */
  function logError(error) {
    const errorLog = {
      time: new Date().toISOString,
      error: error,
    };
    console.error(JSON.stringify(errorLog));
  }

  /**
   * This factory function returns an object that only exposes methods to configure and connect the client.
   * Methods to add subscriptions (and all others) are exposed in the client the connect method resolves with.
   */
  return produce({}, (draft) => {
    // wrapper functions
    draft.connect = connect;
    // Producer event handler setters
    draft.setOnReady = setOnReady;
    draft.setOnError = setOnError;
    // utility functions
    draft.logInfo = logInfo;
    draft.logError = logError;
  });
}

/**
 * Attempt to serialize provided message.
 * Logs and rejects on errors, resolves with publish-safe string on success.
 * @param {object|string|number|null} message
 */
export function serialize(message) {
  return new Promise((resolve, reject) => {
    try {
      // handle non-null objects
      if (typeof message === "object" && message !== null) {
        resolve(JSON.stringify(message));
      }

      // handle numbers
      if (typeof message === "number") {
        resolve(message.toString());
      }

      // handle booleans
      if (typeof message === "boolean") {
        resolve(String.valueOf(message));
      }
      // handle strings
      if (typeof message === "string") {
        resolve(message);
      }

      // handle null
      if (message === null) {
        resolve("");
      }
    } catch (error) {
      /**
       * if you pass an object to this function that can't be stringified,
       * this catch block will catch and log the error
       */
      logError(error);
      reject();
    }
  });
}
