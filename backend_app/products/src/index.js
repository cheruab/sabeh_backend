const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');

const StartServer = async() => {
    const app = express();
    
    await databaseConnection();

    // ✅ Skip RabbitMQ - pass null
    const channel = null;
    
    await expressApp(app, channel);

    app.listen(PORT, () => {
        console.log(`✅ Products service listening to port ${PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit();
    })
}

StartServer();