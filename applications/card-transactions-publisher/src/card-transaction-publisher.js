/**
 * card-transaction-publisher.js
 * sends a constant stream of dummy card transactions
 * @author Andrew Roberts
 */

import produce from "immer";
import { dummyCreditCards, dummyMerchants } from "../../dummy-data";

export function createCardTransactionPublisher(send) {
  /**
   * private object properties
   */
  const cardTransactionStatusList = ["Authorized", "Settled", "Declined"];

  /**
   * publish a card transaction on interval specified in .env file
   */
  function start() {
    setInterval(() => {
      send({
        topic: "card-transaction",
        message: createDummyCardTransaction(),
      });
    }, process.env.PUBLISH_RATE);
  }

  /**
   * create a dummy card transaction that randomizes
   * location, transaction amount, and card number
   */
  function createDummyCardTransaction() {
    // generate random values
    let randomCard =
      dummyCreditCards[Math.floor(Math.random() * dummyCreditCards.length)];

    let randomMerchant =
      dummyMerchants[Math.floor(Math.random() * dummyMerchants.length)];

    let randomStatus = cardTransactionStatusList[Math.floor(Math.random() * 3)];

    let randomAmount = Math.floor(Math.random() * 1000);

    // return dummy card transaction object
    return {
      amount: randomAmount,
      currency: "USD",
      status: randomStatus,
      card: randomCard,
      pos: randomMerchant,
    };
  }

  return produce({}, (draft) => {
    draft.start = start;
  });
}
