const db = require("../database/db");

const MessageModel = {
  /** Send a message */
  async create({ sender_id, receiver_id, message }) {
    const [result] = await db.query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
      [sender_id, receiver_id, message],
    );
    return result.insertId;
  },

  /** Get a message by id */
  async findById(id) {
    const [rows] = await db.query(
      `SELECT m.*, 
        s.full_name AS sender_name, s.role AS sender_role,
        r.full_name AS receiver_name, r.role AS receiver_role
       FROM messages m
       JOIN users s ON s.user_id = m.sender_id
       JOIN users r ON r.user_id = m.receiver_id
       WHERE m.message_id = ?`,
      [id],
    );
    return rows[0] || null;
  },

  /**
   * Get conversation thread between two users (both directions),
   * ordered oldest first.
   */
  async getConversation(userId, otherId) {
    const [rows] = await db.query(
      `SELECT m.*,
        s.full_name AS sender_name, s.role AS sender_role
       FROM messages m
       JOIN users s ON s.user_id = m.sender_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.sent_at ASC`,
      [userId, otherId, otherId, userId],
    );
    return rows;
  },

  /**
   * Get the list of unique contacts (people the user has messaged or received from),
   * with the latest message and unread count for each.
   */
  async getInbox(userId) {
    const [rows] = await db.query(
      `SELECT
        u.user_id, u.full_name, u.role,
        latest.message AS last_message,
        latest.sent_at AS last_sent_at,
        (SELECT COUNT(*) FROM messages
         WHERE receiver_id = ? AND sender_id = u.user_id AND is_read = 0) AS unread_count
       FROM users u
       JOIN (
         SELECT
           CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id,
           message, sent_at,
           ROW_NUMBER() OVER (
             PARTITION BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
             ORDER BY sent_at DESC
           ) AS rn
         FROM messages
         WHERE sender_id = ? OR receiver_id = ?
       ) latest ON latest.other_id = u.user_id AND latest.rn = 1
       ORDER BY latest.sent_at DESC`,
      [userId, userId, userId, userId],
    );
    return rows;
  },

  /** Get list of staff/admin users the patient can message */
  async getStaffList() {
    const [rows] = await db.query(
      "SELECT user_id, full_name, role FROM users WHERE role IN ('staff','admin') AND is_active = 1 ORDER BY full_name ASC",
    );
    return rows;
  },

  /** Mark all messages in a conversation as read */
  async markRead(receiverId, senderId) {
    await db.query(
      "UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0",
      [receiverId, senderId],
    );
  },

  /** Unread count for a user */
  async unreadCount(userId) {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = 0",
      [userId],
    );
    return rows[0].count;
  },
};

module.exports = MessageModel;
