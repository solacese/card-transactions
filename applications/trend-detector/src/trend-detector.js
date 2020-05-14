/**
 * trend-detector.js
 * @author Andrew Roberts
 */

import produce from "immer";

/**
 * returns an object that exposes methods for detecting spending patterns in card transactions
 */
export function createTrendDetector(publish) {
  /**
   * private object properties
   */
  const spendingPatternTypes = [
    "food",
    "online-retailer",
    "spotify",
    "groceries",
    "travel",
  ];

  /**
   * this function returns a partially applied event handler function
   */
  const scrubbedCardTransactionEventHandler = (topic, message, packet) =>
    detectTrend(parse(message));

  /**
   * Randomly publish that a trend was detected. In real life,
   * this is where you run your ML model or insert business logic.
   * @param {Object} scrubbedCardTransaction
   */
  function detectTrend(scrubbedCardTransaction) {
    // some really innovative stuff going on here
    let secretSauceMachineLearningModel = Math.floor(Math.random() * 5);
    let randomTrendType =
      spendingPatternTypes[
        Math.floor(Math.random() * spendingPatternTypes.length)
      ];

    if (secretSauceMachineLearningModel == 2) {
      publish(
        "TrendDetector/SpendingPatternDetected",
        // spending pattern detected event schema
        {
          account_id: scrubbedCardTransaction.account_id,
          type: randomTrendType,
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
