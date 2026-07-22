const crypto = require("crypto");
const Group = require("../models/group.model");
const GroupMessage = require("../models/groupMessage.model");
const User = require("../models/user.model");

// Helper to generate a unique 8-character invite code
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString("hex");
};

// Helper to format user for responses
const formatUserSummary = (user) => {
  if (!user) return null;
  const name = user.name || user.username || "LMS User";
  return {
    id: user._id.toString(),
    fullName: name,
    username: user.username,
    email: user.email,
    avatar: (name || "LU")
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    level: user.level || 1,
  };
};

// POST /api/groups
// Create a new Group Chat
exports.createGroup = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { groupName, groupDescription, groupAvatar, members } = req.body;

    if (!groupName || !groupName.trim()) {
      return res.status(400).json({ success: false, message: "Group name is required" });
    }

    // members array should contain target user IDs
    let memberIds = Array.isArray(members) ? members.map(m => m.toString()) : [];
    
    // Always include creator
    if (!memberIds.includes(currentUserId)) {
      memberIds.push(currentUserId);
    }

    if (memberIds.length < 3) { // Creator + at least 2 friends = 3 members minimum
      return res.status(400).json({
        success: false,
        message: "A group requires at least 2 additional friends (minimum 3 members total)",
      });
    }

    if (memberIds.length > 256) {
      return res.status(400).json({
        success: false,
        message: "Maximum members allowed in a group is 256",
      });
    }

    const inviteCode = generateInviteCode();

    const groupDoc = await Group.create({
      groupName: groupName.trim(),
      groupDescription: groupDescription ? groupDescription.trim() : "",
      groupAvatar: groupAvatar || "",
      createdBy: currentUserId,
      admins: [currentUserId],
      members: memberIds,
      inviteCode,
      lastMessage: "Group created",
      lastMessageTime: new Date(),
      lastMessageSender: currentUserId,
      isGroup: true,
    });

    const populatedGroup = await Group.findById(groupDoc._id)
      .populate("members", "name username email level avatar xp")
      .populate("admins", "name username email level avatar xp")
      .populate("createdBy", "name username email level avatar xp");

    // System message in group
    await GroupMessage.create({
      groupId: groupDoc._id,
      sender: currentUserId,
      content: `created group "${groupDoc.groupName}"`,
      messageType: "system",
    });

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      group: populatedGroup,
    });
  } catch (error) {
    console.error("CREATE GROUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to create group" });
  }
};

// GET /api/groups
// Get all groups for current user
exports.getUserGroups = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const groups = await Group.find({ members: currentUserId })
      .populate("members", "name username email level xp")
      .populate("admins", "name username email level xp")
      .populate("createdBy", "name username email level xp")
      .sort({ lastMessageTime: -1 });

    const formattedGroups = await Promise.all(
      groups.map(async (group) => {
        // Calculate unread count for user
        const unreadCount = await GroupMessage.countDocuments({
          groupId: group._id,
          sender: { $ne: currentUserId },
          "seenBy.user": { $ne: currentUserId },
          isDeleted: false,
        });

        return {
          id: group._id.toString(),
          groupName: group.groupName,
          groupDescription: group.groupDescription,
          groupAvatar: group.groupAvatar,
          createdBy: group.createdBy._id.toString(),
          admins: group.admins.map((a) => a._id.toString()),
          members: group.members.map((m) => formatUserSummary(m)),
          inviteCode: group.inviteCode,
          lastMessage: group.lastMessage || "",
          lastMessageTime: group.lastMessageTime ? group.lastMessageTime.toISOString() : group.createdAt.toISOString(),
          isGroup: true,
          isPinned: group.pinnedBy?.includes(currentUserId) || false,
          isMuted: group.mutedBy?.includes(currentUserId) || false,
          unreadCount,
          createdAt: group.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      groups: formattedGroups,
    });
  } catch (error) {
    console.error("GET USER GROUPS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch groups" });
  }
};

// GET /api/groups/:groupId
// Get details of a single group
exports.getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId)
      .populate("members", "name username email level xp")
      .populate("admins", "name username email level xp")
      .populate("createdBy", "name username email level xp");

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.members.some((m) => m._id.toString() === currentUserId)) {
      return res.status(403).json({ success: false, message: "You are not a member of this group" });
    }

    return res.status(200).json({
      success: true,
      group: {
        id: group._id.toString(),
        groupName: group.groupName,
        groupDescription: group.groupDescription,
        groupAvatar: group.groupAvatar,
        createdBy: group.createdBy._id.toString(),
        admins: group.admins.map((a) => a._id.toString()),
        members: group.members.map((m) => formatUserSummary(m)),
        inviteCode: group.inviteCode,
        lastMessage: group.lastMessage,
        lastMessageTime: group.lastMessageTime,
        isGroup: true,
        isPinned: group.pinnedBy?.includes(currentUserId) || false,
        isMuted: group.mutedBy?.includes(currentUserId) || false,
        createdAt: group.createdAt,
      },
    });
  } catch (error) {
    console.error("GET GROUP DETAILS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch group details" });
  }
};

// PUT /api/groups/:groupId
// Update group name, description, avatar
exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;
    const { groupName, groupDescription, groupAvatar } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.admins.map((a) => a.toString()).includes(currentUserId)) {
      return res.status(403).json({ success: false, message: "Only admins can edit group info" });
    }

    if (groupName !== undefined && groupName.trim()) {
      group.groupName = groupName.trim();
    }
    if (groupDescription !== undefined) {
      group.groupDescription = groupDescription.trim();
    }
    if (groupAvatar !== undefined) {
      group.groupAvatar = groupAvatar;
    }

    await group.save();

    // Create system message
    await GroupMessage.create({
      groupId: group._id,
      sender: currentUserId,
      content: `updated the group settings`,
      messageType: "system",
    });

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "name username email level xp")
      .populate("admins", "name username email level xp");

    return res.status(200).json({
      success: true,
      message: "Group updated successfully",
      group: updatedGroup,
    });
  } catch (error) {
    console.error("UPDATE GROUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update group" });
  }
};

// POST /api/groups/:groupId/members
// Add members to group
exports.addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;
    const { newMembers } = req.body; // array of user IDs

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.admins.map((a) => a.toString()).includes(currentUserId)) {
      return res.status(403).json({ success: false, message: "Only admins can add members" });
    }

    const currentMemberIds = group.members.map((m) => m.toString());
    const addedIds = [];

    newMembers.forEach((id) => {
      const sId = id.toString();
      if (!currentMemberIds.includes(sId)) {
        group.members.push(sId);
        addedIds.push(sId);
      }
    });

    if (group.members.length > 256) {
      return res.status(400).json({ success: false, message: "Group cannot exceed 256 members" });
    }

    await group.save();

    // Create system message
    const addedUsers = await User.find({ _id: { $in: addedIds } }).select("name username");
    const addedNames = addedUsers.map((u) => u.name || u.username).join(", ");

    if (addedNames) {
      await GroupMessage.create({
        groupId: group._id,
        sender: currentUserId,
        content: `added ${addedNames}`,
        messageType: "system",
      });
    }

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "name username email level xp")
      .populate("admins", "name username email level xp");

    return res.status(200).json({
      success: true,
      message: "Members added successfully",
      group: updatedGroup,
      addedIds,
    });
  } catch (error) {
    console.error("ADD MEMBERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to add members" });
  }
};

// DELETE /api/groups/:groupId/members/:memberId
// Remove member from group
exports.removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const isAdmin = group.admins.map((a) => a.toString()).includes(currentUserId);
    if (!isAdmin && currentUserId !== memberId) {
      return res.status(403).json({ success: false, message: "Only admins can remove other members" });
    }

    group.members = group.members.filter((m) => m.toString() !== memberId);
    group.admins = group.admins.filter((a) => a.toString() !== memberId);

    await group.save();

    const removedUser = await User.findById(memberId).select("name username");
    const removedName = removedUser ? (removedUser.name || removedUser.username) : "a member";

    await GroupMessage.create({
      groupId: group._id,
      sender: currentUserId,
      content: currentUserId === memberId ? `left the group` : `removed ${removedName}`,
      messageType: "system",
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("REMOVE MEMBER ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to remove member" });
  }
};

// POST /api/groups/:groupId/leave
// Leave group
exports.leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    group.members = group.members.filter((m) => m.toString() !== currentUserId);
    group.admins = group.admins.filter((a) => a.toString() !== currentUserId);

    // If no admins left but members exist, promote the first member
    if (group.admins.length === 0 && group.members.length > 0) {
      group.admins.push(group.members[0]);
    }

    await group.save();

    const currentUserDoc = await User.findById(currentUserId).select("name username");
    const name = currentUserDoc ? (currentUserDoc.name || currentUserDoc.username) : "A member";

    await GroupMessage.create({
      groupId: group._id,
      sender: currentUserId,
      content: `${name} left the group`,
      messageType: "system",
    });

    return res.status(200).json({
      success: true,
      message: "You have left the group",
    });
  } catch (error) {
    console.error("LEAVE GROUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to leave group" });
  }
};

// DELETE /api/groups/:groupId
// Delete group (admin/creator only)
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.admins.map((a) => a.toString()).includes(currentUserId) && group.createdBy.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: "Only group admins can delete the group" });
    }

    await Group.findByIdAndDelete(groupId);
    await GroupMessage.deleteMany({ groupId });

    return res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("DELETE GROUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to delete group" });
  }
};

// POST /api/groups/:groupId/admins/:memberId
// Promote member to admin
exports.promoteAdmin = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.admins.map((a) => a.toString()).includes(currentUserId)) {
      return res.status(403).json({ success: false, message: "Only admins can promote other members" });
    }

    if (!group.members.map((m) => m.toString()).includes(memberId)) {
      return res.status(400).json({ success: false, message: "User is not a member of this group" });
    }

    if (!group.admins.map((a) => a.toString()).includes(memberId)) {
      group.admins.push(memberId);
      await group.save();
    }

    const promotedUser = await User.findById(memberId).select("name username");
    const name = promotedUser ? (promotedUser.name || promotedUser.username) : "A member";

    await GroupMessage.create({
      groupId: group._id,
      sender: currentUserId,
      content: `promoted ${name} to admin`,
      messageType: "system",
    });

    return res.status(200).json({
      success: true,
      message: "Member promoted to admin",
    });
  } catch (error) {
    console.error("PROMOTE ADMIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to promote admin" });
  }
};

// DELETE /api/groups/:groupId/admins/:memberId
// Demote admin to member
exports.demoteAdmin = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.admins.map((a) => a.toString()).includes(currentUserId)) {
      return res.status(403).json({ success: false, message: "Only admins can demote other admins" });
    }

    group.admins = group.admins.filter((a) => a.toString() !== memberId);
    await group.save();

    const demotedUser = await User.findById(memberId).select("name username");
    const name = demotedUser ? (demotedUser.name || demotedUser.username) : "An admin";

    await GroupMessage.create({
      groupId: group._id,
      sender: currentUserId,
      content: `dismissed ${name} as admin`,
      messageType: "system",
    });

    return res.status(200).json({
      success: true,
      message: "Admin demoted to member",
    });
  } catch (error) {
    console.error("DEMOTE ADMIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to demote admin" });
  }
};

// POST /api/groups/:groupId/pin
// Toggle pin group for current user
exports.togglePinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const pinnedIndex = group.pinnedBy.indexOf(currentUserId);
    if (pinnedIndex > -1) {
      group.pinnedBy.splice(pinnedIndex, 1);
    } else {
      group.pinnedBy.push(currentUserId);
    }

    await group.save();

    return res.status(200).json({
      success: true,
      isPinned: group.pinnedBy.includes(currentUserId),
    });
  } catch (error) {
    console.error("TOGGLE PIN GROUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to toggle pin" });
  }
};

// POST /api/groups/:groupId/mute
// Toggle mute group notifications for current user
exports.toggleMuteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    const mutedIndex = group.mutedBy.indexOf(currentUserId);
    if (mutedIndex > -1) {
      group.mutedBy.splice(mutedIndex, 1);
    } else {
      group.mutedBy.push(currentUserId);
    }

    await group.save();

    return res.status(200).json({
      success: true,
      isMuted: group.mutedBy.includes(currentUserId),
    });
  } catch (error) {
    console.error("TOGGLE MUTE GROUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to toggle mute" });
  }
};

// GET /api/groups/join/:inviteCode
// Get group metadata for invite link
exports.getInviteInfo = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const group = await Group.findOne({ inviteCode })
      .populate("createdBy", "name username")
      .select("groupName groupDescription groupAvatar members createdAt");

    if (!group) {
      return res.status(404).json({ success: false, message: "Invalid invite link" });
    }

    return res.status(200).json({
      success: true,
      group: {
        id: group._id.toString(),
        groupName: group.groupName,
        groupDescription: group.groupDescription,
        groupAvatar: group.groupAvatar,
        memberCount: group.members.length,
        createdBy: group.createdBy ? (group.createdBy.name || group.createdBy.username) : "User",
      },
    });
  } catch (error) {
    console.error("GET INVITE INFO ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load invite info" });
  }
};

// POST /api/groups/join/:inviteCode
// Join group via invite code
exports.joinViaInviteCode = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ success: false, message: "Invalid or expired invite link" });
    }

    if (group.members.map((m) => m.toString()).includes(currentUserId)) {
      return res.status(200).json({
        success: true,
        message: "You are already a member of this group",
        group,
      });
    }

    if (group.members.length >= 256) {
      return res.status(400).json({ success: false, message: "Group is full (max 256 members)" });
    }

    group.members.push(currentUserId);
    await group.save();

    const userDoc = await User.findById(currentUserId).select("name username");
    const name = userDoc ? (userDoc.name || userDoc.username) : "A new member";

    await GroupMessage.create({
      groupId: group._id,
      sender: currentUserId,
      content: `${name} joined via invite link`,
      messageType: "system",
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("members", "name username email level xp")
      .populate("admins", "name username email level xp");

    return res.status(200).json({
      success: true,
      message: `Joined group "${group.groupName}" successfully!`,
      group: populatedGroup,
    });
  } catch (error) {
    console.error("JOIN VIA INVITE ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to join group" });
  }
};

// GET /api/groups/:groupId/messages
// Fetch group chat history
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.members.map((m) => m.toString()).includes(currentUserId)) {
      return res.status(403).json({ success: false, message: "You are not a member of this group" });
    }

    const messages = await GroupMessage.find({
      groupId,
      deletedFor: { $ne: currentUserId },
    })
      .populate("sender", "name username email avatar level")
      .sort({ createdAt: 1 })
      .lean();

    const totalGroupMembers = group.members.length;

    const formattedMessages = messages.map((msg) => {
      // Calculate delivery tick status for sender
      const isSender = msg.sender._id.toString() === currentUserId;
      let status = "sent";

      if (isSender) {
        // Exclude sender from receipt checks
        const otherMembersCount = Math.max(1, totalGroupMembers - 1);
        const deliveredCount = (msg.deliveredTo || []).filter(d => d.user.toString() !== currentUserId).length;
        const seenCount = (msg.seenBy || []).filter(s => s.user.toString() !== currentUserId).length;

        if (seenCount >= otherMembersCount) {
          status = "read"; // Blue tick
        } else if (deliveredCount >= otherMembersCount) {
          status = "delivered"; // Double gray tick
        } else {
          status = "sent"; // Single tick
        }
      }

      return {
        id: msg._id.toString(),
        groupId: msg.groupId.toString(),
        senderId: msg.sender._id.toString(),
        senderName: msg.sender.name || msg.sender.username || "LMS User",
        senderAvatar: (msg.sender.name || msg.sender.username || "LU")
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        content: msg.content,
        messageType: msg.messageType,
        timestamp: msg.createdAt ? msg.createdAt.toISOString() : new Date().toISOString(),
        status,
        isAttachment: msg.isAttachment || false,
        attachmentType: msg.attachmentType,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileMimeType: msg.fileMimeType,
        fileData: msg.fileData,
        fileUrl: msg.fileUrl,
        audioDuration: msg.audioDuration,
        replyTo: msg.replyTo,
        forwardedFrom: msg.forwardedFrom ? msg.forwardedFrom.toString() : null,
        reactions: (msg.reactions || []).map((r) => ({ user: r.user.toString(), emoji: r.emoji })),
        isDeleted: msg.isDeleted || false,
        isPinned: msg.isPinned || false,
        seenByCount: (msg.seenBy || []).length,
        deliveredToCount: (msg.deliveredTo || []).length,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMessages.length,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("GET GROUP MESSAGES ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load group messages" });
  }
};

// POST /api/groups/:groupId/messages
// Send group message via REST
exports.sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;
    const {
      content,
      messageType,
      isAttachment,
      attachmentType,
      fileName,
      fileSize,
      fileMimeType,
      fileData,
      fileUrl,
      audioDuration,
      replyTo,
    } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.members.map((m) => m.toString()).includes(currentUserId)) {
      return res.status(403).json({ success: false, message: "You are not a member of this group" });
    }

    const newMsg = await GroupMessage.create({
      groupId,
      sender: currentUserId,
      content: content || "",
      messageType: messageType || (isAttachment ? attachmentType || "document" : "text"),
      isAttachment: Boolean(isAttachment),
      attachmentType,
      fileName,
      fileSize,
      fileMimeType,
      fileData,
      fileUrl,
      audioDuration,
      replyTo,
      deliveredTo: [{ user: currentUserId, deliveredAt: new Date() }],
      seenBy: [{ user: currentUserId, seenAt: new Date() }],
    });

    // Update group last message
    group.lastMessage = isAttachment ? `[${attachmentType || "File"}] ${fileName || ""}` : content;
    group.lastMessageTime = new Date();
    group.lastMessageSender = currentUserId;
    await group.save();

    const populatedMsg = await GroupMessage.findById(newMsg._id).populate("sender", "name username email level");

    return res.status(201).json({
      success: true,
      message: {
        id: populatedMsg._id.toString(),
        groupId: populatedMsg.groupId.toString(),
        senderId: populatedMsg.sender._id.toString(),
        senderName: populatedMsg.sender.name || populatedMsg.sender.username,
        content: populatedMsg.content,
        messageType: populatedMsg.messageType,
        timestamp: populatedMsg.createdAt.toISOString(),
        status: "sent",
        isAttachment: populatedMsg.isAttachment,
        attachmentType: populatedMsg.attachmentType,
        fileName: populatedMsg.fileName,
        fileSize: populatedMsg.fileSize,
        fileMimeType: populatedMsg.fileMimeType,
        fileData: populatedMsg.fileData,
        fileUrl: populatedMsg.fileUrl,
        audioDuration: populatedMsg.audioDuration,
        replyTo: populatedMsg.replyTo,
      },
    });
  } catch (error) {
    console.error("SEND GROUP MESSAGE ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// PUT /api/groups/:groupId/messages/:messageId/delete
// Delete message (for me or for everyone)
exports.deleteGroupMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const currentUserId = req.user.id;
    const { deleteForEveryone } = req.body;

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (deleteForEveryone) {
      if (message.sender.toString() !== currentUserId) {
        const group = await Group.findById(groupId);
        if (!group || !group.admins.map((a) => a.toString()).includes(currentUserId)) {
          return res.status(403).json({ success: false, message: "Only sender or group admin can delete for everyone" });
        }
      }
      message.isDeleted = true;
      message.content = "This message was deleted";
      await message.save();
    } else {
      if (!message.deletedFor.includes(currentUserId)) {
        message.deletedFor.push(currentUserId);
        await message.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: deleteForEveryone ? "Message deleted for everyone" : "Message deleted for you",
    });
  } catch (error) {
    console.error("DELETE GROUP MESSAGE ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to delete message" });
  }
};

// PUT /api/groups/:groupId/messages/:messageId/pin
// Toggle pin message
exports.togglePinMessage = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group || !group.members.map((m) => m.toString()).includes(currentUserId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    message.isPinned = !message.isPinned;
    await message.save();

    return res.status(200).json({
      success: true,
      isPinned: message.isPinned,
    });
  } catch (error) {
    console.error("TOGGLE PIN MESSAGE ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to pin message" });
  }
};

// POST /api/groups/:groupId/messages/:messageId/react
// Add or update reaction
exports.toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;
    const { emoji } = req.body;

    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const existingIndex = message.reactions.findIndex((r) => r.user.toString() === currentUserId);
    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        // Toggle off if same emoji clicked again
        message.reactions.splice(existingIndex, 1);
      } else {
        // Update emoji
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ user: currentUserId, emoji });
    }

    await message.save();

    return res.status(200).json({
      success: true,
      reactions: message.reactions.map((r) => ({ user: r.user.toString(), emoji: r.emoji })),
    });
  } catch (error) {
    console.error("TOGGLE REACTION ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to react to message" });
  }
};

// GET /api/groups/:groupId/messages/:messageId/info
// Message Info: Delivered To and Seen By per member with timestamps
exports.getMessageInfo = async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const currentUserId = req.user.id;

    const group = await Group.findById(groupId).populate("members", "name username email level avatar");
    if (!group || !group.members.some((m) => m._id.toString() === currentUserId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const message = await GroupMessage.findById(messageId)
      .populate("deliveredTo.user", "name username email level avatar")
      .populate("seenBy.user", "name username email level avatar");

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const deliveredList = (message.deliveredTo || []).map((d) => ({
      user: formatUserSummary(d.user),
      timestamp: d.deliveredAt ? d.deliveredAt.toISOString() : null,
    }));

    const seenList = (message.seenBy || []).map((s) => ({
      user: formatUserSummary(s.user),
      timestamp: s.seenAt ? s.seenAt.toISOString() : null,
    }));

    return res.status(200).json({
      success: true,
      message: {
        id: message._id.toString(),
        content: message.content,
        timestamp: message.createdAt.toISOString(),
        isAttachment: message.isAttachment,
        attachmentType: message.attachmentType,
        fileName: message.fileName,
      },
      deliveredTo: deliveredList,
      seenBy: seenList,
      totalGroupMembers: group.members.length,
    });
  } catch (error) {
    console.error("GET MESSAGE INFO ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load message info" });
  }
};

// POST /api/groups/:groupId/read
// Mark all messages in group as seen by current user
exports.markMessagesSeen = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user.id;

    const now = new Date();

    // Find messages in group where currentUserId is not in seenBy
    await GroupMessage.updateMany(
      {
        groupId,
        sender: { $ne: currentUserId },
        "seenBy.user": { $ne: currentUserId },
      },
      {
        $push: { seenBy: { user: currentUserId, seenAt: now } },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Group messages marked as seen",
    });
  } catch (error) {
    console.error("MARK MESSAGES SEEN ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to mark messages as seen" });
  }
};
