/**
 * scrubber.js
 * @author Andrew Roberts
 */

import produce from "immer";
import { dummyCardNumbers } from "../../dummy-data";

/**
 * returns an object that exposes methods for processing raw card transactions
 */
export function createScrubber(publish) {
  /**
   * this function returns a partially applied event handler function
   */
  const createCardTransactionEventHandler = (topic) => (event) =>
    publish(scrubCardTransaction(parse(event)));

  /**
   * For our silly example, let's create a map between card numbers and sanitized IDs
   * for a very very very exclusive group of 10 cardholding customers.
   * These are the only people this microservice was built for.
   */
  let cardNumberToSanitizedIdMap = {};
  for (let [index, CardNumber] of dummyCardNumbers.entries()) {
    cardNumberToSanitizedIdMap[CardNumber] = index;
  }

  /**
   * returns a scrubbed version of the provided raw credit card transaction
   * @param {Object} cardTransaction
   * @returns {Object}
   */
  function scrubCardTransaction(cardTransaction) {}

  /**
   * returns object representation of provided event
   * @param {*} event
   * @returns {Object}
   */
  function parse(event) {
    return JSON.parse(event.message);
  }

  return produce({}, (draft) => {
    draft.createCardTransactionEventHandler = createCardTransactionEventHandler;
  });
}
