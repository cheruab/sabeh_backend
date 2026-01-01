const GroupService = require("../services/group-service");

module.exports = (app) => {
    
    const service = new GroupService();

    app.use('/app-events',async (req,res,next) => {

        const { payload } = req.body;
        console.log("============= Group ================");
        
        console.log(payload);

         //handle subscribe events
         service.SubscribeEvents(payload);
         
       return res.status(200).json({message: 'notified!'});

    });

}