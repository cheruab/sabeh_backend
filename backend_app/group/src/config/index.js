require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 8004, // Change per service: 8001, 8002, 8003, 8004
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  
  // Optional (can skip RabbitMQ for now)
  MSG_QUEUE_URL: process.env.MSG_QUEUE_URL,
  EXCHANGE_NAME: "ONLINE_SHOPPING",
  CUSTOMER_BINDING_KEY: "CUSTOMER_SERVICE",
  QUEUE_NAME: "CUSTOMER_QUEUE",
};