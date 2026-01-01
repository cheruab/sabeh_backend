const { GroupModel, RewardModel } = require("../models");
const { APIError } = require("../../utils/app-errors");

class GroupRepository {
  // Generate unique 8-character code
  async GenerateUniqueCode() {
    try {
      let code;
      let exists = true;
      let attempts = 0;
      const MAX_ATTEMPTS = 10;

      while (exists && attempts < MAX_ATTEMPTS) {
        code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const existing = await GroupModel.findOne({ uniqueCode: code });
        exists = !!existing;
        attempts++;
      }

      if (attempts >= MAX_ATTEMPTS) {
        throw new Error('Could not generate unique code');
      }

      console.log('✅ Generated unique code:', code);
      return code;
    } catch (err) {
      console.error('❌ Error generating code:', err);
      throw new APIError("Unable to generate unique code: " + err.message);
    }
  }

  // Create new group
  async CreateGroup(groupData) {
    try {
      console.log('📝 Creating group with data:', JSON.stringify(groupData, null, 2));
      const group = new GroupModel(groupData);
      const savedGroup = await group.save();
      console.log('✅ Group saved to database:', savedGroup._id);
      return savedGroup;
    } catch (err) {
      console.error('❌ Error creating group:', err);
      throw new APIError("Unable to create group: " + err.message);
    }
  }

  // Find group by code
  async FindByCode(code) {
    try {
      console.log('🔍 Finding group by code:', code);
      const group = await GroupModel.findOne({ uniqueCode: code });
      if (!group) {
        console.log('❌ Group not found');
      } else {
        console.log('✅ Group found:', group._id);
      }
      return group;
    } catch (err) {
      console.error('❌ Error finding group:', err);
      throw new APIError("Unable to find group: " + err.message);
    }
  }

  // Find group by ID
  async FindById(id) {
    try {
      return await GroupModel.findById(id);
    } catch (err) {
      throw new APIError("Unable to find group: " + err.message);
    }
  }

  // Add participant to group
  async AddParticipant(groupId, participantData) {
    try {
      console.log('👥 Adding participant to group:', groupId);
      const group = await GroupModel.findByIdAndUpdate(
        groupId,
        {
          $push: { participants: participantData },
          $inc: { currentParticipants: 1 },
        },
        { new: true }
      );
      console.log('✅ Participant added, total:', group.currentParticipants);
      return group;
    } catch (err) {
      console.error('❌ Error adding participant:', err);
      throw new APIError("Unable to add participant: " + err.message);
    }
  }

  // Remove participant from group
  async RemoveParticipant(groupId, customerId) {
    try {
      return await GroupModel.findByIdAndUpdate(
        groupId,
        {
          $pull: { participants: { customerId } },
          $inc: { currentParticipants: -1 },
        },
        { new: true }
      );
    } catch (err) {
      throw new APIError("Unable to remove participant: " + err.message);
    }
  }

  // Complete group
  async CompleteGroup(groupId, completionData) {
    try {
      const group = await GroupModel.findByIdAndUpdate(
        groupId,
        {
          status: "completed",
          completedAt: new Date(),
          totalAmount: completionData.totalAmount,
          discount: completionData.discount,
          leaderReward: completionData.leaderReward,
        },
        { new: true }
      );

      // Create reward record for leader
      if (completionData.leaderReward > 0) {
        const reward = new RewardModel({
          customerId: group.leader.customerId,
          groupId: group._id,
          groupCode: group.uniqueCode,
          rewardType: "group_leader",
          amount: completionData.leaderReward,
          status: "approved",
          groupMetrics: {
            totalParticipants: group.currentParticipants,
            totalAmount: completionData.totalAmount,
            productName: group.product.name,
            discount: completionData.discount,
          },
        });

        await reward.save();
      }

      return group;
    } catch (err) {
      throw new APIError("Unable to complete group: " + err.message);
    }
  }

  // Update group status
  async UpdateGroupStatus(groupId, status) {
    try {
      return await GroupModel.findByIdAndUpdate(
        groupId,
        { status },
        { new: true }
      );
    } catch (err) {
      throw new APIError("Unable to update group status: " + err.message);
    }
  }

  // Find groups where user is leader or participant
  async FindUserGroups(customerId) {
    try {
      return await GroupModel.find({
        $or: [
          { "leader.customerId": customerId },
          { "participants.customerId": customerId },
        ],
      }).sort({ createdAt: -1 });
    } catch (err) {
      throw new APIError("Unable to find user groups: " + err.message);
    }
  }

  // Find active groups for a product
  async FindProductGroups(productId) {
    try {
      console.log('🔍 Finding active groups for product:', productId);
      const groups = await GroupModel.find({
        "product._id": productId,
        status: "active",
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });
      console.log('✅ Found groups:', groups.length);
      return groups;
    } catch (err) {
      console.error('❌ Error finding product groups:', err);
      throw new APIError("Unable to find product groups: " + err.message);
    }
  }

  // Find expired groups
  async FindExpiredGroups() {
    try {
      return await GroupModel.find({
        status: "active",
        expiresAt: { $lt: new Date() },
      });
    } catch (err) {
      throw new APIError("Unable to find expired groups: " + err.message);
    }
  }

  // Get leader statistics
  async GetLeaderStats(customerId) {
    try {
      const groups = await GroupModel.find({
        "leader.customerId": customerId,
      });

      const stats = {
        totalGroups: groups.length,
        activeGroups: groups.filter((g) => g.status === "active").length,
        completedGroups: groups.filter((g) => g.status === "completed").length,
        totalParticipants: groups.reduce((sum, g) => sum + g.currentParticipants, 0),
        totalRewards: 0,
        pendingRewards: 0,
      };

      // Get rewards
      const rewards = await RewardModel.find({ customerId });
      stats.totalRewards = rewards
        .filter((r) => r.status === "paid")
        .reduce((sum, r) => sum + r.amount, 0);
      
      stats.pendingRewards = rewards
        .filter((r) => r.status === "approved")
        .reduce((sum, r) => sum + r.amount, 0);

      return stats;
    } catch (err) {
      throw new APIError("Unable to get leader stats: " + err.message);
    }
  }
}

module.exports = GroupRepository;