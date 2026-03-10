const express = require("express");
const { body } = require("express-validator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  getUsers,
  getStats,
  activateUser,
  deactivateUser,
  changeRole,
  scheduleDeleteUser,
  getLogs,
  getActivity,
  getAllPredictions,
  getMessageThreads,
  getAdminConversation,
  deleteAdminMessage,
  deleteAdminThread,
  getLockedAccounts,
  unlockUser,
} = require("../controllers/adminController");

const router = express.Router();

// Every route here requires admin
router.use(requireAuth, requireRole("admin"));

// Users
router.get("/users", getUsers);
router.get("/stats", getStats);
router.patch("/users/:id/activate", activateUser);
router.patch("/users/:id/deactivate", deactivateUser);
router.patch("/users/:id/unlock", unlockUser);
router.patch(
  "/users/:id/role",
  [
    body("role")
      .isIn(["admin", "staff", "health_user"])
      .withMessage("Invalid role"),
  ],
  changeRole,
);
router.delete("/users/:id", scheduleDeleteUser);

// Logs & Activity
router.get("/logs", getLogs);
router.get("/activity", getActivity);

// Locked accounts
router.get("/locked-accounts", getLockedAccounts);

// Predictions report
router.get("/predictions", getAllPredictions);

// Messages admin — ORDER MATTERS: specific paths before parameterised ones
router.get("/messages/threads", getMessageThreads);
router.get("/messages/:userId1/:userId2", getAdminConversation);
router.delete("/messages/thread/:userId1/:userId2", deleteAdminThread);
router.delete("/messages/:messageId", deleteAdminMessage);

module.exports = router;
