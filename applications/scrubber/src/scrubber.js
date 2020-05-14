/**
 * scrubber.js
 * @author Andrew Roberts
 */

import produce from "immer";
import { dummyCreditCards } from "../../dummy-data";

/**
 * returns an object that exposes methods for processing raw card transactions
 */
export function createScrubber(publish) {
  /**
   * this function returns a partially applied event handler function
   */
  const cardTransactionEventHandler = (topic, message, packet) => {
    publish(
      createTopicForScrubbedCardTransactionEvent(parse(message)),
      scrubCardTransaction(parse(message)),
      { qos: 1 }
    );
  };

  /**
   * For our silly example, let's create a map between card numbers and sanitized IDs
   * for a very very very exclusive group of 10 cardholding customers.
   * These are the only people this microservice was built for.
   */
  let cardNumberToSanitizedIdMap = {};
  for (let [index, card] of dummyCreditCards.entries()) {
    cardNumberToSanitizedIdMap[card.number] = index;
  }

  /**
   * returns a scrubbed version of the provided raw credit card transaction
   * @param {Object} cardTransaction
   * @returns {Object}
   */
  function scrubCardTransaction(cardTransaction) {
    return produce(cardTransaction, (draft) => {
      // add dummy account id
      draft.account_id = cardNumberToSanitizedIdMap[draft.card.number];
      // remove PII
      delete draft.card;
    });
  }

  /**
   * returns topic string to publish scrubbed card transaction event on
   * @param {Object} cardTransaction
   * @returns {string}
   */
  function createTopicForScrubbedCardTransactionEvent(cardTransaction) {
    // topic format: {region}/Scrubbed/CardTransaction/{status}
    // https://console.solace.cloud/event-designer/domains/32utcxr6mf2p
    return `${cardTransaction.card.address.country}/Scrubbed/CardTransaction/${cardTransaction.status}`;
  }

  /**
   * returns object representation of provided message
   * @param {*} message
   * @returns {Object}
   */
  function parse(message) {
    return JSON.parse(message.toString());
  }

  return produce({}, (draft) => {
    draft.cardTransactionEventHandler = cardTransactionEventHandler;
  });
}
