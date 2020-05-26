# card-transactions-publisher

Node.js application that uses kafka-node to publish credit card transactions to Kafka.

Topic subscriptions:

- `KafkaSinkConnector/CardTransaction/[ Authorized, Settled, Declined ]`

Events published:

- ScrubbedCardTransactionAuthorized: `Scrubber/CardTransactionAuthorized`
- ScrubbedCardTransactionSettled: `Scrubber/CardTransactionSettled`
- ScrubbedCardTransactionDeclined: `Scrubber/CardTransactionDeclined`
