const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");
const {
  APP_SECRET,
  QUEUE_NAME,
  EXCHANGE_NAME,
  MSG_QUEUE_URL,
  CUSTOMER_BINDING_KEY,
} = require("../config");
const { SHOPPING_BINDING_KEY } = require("../config");

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

module.exports.PublishMessage = async (channel, binding_key, message) => {
  if (!channel) return;
  channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
  console.log("Sent: ", message);
};

/* ---------------------------------------------------------Message Broker -------------------------------------------------------*/

module.exports.CreateChannel = async () => {
  if (process.env.ENABLE_MQ !== "true") {
    console.log("⚠️ Message Queue disabled");
    return null;
  }

  try {
    const connection = await amqplib.connect(MSG_QUEUE_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    return channel;
  } catch (error) {
    console.error("❌ MQ connection failed:", error.message);
    return null;
  }
};

module.exports.SubscribeMessage = async (channel, service) => {
  if (!channel) return;
  const appQueue = await channel.assertQueue(QUEUE_NAME);
  channel.bindQueue(appQueue.queue, EXCHANGE_NAME, SHOPPING_BINDING_KEY);
  channel.consume(appQueue.queue, (data) => {
    console.log("received data in group service");
    console.log(data.content.toString());
    service.SubscribeEvents(data.content.toString());
    channel.ack(data);
  });
};
