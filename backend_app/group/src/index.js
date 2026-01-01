const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');
const { CreateChannel } = require("./utils");

const StartServer = async() => {
    const app = express();
    
    await databaseConnection();

    const channel = await CreateChannel();
    
    await expressApp(app, channel);

    app.listen(PORT, () => {
        console.log(`🚀 Group Service listening to port ${PORT}`);
        console.log(`📍 API available at http://localhost:${PORT}`);
    })
    .on('error', (err) => {
        console.log('❌ Server Error:', err);
        process.exit();
    })
}

StartServer();