const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");

const app = express();

app.use(cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.use("/customer", proxy("http://localhost:8001"));
app.use("/shopping", proxy("http://localhost:8003"));
app.use("/product", proxy("http://localhost:8002"));
app.use("/group", proxy("http://localhost:8004", {
  proxyReqPathResolver: function(req) {
    const path = req.url;
    console.log(`🔀 Forwarding /group${path} to http://localhost:8004${path}`);
    return path;
  }
}));

app.listen(8000, () => {
  console.log("🚀 Gateway is Listening to Port 8000");
  console.log("📍 Routes configured:");
  console.log("   /customer -> http://localhost:8001");
  console.log("   /shopping -> http://localhost:8003");
  console.log("   /product  -> http://localhost:8002");
  console.log("   /group    -> http://localhost:8004");
});