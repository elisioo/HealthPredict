const { validationResult } = require("express-validator");
const MessageModel = require("../models/messageModel");

/**
 * GET /api/messages/inbox
 * Returns the list of conversation contacts with last message + unread count.
 */
const getInbox = async (req, res) => {
  try {
    const inbox = await MessageModel.getInbox(req.user.user_id);
    return res.json({ inbox });
  } catch (err) {
    console.error("[getInbox]", err);
    return res.status(500).json({ error: "Failed to load inbox" });
  }
};

/**
 * GET /api/messages/staff
 * Returns list of staff/admin users (for patients to pick a recipient).
 */
const getStaffList = async (req, res) => {
  try {
    const staff = await MessageModel.getStaffList();
    return res.json({ staff });
  } catch (err) {
    console.error("[getStaffList]", err);
    return res.status(500).json({ error: "Failed to load staff list" });
  }
};

/**
 * GET /api/messages/unread
 * Returns the unread message count for the logged-in user.
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await MessageModel.unreadCount(req.user.user_id);
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get unread count" });
  }
};

/**
 * GET /api/messages/:userId
 * Returns full conversation thread between the current user and :userId.
 * Also marks incoming messages as read.
 */
const getConversation = async (req, res) => {
  const otherId = parseInt(req.params.userId, 10);
  if (!otherId || isNaN(otherId)) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    await MessageModel.markRead(req.user.user_id, otherId);
    const messages = await MessageModel.getConversation(
      req.user.user_id,
      otherId,
    );
    return res.json({ messages });
  } catch (err) {
    console.error("[getConversation]", err);
    return res.status(500).json({ error: "Failed to load conversation" });
  }
};

/**
 * POST /api/messages
 * Body: { receiver_id, message }
 * Send a new message.
 */
const sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { receiver_id, message } = req.body;
  const sender_id = req.user.user_id;

  if (receiver_id === sender_id) {
    return res.status(400).json({ error: "Cannot send a message to yourself" });
  }

  try {
    const id = await MessageModel.create({ sender_id, receiver_id, message });
    const newMsg = await MessageModel.findById(id);
    return res.status(201).json({ message: newMsg });
  } catch (err) {
    console.error("[sendMessage]", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
};

module.exports = {
  getInbox,
  getStaffList,
  getUnreadCount,
  getConversation,
  sendMessage,
};
