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

router.use(requireAuth);

router.get("/inbox", getInbox);

router.get("/staff", getStaffList);

router.get("/unread", getUnreadCount);

router.get("/:userId", getConversation);

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
