const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const groupController = require("../controllers/group.controller");

// Group CRUD
router.post("/", auth.protect, groupController.createGroup);
router.get("/", auth.protect, groupController.getUserGroups);
router.get("/join/:inviteCode", groupController.getInviteInfo);
router.post("/join/:inviteCode", auth.protect, groupController.joinViaInviteCode);

router.get("/:groupId", auth.protect, groupController.getGroupDetails);
router.put("/:groupId", auth.protect, groupController.updateGroup);
router.delete("/:groupId", auth.protect, groupController.deleteGroup);

// Member Management
router.post("/:groupId/members", auth.protect, groupController.addMembers);
router.delete("/:groupId/members/:memberId", auth.protect, groupController.removeMember);
router.post("/:groupId/leave", auth.protect, groupController.leaveGroup);
router.post("/:groupId/admins/:memberId", auth.protect, groupController.promoteAdmin);
router.delete("/:groupId/admins/:memberId", auth.protect, groupController.demoteAdmin);

// Settings (Pin & Mute)
router.post("/:groupId/pin", auth.protect, groupController.togglePinGroup);
router.post("/:groupId/mute", auth.protect, groupController.toggleMuteGroup);

// Group Messages
router.get("/:groupId/messages", auth.protect, groupController.getGroupMessages);
router.post("/:groupId/messages", auth.protect, groupController.sendGroupMessage);
router.put("/:groupId/messages/:messageId/delete", auth.protect, groupController.deleteGroupMessage);
router.put("/:groupId/messages/:messageId/pin", auth.protect, groupController.togglePinMessage);
router.post("/:groupId/messages/:messageId/react", auth.protect, groupController.toggleReaction);
router.get("/:groupId/messages/:messageId/info", auth.protect, groupController.getMessageInfo);
router.post("/:groupId/read", auth.protect, groupController.markMessagesSeen);

module.exports = router;
