/**
 * mqtt-client.js
 * @author Andrew Roberts
 */

import mqtt from "mqtt";
import produce from "immer";

/**
 * A factory function that returns a client object that wraps MQTT.js.
 * If hostUrl or options are not provided, the client will attempt to
 * connect using sensible defaults.
 * @param {string} hostUrl
 * @param {object} options
 */
export function createMqttClient({
  hostUrl = "ws://localhost:8000",
  options: {
    // assign defaults if the values aren't included in the provided object,
    username = "default",
    password = "",
    clientId = `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
    ...rest
  } = {
    // and default to this object literal if no object is provided.
    username: "default",
    password: "",
    clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
  },
}) {
  /**
   * Private reference to the client connection object
   */
  let client = null;

  /**
   * Private map between topic subscriptions and their associated handler callbacks.
   * Messages are dispatched to all topic subscriptions that match the incoming message's topic.
   * subscribe and unsubscribe modify this object.
   */
  let subscriptions = produce({}, () => {});

  /**
   * event handlers
   *
   * MQTT.js exposes client events, or callbacks related to the session with the broker.
   * The methods below are sensible defaults, and can be modified using the exposed setters.
   * Source documentation here: https://github.com/mqttjs/MQTT.js#event-connect
   */

  let onConnect = () => {
    logInfo(`Connected`);
  };

  let onReconnect = () => {
    logInfo(`Reconnecting`);
  };

  let onClose = () => {
    logInfo(`Disconnected`);
  };

  let onOffline = () => {
    logInfo(`Connection lost`);
  };

  let onError = (error) => {
    logError(error);
  };

  let onEnd = (error) => {
    logError(error);
  };

  // onMessage handler configured to dispatch incoming messages to
  // the associated handlers of all matching topic subscriptions.
  const onMessage = (topic, message, packet) => {
    for (const topicSubscription of Object.keys(subscriptions)) {
      if (topicMatchesTopicFilter(topicSubscription, topic)) {
        subscriptions[topicSubscription](topic, message, packet);
      }
    }
  };

  /**
   * event handler setters
   */

  function setOnConnect(_onConnect) {
    onConnect = _onConnect;
  }

  function setOnReconnect(_onReconnect) {
    onReconnect = _onReconnect;
  }

  function setOnClose(_onClose) {
    onClose = _onClose;
  }

  function setOnOffline(_onOffline) {
    onOffline = _onOffline;
  }

  function setOnError(_onError) {
    onError = _onError;
  }

  function setOnEnd(_onEnd) {
    onEnd = _onEnd;
  }

  /**
   * Overloaded MQTT.js connect method.
   * Resolves with an extended MQTT.js Client object on receiving a connack,
   * rejects if there is an error whike connecting.
   * https://github.com/mqttjs/MQTT.js/blob/master/README.md#connect
   */
  async function connect() {
    return new Promise((resolve, reject) => {
      client = mqtt.connect(hostUrl, {
        ...rest,
        username,
        password,
        clientId,
      });
      client.on("reconnect", onReconnect);
      client.on("close", onClose);
      client.on("offline", onOffline);
      client.on("end", onEnd);
      client.on("message", onMessage);
      client.on("connect", (connack) => {
        onConnect();
        // resolve with mqtt.js client object enhanced with convenience functions
        resolve(
          produce({}, (draft) => {
            // overloaded MQTT.js Client methods
            draft.subscribe = subscribe;
            draft.unsubscribe = unsubscribe;
            draft.publish = publish;
            // MQTT.js Client methods
            draft.end = client.end;
            draft.removeOutgoingMessage = client.removeOutgoingMessage;
            draft.reconnect = client.reconnect;
            draft.handleMessage = client.handleMessage;
            draft.connected = client.connected;
            draft.reconnecting = client.reconnecting;
            draft.getLastMessageId = client.getLastMessageId;
            // MQTT.js Client event handler setters
            draft.setOnConnect = setOnConnect;
            draft.setOnError = setOnError;
            draft.setOnReconnect = setOnReconnect;
            draft.setOnOffline = setOnOffline;
            draft.setOnEnd = setOnEnd;
            draft.setOnClose = setOnClose;
            // utility functions
            draft.logInfo = logInfo;
            draft.logError = logError;
          })
        );
      });
      client.on("error", (error) => {
        onError(error);
        reject();
      });
    });
  }

  /**
   * Overloaded MQTT.js Client publish method.
   * This method will attempt to stringify the message passed to it as an argument,
   * and will reject if it is unable to either stringify or publish the message.
   * https://github.com/mqttjs/MQTT.js/blob/master/README.md#publish
   * @param {string} topic
   * @param {object|string|number|boolean} message
   * @param {object} options
   */
  async function publish(topic, message, options) {
    return new Promise(async (resolve, reject) => {
      // guard: do not try to publish if client is not connected
      if (!client) {
        logError(`Cannot publish, client is not connected`);
        reject();
      }

      // attempt to serialize message
      let serializedMessage;
      try {
        serializedMessage = await serializeMessage(message);
      } catch {
        logError(`Cannot publish, message serialization failed`);
        reject();
      }

      // publish serialized message
      client.publish(
        topic,
        serializedMessage,
        options, // options
        function onPubAck(error) {
          // guard: err != null indicates client is disconnecting
          if (error) {
            logError(error);
            reject();
          }
          // no error indicates broker has received message and successfully sent back an ack
          logInfo(`Published message on topic ${topic}`);
          console.dir(message);
          resolve();
        }
      );
    });
  }

  /**
   * Overloaded MQTT.js Client subscribe method.
   * Extends default subscribe behavior by accepting a handler argument
   * that is called with any incoming messages that match the topic subscription.
   * https://github.com/mqttjs/MQTT.js/blob/master/README.md#subscribe
   * @param {string} topic
   * @param {object} options
   * @param {any} handler
   */
  async function subscribe(topic, options, handler) {
    return new Promise(async (resolve, reject) => {
      // guard: do not try to subscribe if client has not yet been connected
      if (!client) {
        logError(`Cannot subscribe, client is not connected`);
        reject();
      }
      // guard: do not allow duplicate topic subscriptions
      if (topic in subscriptions) {
        logError(`Cannot subscribe, already subscribed to topic ${topic}`);
        reject();
      }

      // subscribe to topic on client
      client.subscribe(topic, options, function onSubAck(err, granted) {
        // guard: err != null indicates a subscription error or an error that occurs when client is disconnecting
        if (err) reject(err);
        // else, subscription is verified

        // add event handler
        subscriptions = produce(subscriptions, (draft) => {
          draft[topic] = handler;
        });
        console.log(
          `Suback received for topic "${granted[0].topic}" using QOS ${granted[0].qos}`
        );
        resolve();
      });
    });
  }

  /**
   * Overloaded MQTT.js Client unsubscribe method.
   * Extends default unsubscribe behavior by removing any handlers
   * that were associated with the topic subscription.
   * https://github.com/mqttjs/MQTT.js/blob/master/README.md#subscribe
   * @param {string} topic
   * @param {object} options
   * @param {any} handler
   */
  async function unsubscribe(topic) {
    return new Promise((resolve, reject) => {
      // guard: do not try to unsubscribe if client has not yet been connected
      if (!client) {
        logError(`, client is not connected`);
        reject();
      }
      // remove event handler
      subscriptions = produce(subscriptions, (draft) => {
        delete draft[topic];
      });
      // unsubscribe from topic on client
      client.unsubscribe(topic, null, function onUnsubAck(err) {
        // guard: err != null indicates an error occurs if client is disconnecting
        if (err) reject(err);
        // else, unsubscription verified
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
      clientId,
      username,
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
      clientId,
      username,
      time: new Date().toISOString(),
      error: error,
    };
    console.error(JSON.stringify(errorLog));
  }

  /**
   * This factory function returns an object that only exposes methods to configure and connect the client.
   * Methods to add subscriptions (and all others) are exposed in the client the connect method resolves with.
   */
  return produce({}, (draft) => {
    // overloaded MQTT.js methods
    draft.connect = connect;
    // MQTT.js Client event handler setters
    draft.setOnConnect = setOnConnect;
    draft.setOnReconnect = setOnReconnect;
    draft.setOnClose = setOnClose;
    draft.setOnOffline = setOnOffline;
    draft.setOnError = setOnError;
    draft.setOnEnd = setOnEnd;
    // utility functions
    draft.logInfo = logInfo;
    draft.logError = logError;
  });
}

/**
 * Return a boolean indicating whether the topic filter the topic.
 * @param {string} topicFilter
 * @param {string} topic
 */
export function topicMatchesTopicFilter(topicFilter, topic) {
  // convert topic filter to a regex and see if the incoming topic matches it
  let topicFilterRegex = convertMqttTopicFilterToRegex(topicFilter);
  let match = topic.match(topicFilterRegex);

  // if the match index starts at 0, the topic matches the topic filter
  if (match && match.index == 0) {
    // guard: check edge case where the pattern is a match but the last character is *
    if (topicFilterRegex.lastIndexOf("*") == topic.length - 1) {
      // if the number of topic sections are not equal, the match is a false positive
      if (topicFilterRegex.split("/").length != topic.split("/").length) {
        return false;
      }
    }
    // if no edge case guards return early, the match is genuine
    return true;
  }

  // else the match object is empty, and the topic is not a match with the topic filter
  else {
    return false;
  }
}

/**
 * Convert MQTT topic filter wildcards and system symbols into regex
 * Useful resource for learning: https://regexr.com/
 * @param {string} topicFilter
 */
export function convertMqttTopicFilterToRegex(topicFilter) {
  // convert single-level wildcard + to .*, or "any character, zero or more repetitions"
  let topicFilterRegex = topicFilter.replace(/\+/g, ".*").replace(/\$/g, ".*");
  // convert multi-level wildcard # to .* if it is in a valid position in the topic filter
  if (topicFilter.lastIndexOf("#") == topicFilter.length - 1) {
    topicFilterRegex = topicFilterRegex
      .substring(0, topicFilterRegex.length - 1)
      .concat(".*");
  }
  // convert system symbol $ to .

  return topicFilterRegex;
}

/**
 * Attempt to serialize provided message.
 * Logs and rejects on errors, resolves with publish-safe string on success.
 * @param {object|string|number|null} message
 */
export function serializeMessage(message) {
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
