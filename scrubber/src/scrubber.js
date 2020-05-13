/**
 * scrubber.js
 * @author Andrew Roberts
 */

import produce from "immer";
import { dummyCreditCardNumbers } from "../../dummy-data";

/**
 * returns an object that exposes methods for processing raw card transactions
 */
export function createScrubber() {
  /**
   * For our silly example, let's create a map between card numbers and sanitized IDs
   * for a very very very exclusive group of 10 cardholding customers.
   * These are the only people this microservice was built for.
   */
  let creditCardNumberToSanitizedIdMap = {};
  for (let [index, creditCardNumber] of dummyCreditCardNumbers.entries()) {
    creditCardNumberToSanitizedIdMap[creditCardNumber] = index;
  }

  /**
   * returns object representation of provided card transaction event
   * @param {*} event
   * @returns {Object}
   */
  function parseCardTransactionEvent(event) {
    return JSON.parse(event.message);
  }

  /**
   * accepts
   * @param {Object} cardTransaction
   * @returns {Object}
   */
  function scrubCardTransaction(cardTransaction) {}

  return produce({}, (draft) => {
    draft.parseCardTransactionEvent = parseCardTransactionEvent;
    draft.scrubCardTransaction = scrubCardTransaction;
  });
}
