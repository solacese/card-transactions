/**
 * dummy-data.js
 * A bunch of dummy data to make this demo more realistic.
 * Everything related to card transactions comes all normalized for me, right? 🤡
 */

let dummyCreditCards = [
  // 1
  {
    expYear: "2020",
    expMonth: "04",
    address: {
      region: "NJ",
      postalCode: "07110",
      streetAddress: "101 Park",
      country: "US",
      city: "Nutley",
    },
    name: "Andrew Roberts",
    cvc: "123",
    number: "5000700030005000",
  },
  // 2
  {
    expYear: "2021",
    expMonth: "05",
    address: {
      region: "NY",
      postalCode: "11215",
      streetAddress: "1000 Main Street",
      country: "US",
      city: "Brooklyn",
    },
    name: "Doug Roberts",
    cvc: "124",
    number: "5000700030005001",
  },
  // 3
  {
    expYear: "2020",
    expMonth: "02",
    address: {
      region: "OH",
      postalCode: "30005",
      streetAddress: "350 Mountain View Dr.",
      country: "US",
      city: "Dayton",
    },
    name: "Jeff Fisher",
    cvc: "363",
    number: "5000700030005002",
  },
  // 4
  {
    expYear: "2021",
    expMonth: "10",
    address: {
      region: "NY",
      postalCode: "11210",
      streetAddress: "100 Main St",
      country: "US",
      city: "New York",
    },
    name: "Joe Smith",
    cvc: "443",
    number: "5000700030005003",
  },
  // 5
  {
    expYear: "2024",
    expMonth: "08",
    address: {
      region: "WA",
      postalCode: "98101",
      streetAddress: "1 Amazon Dr",
      country: "US",
      city: "Seattle",
    },
    name: "George Bezos",
    cvc: "882",
    number: "5000700030005004",
  },
  // 6
  {
    expYear: "2023",
    expMonth: "02",
    address: {
      region: "WA",
      postalCode: "98101",
      streetAddress: "1 Amazon Dr",
      country: "US",
      city: "Seattle",
    },
    name: "John Bezos",
    cvc: "801",
    number: "5000700030005005",
  },
  // 7
  {
    expYear: "2022",
    expMonth: "09",
    address: {
      region: "WA",
      postalCode: "98101",
      streetAddress: "1 Amazon Dr",
      country: "US",
      city: "Seattle",
    },
    name: "Lucas Bezos",
    cvc: "114",
    number: "5000700030005006",
  },

  // 8
  {
    expYear: "2023",
    expMonth: "11",
    address: {
      region: "WA",
      postalCode: "98101",
      streetAddress: "1 Amazon Dr",
      country: "US",
      city: "Seattle",
    },
    name: "Max Bezos",
    cvc: "802",
    number: "5000700030005007",
  },

  // 9
  {
    expYear: "2023",
    expMonth: "12",
    address: {
      region: "CA",
      postalCode: "90001",
      streetAddress: "350 Ocean View",
      country: "US",
      city: "Los Angeles",
    },
    name: "X Æ A-12 Musk", // I hope his name breaks a credit card system some day
    cvc: "897",
    number: "5000700030005008",
  },

  // 10
  {
    expYear: "2020",
    expMonth: "05",
    address: {
      region: "VA",
      postalCode: "22903",
      streetAddress: "300 Rugby Road",
      country: "US",
      city: "Charlottesville",
    },
    name: "Jill Smith",
    cvc: "987",
    number: "5000700030005009",
  },
];

let dummyMerchants = [
  // 1
  {
    merchant: "APPLE.COM/BILL",
    country: "USA",
    region: "CA",
    postalCode: "95014",
    phoneNumber: "866-712-7753",
  },
  // 2
  {
    merchant: "Spotify",
    country: "USA",
    region: "NY",
    postalCode: "10011",
    phoneNumber: "000-000-0000",
  },
  // 3
  {
    merchant: "CHIPOTLE ONLINE",
    country: "USA",
    region: "CA",
    postalCode: "92660",
    phoneNumber: "303-595-4000",
  },
  // 4
  {
    merchant: "PETCO",
    country: "USA",
    region: "NY",
    postalCode: "11228",
    phoneNumber: "571-763-5571",
  },
  // 5
  {
    merchant: "Sam Ash",
    country: "USA",
    region: "NY",
    postalCode: "10001",
    phoneNumber: "571-763-5590",
  },
];

// based off: https://developer.intuit.com/app/developer/qbpayments/docs/develop/tutorials/process-a-credit-transaction
let dummyCardTransaction = {
  card: {
    expYear: "2017",
    expMonth: "03",
    address: {
      region: "NJ",
      postalCode: "07079",
      streetAddress: "350 Mountain View Dr.",
      country: "US",
      city: "South Orange",
    },
    name: "Pye's Cakes",
    cvc: "123",
    number: "4111111111111111",
  },
  transaction: {
    amount: "80.00",
    currency: "USD",
    location: {
      region: "NJ",
      postalCode: "07079",
      streetAddress: "350 Mountain View Dr.",
      country: "US",
      city: "South Orange",
    },
  },
  status: "AUTHORIZED",
};
