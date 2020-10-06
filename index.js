const express = require("express");
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(cors());

const { resolve } = require("path");
// This is your real test secret API key.
const stripe = require("stripe")("sk_test_51HO0KCESOl6tMOVpp2c81gag8m1uxOxbYBLzYxpLc6DWl4r2FwcVE5QDuWNYXar7MSqBj4dbG1Tfapj1FQIJ0lGp00m8KFS3ZQ");
app.use(express.static("."));
app.use(express.json());
const calculateOrderAmount = items => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};
app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "inr"
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});
app.listen(4242, () => console.log('Node server listening on port 4242!'));
