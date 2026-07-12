const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const friendsController = require("../controllers/friends.controller");

router.get("/", auth.protect, friendsController.getFriendsList);
router.get("/search", auth.protect, friendsController.searchByUsername);
router.get("/search-list", auth.protect, friendsController.searchUsers);
router.get("/requests", auth.protect, friendsController.getPendingRequests);
router.post("/request", auth.protect, friendsController.sendFriendRequest);
router.put("/request/:requestId", auth.protect, friendsController.respondToRequest);
router.delete("/partner/:friendId", auth.protect, friendsController.removePartner);
router.post("/signal", auth.protect, friendsController.relaySignal);

module.exports = router;
