const { GroupModel, RewardModel } = require("../models");
const { APIError } = require("../../utils/app-errors");
const { v4: uuidv4 } = require("uuid");

class GroupRepository {
  // Generate unique 8-character code
  async GenerateUniqueCode() {
    let code;
    let exists = true;

    while (exists) {
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      exists = await GroupModel.findOne({ uniqueCode: code });
    }

    return code;
  }

  // Create new group
  async CreateGroup(groupData) {
    try {
      const group = new GroupModel(groupData);
      return await group.save();
    } catch (err) {
      throw new APIError("Unable to create group");
    }
  }

  // Find group by code
  async FindByCode(code) {
    try {
      return await GroupModel.findOne({ uniqueCode: code });
    } catch (err) {
      throw new APIError("Unable to find group");
    }
  }

  // Find group by ID
  async FindById(id) {
    try {
      return await GroupModel.findById(id);
    } catch (err) {
      throw new APIError("Unable to find group");
    }
  }

  // Add participant to group
  async AddParticipant(groupId, participantData) {
    try {
      return await GroupModel.findByIdAndUpdate(
        groupId,
        {
          $push: { participants: participantData },
          $inc: { currentParticipants: 1 },
        },
        { new: true }
      );
    } catch (err) {
      throw new APIError("Unable to add participant");
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
      throw new APIError("Unable to remove participant");
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
      throw new APIError("Unable to complete group");
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
      throw new APIError("Unable to update group status");
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
      throw new APIError("Unable to find user groups");
    }
  }

  // Find active groups for a product
  async FindProductGroups(productId) {
    try {
      return await GroupModel.find({
        "product._id": productId,
        status: "active",
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });
    } catch (err) {
      throw new APIError("Unable to find product groups");
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
      throw new APIError("Unable to find expired groups");
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
      throw new APIError("Unable to get leader stats");
    }
  }
}

module.exports = GroupRepository;