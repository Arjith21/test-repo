const cors = require('cors');
const express = require('express');
const stripe = require('stripe')('sk_test_51HO0KCESOl6tMOVpp2c81gag8m1uxOxbYBLzYxpLc6DWl4r2FwcVE5QDuWNYXar7MSqBj4dbG1Tfapj1FQIJ0lGp00m8KFS3ZQ');

const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());
app.use(cors());


app.post('/retrieve-customer', async (req, res) => {
  let customerData = {};
  // res.send('Hello world');
  const session = await stripe.checkout.sessions.retrieve(
    req.body.sessionId, { stripeAccount: `${req.body.connectedAcc}` }
  );
  console.log('session----------' + JSON.stringify(session, null, 4));
  let connectedAccCustomer
  try {
    connectedAccCustomer = await stripe.customers.retrieve(session.customer, { stripeAccount: `${req.body.connectedAcc}` });
  }
  catch ({ statusCode = 0 }) {
    if (statusCode == 404) {
      //------no customer exists
    }
  }
  console.log('connectedAccCustomer----------' + JSON.stringify(connectedAccCustomer, null, 4));
  const paymentIntent = await stripe.paymentIntents.retrieve(
    session.payment_intent, { stripeAccount: `${req.body.connectedAcc}` }
  );
  console.log('paymentIntent----------' + JSON.stringify(paymentIntent, null, 4));
  res.json(connectedAccCustomer);
});

app.post('/create-checkout-session', async (req, res) => {
  let connectedAccCustomer
  try {
    connectedAccCustomer = await stripe.customers.retrieve(req.body.customerId, { stripeAccount: `${req.body.connectedAcc}` });
  }
  catch ({ statusCode = 0 }) {
    if (statusCode == 404) {
      //------no customer exists
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_intent_data: {
      setup_future_usage: 'off_session',
    },
    ...(connectedAccCustomer ? { customer: connectedAccCustomer.id } : {}),
    payment_method_types: ['card'],
    line_items: [{
      price: `${req.body.priceId}`,
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'http://localhost:4200/ordersuccess?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:4200/',
  }
    , { stripeAccount: `${req.body.connectedAcc}` }
  );
  res.json({ id: session.id });
});

app.listen(3001, () => console.log('Listening on port 3001'));
