const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");
const { messageLimiter } = require("../middleware/rateLimitMiddleware");
const {
  getInbox,
  getStaffList,
  getUnreadCount,
  getConversation,
  sendMessage,
} = require("../controllers/messageController");

const router = express.Router();

// All message routes require authentication
router.use(requireAuth);

// GET /api/messages/inbox      — conversation list
router.get("/inbox", getInbox);

// GET /api/messages/staff      — list of staff to message
router.get("/staff", getStaffList);

// GET /api/messages/unread     — unread badge count
router.get("/unread", getUnreadCount);

// GET /api/messages/:userId    — full conversation thread
router.get("/:userId", getConversation);

// POST /api/messages           — send a message
router.post(
  "/",
  messageLimiter,
  [
    body("receiver_id").isInt({ min: 1 }).withMessage("Invalid receiver"),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message cannot be empty")
      .isLength({ max: 2000 })
      .withMessage("Message too long (max 2000 chars)"),
  ],
  sendMessage,
);

module.exports = router;
