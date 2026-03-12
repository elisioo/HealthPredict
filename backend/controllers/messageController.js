const { validationResult } = require("express-validator");
const MessageModel = require("../models/messageModel");

const getInbox = async (req, res) => {
  try {
    const inbox = await MessageModel.getInbox(req.user.user_id);
    return res.json({ inbox });
  } catch (err) {
    console.error("[getInbox]", err);
    return res.status(500).json({ error: "Failed to load inbox" });
  }
};

const getStaffList = async (req, res) => {
  try {
    const staff = await MessageModel.getStaffList();
    return res.json({ staff });
  } catch (err) {
    console.error("[getStaffList]", err);
    return res.status(500).json({ error: "Failed to load staff list" });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await MessageModel.unreadCount(req.user.user_id);
    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ error: "Failed to get unread count" });
  }
};

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
