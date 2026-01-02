const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use("/customer", proxy("http://localhost:8001"));
app.use("/shopping", proxy("http://localhost:8003"));
app.use("/product", proxy("http://localhost:8002"));
app.use("/group", proxy("http://localhost:8004"));

// ✅ Gateway listens on Railway's PORT (8080)
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Gateway is Listening to Port ${PORT}`);
  console.log("📍 Routes configured");
});