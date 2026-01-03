const express = require("express");
const cors = require("cors");
const { group } = require("./api");

module.exports = async (app, channel) => {
  app.use(express.json());
  app.use(cors());
  
  // Root route
  app.get("/", (req, res) => {
    res.status(200).json({ message: "Group Service Running" });
  });

  // Test route (no /group prefix needed - gateway handles that)
  app.get("/whoami", (req, res) => {
    return res.status(200).json({ msg: "/group : I am Group Service" });
  });
  
  // Register all group routes (they don't need /group prefix)
  try {
    group(app, channel);
    console.log('✅ Group routes registered');
  } catch (err) {
    console.error('❌ Error registering group routes:', err);
  }

  // App events for message broker (optional)
  try {
    const appEvents = require('./api/app-events');
    if (typeof appEvents === 'function') {
      appEvents(app);
      console.log('✅ App events registered');
    }
  } catch (err) {
    console.log('ℹ️  App events not loaded (optional)');
  }

  // Error handler
  app.use((err, req, res, next) => {
    console.error('❌ Express Error:', err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });
};