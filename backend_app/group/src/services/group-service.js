const { GroupRepository } = require("../database");
const { FormateData } = require("../utils");
const { APIError } = require("../utils/app-errors");

class GroupService {
  constructor() {
    this.repository = new GroupRepository();
  }

  // Create a new group
  async CreateGroup(customerId, groupData) {
    try {
      const {
        productId,
        productName,
        productBanner,
        regularPrice,
        groupPrice,
        weight,
        category,
        minParticipants,
        maxParticipants,
        durationHours,
        deliveryAddress,
        leaderName,
        leaderPhone,
      } = groupData;

      // Generate unique code
      const uniqueCode = await this.repository.GenerateUniqueCode();

      // Calculate expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (durationHours || 72));

      // Prepare delivery address - use the actual address from groupData
      const finalDeliveryAddress = deliveryAddress || {
        type: 'custom',
        completeAddress: 'Address not provided',
      };

      console.log('Creating group with delivery address:', finalDeliveryAddress);

      const group = await this.repository.CreateGroup({
        uniqueCode,
        leader: {
          customerId,
          name: leaderName,
          phone: leaderPhone,
        },
        product: {
          _id: productId,
          name: productName,
          banner: productBanner,
          regular_price: regularPrice,
          group_price: groupPrice,
          weight,
          category,
        },
        minParticipants: minParticipants || 5,
        maxParticipants: maxParticipants || 20,
        expiresAt,
        deliveryAddress: finalDeliveryAddress,
        currentParticipants: 1,
        participants: [
          {
            customerId,
            name: leaderName,
            phone: leaderPhone,
            quantity: 1,
          },
        ],
      });

      console.log('Group created successfully with address:', group.deliveryAddress);

      return FormateData(group);
    } catch (err) {
      console.error('CreateGroup error:', err);
      throw new APIError("Unable to create group");
    }
  }

  // Join existing group
  async JoinGroup(customerId, groupCode, userData) {
    try {
      const { name, phone, quantity } = userData;

      const group = await this.repository.FindByCode(groupCode);

      if (!group) {
        throw new APIError("Group not found");
      }

      if (group.status !== "active") {
        throw new APIError("Group is not active");
      }

      if (group.isExpired()) {
        await this.repository.UpdateGroupStatus(group._id, "expired");
        throw new APIError("Group has expired");
      }

      if (group.isFull()) {
        throw new APIError("Group is full");
      }

      // Check if user already joined
      const alreadyJoined = group.participants.some(
        (p) => p.customerId === customerId
      );

      if (alreadyJoined) {
        throw new APIError("You have already joined this group");
      }

      // Add participant
      const updatedGroup = await this.repository.AddParticipant(
        group._id,
        {
          customerId,
          name,
          phone,
          quantity: quantity || 1,
        }
      );

      // Check if minimum reached and auto-complete
      if (updatedGroup.isMinimumReached() && updatedGroup.isFull()) {
        await this.CompleteGroup(updatedGroup._id);
      }

      return FormateData(updatedGroup);
    } catch (err) {
      throw err;
    }
  }

  // Leave group (before completion)
  async LeaveGroup(customerId, groupId) {
    try {
      const group = await this.repository.FindById(groupId);

      if (!group) {
        throw new APIError("Group not found");
      }

      if (group.status !== "active") {
        throw new APIError("Cannot leave this group");
      }

      // Leader cannot leave
      if (group.leader.customerId === customerId) {
        throw new APIError("Group leader cannot leave. Cancel the group instead.");
      }

      const updatedGroup = await this.repository.RemoveParticipant(
        groupId,
        customerId
      );

      return FormateData(updatedGroup);
    } catch (err) {
      throw err;
    }
  }

  // Complete group and create order
  async CompleteGroup(groupId) {
    try {
      const group = await this.repository.FindById(groupId);

      if (!group.isMinimumReached()) {
        throw new APIError("Minimum participants not reached");
      }

      // Calculate totals
      const totalAmount = group.participants.reduce((sum, p) => {
        return sum + (p.quantity * group.product.group_price);
      }, 0);

      const discount = group.participants.reduce((sum, p) => {
        return sum + (p.quantity * (group.product.regular_price - group.product.group_price));
      }, 0);

      // Calculate leader reward
      group.calculateLeaderReward();

      // Update group
      const updatedGroup = await this.repository.CompleteGroup(groupId, {
        totalAmount,
        discount,
        leaderReward: group.leaderReward,
      });

      // Create order (this will be handled by shopping service)
      // For now, just return the completed group

      return FormateData(updatedGroup);
    } catch (err) {
      throw err;
    }
  }

  // Get group details
  async GetGroupDetails(groupCode) {
    try {
      const group = await this.repository.FindByCode(groupCode);
      
      if (!group) {
        throw new APIError("Group not found");
      }

      console.log('Retrieved group with delivery address:', group.deliveryAddress);

      return FormateData(group);
    } catch (err) {
      throw err;
    }
  }

  // Get user's groups (as leader or participant)
  async GetUserGroups(customerId) {
    try {
      const groups = await this.repository.FindUserGroups(customerId);
      return FormateData(groups);
    } catch (err) {
      throw err;
    }
  }

  // Get active groups for a product
  async GetProductGroups(productId) {
    try {
      const groups = await this.repository.FindProductGroups(productId);
      console.log(`Found ${groups.length} groups for product ${productId}`);
      
      // Log delivery addresses for debugging
      groups.forEach(group => {
        console.log(`Group ${group.uniqueCode} delivery address:`, group.deliveryAddress);
      });
      
      return FormateData(groups);
    } catch (err) {
      throw err;
    }
  }

  // Cancel group (leader only, before completion)
  async CancelGroup(customerId, groupId) {
    try {
      const group = await this.repository.FindById(groupId);

      if (!group) {
        throw new APIError("Group not found");
      }

      if (group.leader.customerId !== customerId) {
        throw new APIError("Only group leader can cancel");
      }

      if (group.status !== "active") {
        throw new APIError("Cannot cancel this group");
      }

      const cancelledGroup = await this.repository.UpdateGroupStatus(
        groupId,
        "cancelled"
      );

      return FormateData(cancelledGroup);
    } catch (err) {
      throw err;
    }
  }

  // Get leader dashboard stats
  async GetLeaderStats(customerId) {
    try {
      const stats = await this.repository.GetLeaderStats(customerId);
      return FormateData(stats);
    } catch (err) {
      throw err;
    }
  }

  // Process expired groups (cron job)
  async ProcessExpiredGroups() {
    try {
      const expiredGroups = await this.repository.FindExpiredGroups();
      
      for (const group of expiredGroups) {
        if (group.isMinimumReached()) {
          // Auto-complete if minimum reached
          await this.CompleteGroup(group._id);
        } else {
          // Mark as expired
          await this.repository.UpdateGroupStatus(group._id, "expired");
        }
      }

      return FormateData({ processed: expiredGroups.length });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = GroupService;