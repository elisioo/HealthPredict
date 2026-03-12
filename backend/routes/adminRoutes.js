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

router.use(requireAuth, requireRole("admin"));

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

router.get("/logs", getLogs);
router.get("/activity", getActivity);

router.get("/locked-accounts", getLockedAccounts);

router.get("/predictions", getAllPredictions);

router.get("/messages/threads", getMessageThreads);
router.get("/messages/:userId1/:userId2", getAdminConversation);
router.delete("/messages/thread/:userId1/:userId2", deleteAdminThread);
router.delete("/messages/:messageId", deleteAdminMessage);

module.exports = router;
