const User = require("../models/user.model");
const FriendRequest = require("../models/friendrequest.model");
const FriendMessage = require("../models/friendMessage.model");

// GET /api/friends
// Retrieve only accepted friends list
exports.getFriendsList = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find all accepted friend requests involving this user
    const acceptedRequests = await FriendRequest.find({
      status: "accepted",
      $or: [{ sender: currentUserId }, { receiver: currentUserId }]
    }).populate("sender receiver", "name username email phone level xp");

    const friends = acceptedRequests.map(reqDoc => {
      // Extract the friend (the one who is not the current user)
      const friendObj = reqDoc.sender._id.toString() === currentUserId ? reqDoc.receiver : reqDoc.sender;
      return {
        id: friendObj._id.toString(),
        fullName: friendObj.name || friendObj.username || "LMS User",
        email: friendObj.email,
        phone: friendObj.phone || "",
        avatar: (friendObj.name || friendObj.username || "LU").trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2),
        isMock: false,
        online: false, // Updated dynamically via WebSockets
        statusMessage: `Level ${friendObj.level || 1} • ${friendObj.xp || 0} XP`,
        level: friendObj.level || 1
      };
    });

    return res.status(200).json({
      success: true,
      count: friends.length,
      friends
    });
  } catch (error) {
    console.error("GET FRIENDS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load friends list"
    });
  }
};

// GET /api/friends/requests
// Retrieve pending requests received by the current user
exports.getPendingRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const pending = await FriendRequest.find({
      receiver: currentUserId,
      status: "pending"
    }).populate("sender", "name username email level xp");

    const formatted = pending.map(p => ({
      requestId: p._id.toString(),
      sender: {
        id: p.sender._id.toString(),
        fullName: p.sender.name || p.sender.username || "LMS User",
        username: p.sender.username,
        email: p.sender.email,
        avatar: (p.sender.name || p.sender.username || "LU").trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2),
        level: p.sender.level || 1
      },
      createdAt: p.createdAt
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      requests: formatted
    });
  } catch (error) {
    console.error("GET PENDING REQUESTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load pending requests"
    });
  }
};

// POST /api/friends/request
// Send a friend request by target username
exports.sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.body;
    const currentUserId = req.user.id;

    if (!username?.trim()) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const targetUser = await User.findOne({
      username: { $regex: new RegExp("^" + username.trim() + "$", "i") }
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const targetUserId = targetUser._id.toString();

    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: "You cannot add yourself" });
    }

    // Check if an request already exists
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({ success: false, message: "You are already study partners" });
      }
      if (existing.status === "pending") {
        if (existing.sender.toString() === currentUserId) {
          return res.status(400).json({ success: false, message: "Friend request is already pending approval" });
        } else {
          // If the other person sent a request already, auto-accept it!
          existing.status = "accepted";
          await existing.save();
          return res.status(200).json({
            success: true,
            message: "Study partner request auto-accepted!",
            status: "accepted"
          });
        }
      }
      // If rejected, allow re-requesting
      existing.status = "pending";
      existing.sender = currentUserId;
      existing.receiver = targetUserId;
      await existing.save();
      return res.status(200).json({ success: true, message: "Study partner request sent successfully!", status: "pending" });
    }

    // Create new request
    await FriendRequest.create({
      sender: currentUserId,
      receiver: targetUserId,
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Study partner request sent successfully!",
      status: "pending"
    });
  } catch (error) {
    console.error("SEND FRIEND REQUEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to send request" });
  }
};

// PUT /api/friends/request/:requestId
// Respond (accept/reject) to a friend request
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // "accept" or "reject"
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be 'accept' or 'reject'" });
    }

    const requestDoc = await FriendRequest.findById(requestId);
    if (!requestDoc) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (requestDoc.receiver.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: "Unauthorized action" });
    }

    if (action === "accept") {
      requestDoc.status = "accepted";
      await requestDoc.save();
      return res.status(200).json({
        success: true,
        message: "Study partner request accepted!",
        status: "accepted"
      });
    } else {
      // Reject: delete document to allow future sending
      await FriendRequest.findByIdAndDelete(requestId);
      return res.status(200).json({
        success: true,
        message: "Study partner request declined.",
        status: "rejected"
      });
    }
  } catch (error) {
    console.error("RESPOND TO REQUEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

// GET /api/friends/search?username=...
// Search by username and return partnership status relation
exports.searchByUsername = async (req, res) => {
  try {
    const { username } = req.query;
    const currentUserId = req.user.id;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username is required" });
    }

    const matchUser = await User.findOne({
      username: { $regex: new RegExp("^" + username.trim() + "$", "i") }
    }).select("name username email phone lastActiveDate level xp");

    if (!matchUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (matchUser._id.toString() === currentUserId) {
      return res.status(400).json({ success: false, message: "You cannot search for yourself" });
    }

    // Find partnership status
    const requestDoc = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: matchUser._id },
        { sender: matchUser._id, receiver: currentUserId }
      ]
    });

    let relationStatus = "none"; // none, pending_sent, pending_received, accepted
    let requestId = null;

    if (requestDoc) {
      requestId = requestDoc._id.toString();
      if (requestDoc.status === "accepted") {
        relationStatus = "accepted";
      } else if (requestDoc.status === "pending") {
        relationStatus = requestDoc.sender.toString() === currentUserId ? "pending_sent" : "pending_received";
      }
    }

    return res.status(200).json({
      success: true,
      relationStatus,
      requestId,
      friend: {
        id: matchUser._id.toString(),
        fullName: matchUser.name || matchUser.username || "LMS User",
        username: matchUser.username,
        email: matchUser.email,
        phone: matchUser.phone || "",
        avatar: (matchUser.name || matchUser.username || "LU").trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2),
        isMock: false,
        online: false,
        statusMessage: `Level ${matchUser.level || 1} • ${matchUser.xp || 0} XP`,
        level: matchUser.level || 1
      }
    });
  } catch (error) {
    console.error("SEARCH BY USERNAME ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to search user" });
  }
};

// GET /api/friends/search-list?query=...
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user.id;

    if (!query || !query.trim()) {
      return res.status(200).json({ success: true, users: [] });
    }

    const regex = new RegExp(query.trim(), "i");

    // Find matching users (excluding current user)
    const dbUsers = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: regex } },
        { name: { $regex: regex } }
      ]
    })
    .select("name username email phone lastActiveDate level xp")
    .limit(10);

    const formattedUsers = await Promise.all(dbUsers.map(async (u) => {
      const requestDoc = await FriendRequest.findOne({
        $or: [
          { sender: currentUserId, receiver: u._id },
          { sender: u._id, receiver: currentUserId }
        ]
      });

      let relationStatus = "none";
      let requestId = null;

      if (requestDoc) {
        requestId = requestDoc._id.toString();
        if (requestDoc.status === "accepted") {
          relationStatus = "accepted";
        } else if (requestDoc.status === "pending") {
          relationStatus = requestDoc.sender.toString() === currentUserId ? "pending_sent" : "pending_received";
        }
      }

      return {
        id: u._id.toString(),
        fullName: u.name || u.username || "LMS User",
        username: u.username,
        email: u.email,
        avatar: (u.name || u.username || "LU").trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2),
        level: u.level || 1,
        relationStatus,
        requestId
      };
    }));

    return res.status(200).json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error("SEARCH USERS LIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search users list"
    });
  }
};

// DELETE /api/friends/partner/:friendId
exports.removePartner = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { friendId } = req.params;

    // Delete any friend request record between the two users
    await FriendRequest.findOneAndDelete({
      $or: [
        { sender: currentUserId, receiver: friendId },
        { sender: friendId, receiver: currentUserId }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Study partner removed successfully"
    });
  } catch (error) {
    console.error("REMOVE PARTNER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove partner"
    });
  }
};

// POST /api/friends/signal
exports.relaySignal = async (req, res) => {
  try {
    const { to, signal, type } = req.body;
    return res.status(200).json({
      success: true,
      message: "Signal relayed",
      data: { from: req.user.id, to, type }
    });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

// GET /api/friends/messages/:friendId
// Fetch chat message history between current user and friend from MongoDB
exports.getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { friendId } = req.params;

    if (!friendId) {
      return res.status(400).json({ success: false, message: "Friend ID is required" });
    }

    const messages = await FriendMessage.find({
      $or: [
        { sender: currentUserId, receiver: friendId },
        { sender: friendId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      senderId: msg.sender.toString(),
      receiverId: msg.receiver.toString(),
      content: msg.content,
      timestamp: msg.createdAt ? msg.createdAt.toISOString() : new Date().toISOString(),
      status: msg.status || "read",
      ...(msg.isAttachment && {
        isAttachment: true,
        attachmentType: msg.attachmentType,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        fileMimeType: msg.fileMimeType,
        fileData: msg.fileData,
        fileUrl: msg.fileUrl,
        audioDuration: msg.audioDuration,
      })
    }));

    return res.status(200).json({
      success: true,
      count: formattedMessages.length,
      messages: formattedMessages
    });
  } catch (error) {
    console.error("GET CHAT HISTORY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load chat history"
    });
  }
};
