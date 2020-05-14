/**
 * fraud-detector.js
 * @author Andrew Roberts
 */

import produce from "immer";

/**
 * returns an object that exposes methods for detecting fraudulent card transactions
 */
export function createFraudDetector(publish) {
  /**
   * this function returns a partially applied event handler function
   */
  const scrubbedCardTransactionEventHandler = (topic, message, packet) =>
    detectFraud(parse(message));

  /**
   * Randomly return that fraud was detected. In real life,
   * this is where you run your ML model or insert business logic.
   * @param {Object} scrubbedCardTransaction
   */
  function detectFraud(scrubbedCardTransaction) {
    // some really innovative stuff going on here
    let secretSauceMachineLearningModel = Math.floor(Math.random() * 5);

    if (secretSauceMachineLearningModel == 2) {
      publish(
        "FraudDetector/SuspiciousActivityDetected",
        // suspicious activity detected event schema
        {
          account_id: scrubbedCardTransaction.account_id,
          pos: scrubbedCardTransaction.pos,
        },
        { qos: 1 }
      );
    }
  }

  /**
   * returns object representation of provided event
   * @param {*} message
   * @returns {Object}
   */
  function parse(message) {
    return JSON.parse(message.toString());
  }

  return produce({}, (draft) => {
    draft.scrubbedCardTransactionEventHandler = scrubbedCardTransactionEventHandler;
  });
}
