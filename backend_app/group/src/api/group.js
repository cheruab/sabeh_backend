const GroupService = require("../services/group-service");
const UserAuth = require("./middlewares/auth");

module.exports = (app) => {
  const service = new GroupService();

  // Create a new group (Leader)
  app.post("/create", UserAuth, async (req, res, next) => {
    try {
      console.log('📝 Create group request received');
      console.log('User ID:', req.user._id);
      console.log('Group Data:', req.body);
      
      const { _id } = req.user;
      const groupData = req.body;

      const { data } = await service.CreateGroup(_id, groupData);

      console.log('✅ Group created successfully:', data.uniqueCode);
      res.status(201).json(data);
    } catch (err) {
      console.error('❌ Create group error:', err);
      res.status(400).json({ error: err.message });
    }
  });

  // Get group details by code
  app.get("/:code", async (req, res, next) => {
    try {
      const { code } = req.params;
      console.log('🔍 Getting group details for code:', code);

      const { data } = await service.GetGroupDetails(code);

      res.status(200).json(data);
    } catch (err) {
      console.error('❌ Get group error:', err);
      res.status(404).json({ error: err.message });
    }
  });

  // Join a group
  app.post("/:code/join", UserAuth, async (req, res, next) => {
    try {
      console.log('👥 Join group request');
      const { _id } = req.user;
      const { code } = req.params;
      const userData = req.body;

      const { data } = await service.JoinGroup(_id, code, userData);

      console.log('✅ User joined group successfully');
      res.status(200).json(data);
    } catch (err) {
      console.error('❌ Join group error:', err);
      res.status(400).json({ error: err.message });
    }
  });

  // Leave a group
  app.post("/:id/leave", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { id } = req.params;

      const { data } = await service.LeaveGroup(_id, id);

      res.status(200).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Cancel a group (leader only)
  app.post("/:id/cancel", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { id } = req.params;

      const { data } = await service.CancelGroup(_id, id);

      res.status(200).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get user's groups (as leader or participant)
  app.get("/user/my-groups", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;

      const { data } = await service.GetUserGroups(_id);

      res.status(200).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get active groups for a product
  app.get("/product/:productId", async (req, res, next) => {
    try {
      const { productId } = req.params;
      console.log('🔍 Getting groups for product:', productId);

      const { data } = await service.GetProductGroups(productId);

      console.log('✅ Found groups:', data.length);
      res.status(200).json(data);
    } catch (err) {
      console.error('❌ Get product groups error:', err);
      res.status(400).json({ error: err.message });
    }
  });

  // Get leader dashboard stats
  app.get("/leader/stats", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;

      const { data } = await service.GetLeaderStats(_id);

      res.status(200).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Get leader rewards
  app.get("/leader/rewards", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const RewardModel = require("../database/models/Reward");

      const rewards = await RewardModel.find({ customerId: _id })
        .sort({ createdAt: -1 });

      res.status(200).json(rewards);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Manual complete group (for testing/admin)
  app.post("/:id/complete", UserAuth, async (req, res, next) => {
    try {
      const { id } = req.params;

      const { data } = await service.CompleteGroup(id);

      res.status(200).json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Process expired groups (cron endpoint - should be protected in production)
  app.post("/cron/process-expired", async (req, res, next) => {
    try {
      const { data } = await service.ProcessExpiredGroups();

      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};