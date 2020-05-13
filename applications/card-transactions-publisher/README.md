# scrubber

Processor microservice that scrubs raw card transactions of PII.

Topic subscriptions:

- `KafkaSinkConnector/CardTransaction/[ Authorized, Settled, Declined ]`

Events published:

- ScrubbedCardTransactionAuthorized: `Scrubber/CardTransactionAuthorized`
- ScrubbedCardTransactionSettled: `Scrubber/CardTransactionSettled`
- ScrubbedCardTransactionDeclined: `Scrubber/CardTransactionDeclined`
