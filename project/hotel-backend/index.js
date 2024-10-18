require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRouter = require("./src/routes/user");
const adminRouter = require("./src/routes/admin");
const cors = require("cors");
const path = require("path");
const mongoString = process.env.DATABASE_URL;
const secret_key = process.env.SECRET_KEY;
const stripe = require("stripe")(secret_key);
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.post("/api/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  const customer = await stripe.customers.create();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "usd",
    customer: customer.id,
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    customer: customer.id,
    paymentIntentId: paymentIntent.id,
  });
});
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.listen(8001);
