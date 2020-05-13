/**
 * card-transaction-publisher.js
 * @author Andrew Roberts
 */

import { dummyCreditCardNumbers } from "../../dummy-data";

export function createCardTransactionPublisher(publish) {
  /**
   * publish a card transaction on interval specified in .env file
   */
  function start() {
    setInterval(() => {
      publish;
    }, process.env.PUBLISH_RATE);
  }

  /**
   * create a dummy card transaction that randomizes
   * location, transaction amount, and card number
   */
  function createDummyCardTransaction() {
    let randomIndex_cardNumber = Math.floor(
      Math.random() * (dummyCreditCardNumbers.length + 1)
    );
    let randomIndex_location = Math.floor(
      Math.random() * (dummyCreditCardNumbers.length + 1)
    );
    let randomAmount = Math.floor(Math.random() * 1000);
  }

  return produce({}, (draft) => {
    draft.start = start;
  });
}
