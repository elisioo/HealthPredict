import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { adminApi } from "../../api/authApi";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../components/ConfirmModal";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
const ROLE_BADGE = {
  admin: "bg-purple-100 text-purple-700",
  staff: "bg-blue-100 text-blue-700",
  health_user: "bg-green-100 text-green-700",
};
const ROLE_LABEL = { admin: "Admin", staff: "Staff", health_user: "Patient" };

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const REPORT_PREFIX = "%%REPORT%%";

function stripReport(raw) {
  if (!raw) return "";
  if (raw.startsWith(REPORT_PREFIX)) {
    const end = raw.indexOf("%%END%%");
    if (end !== -1) {
      const after = raw.slice(end + 7).replace(/^\n/, "");
      return after || "[Prediction report shared]";
    }
  }
  return raw;
}

/* ------------------------------------------------------------------ */
/* Thread item (left panel)                                             */
/* ------------------------------------------------------------------ */
function ThreadRow({ thread, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-start gap-3
        ${active ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}`}
    >
      {/* Avatars */}
      <div className="flex -space-x-2 flex-shrink-0 mt-0.5">
        {[
          { name: thread.user1_name, role: thread.user1_role },
          { name: thread.user2_name, role: thread.user2_role },
        ].map((u, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 border-2 border-white flex items-center justify-center text-xs font-bold"
          >
            {(u.name ?? "?").charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      {/* Names */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800 truncate">
          {thread.user1_name} &amp; {thread.user2_name}
        </div>
        <div className="flex gap-1 flex-wrap mt-0.5">
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${ROLE_BADGE[thread.user1_role]}`}
          >
            {ROLE_LABEL[thread.user1_role] ?? thread.user1_role}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${ROLE_BADGE[thread.user2_role]}`}
          >
            {ROLE_LABEL[thread.user2_role] ?? thread.user2_role}
          </span>
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {thread.message_count} msg · Last: {fmtTime(thread.last_message_at)}
          {Number(thread.unread_count) > 0 && (
            <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 text-[10px]">
              {thread.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Message bubble                                                        */
/* ------------------------------------------------------------------ */
function MsgBubble({ msg, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const text = stripReport(msg.message);
  return (
    <div
      className="flex items-start gap-2 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
        {(msg.sender_name ?? "?").charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-xs font-semibold text-slate-700">
            {msg.sender_name}
          </span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${ROLE_BADGE[msg.sender_role]}`}
          >
            {ROLE_LABEL[msg.sender_role] ?? msg.sender_role}
          </span>
          <span className="text-[10px] text-slate-400">
            {fmtTime(msg.sent_at)}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 leading-relaxed max-w-prose">
          {text}
        </div>
      </div>
      {hovered && (
        <button
          onClick={() => onDelete(msg)}
          title="Delete message"
          className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
        >
          <i className="fa fa-trash text-xs" />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                             */
/* ------------------------------------------------------------------ */
export default function AdminMessagesPage() {
  const { showToast } = useToast();

  const [threads, setThreads] = useState([]);
  const [threadSearch, setThreadSearch] = useState("");
  const [activeThread, setActiveThread] = useState(null); // { user1_id, user2_id, user1_name, user2_name }
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // Confirm modal
  const [confirm, setConfirm] = useState(null); // { type: "msg"|"thread", target }
  const [confirmLoading, setConfirmLoading] = useState(false);

  /* ── Load threads ── */
  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const res = await adminApi.getMessageThreads();
      setThreads(res.data.threads);
    } catch {
      showToast("Failed to load conversations.", "error");
    } finally {
      setLoadingThreads(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  /* ── Load messages for active thread ── */
  const loadMessages = useCallback(
    async (t) => {
      if (!t) return;
      setLoadingMsgs(true);
      try {
        const res = await adminApi.getAdminConversation(t.user1_id, t.user2_id);
        setMessages(res.data.messages);
      } catch {
        showToast("Failed to load messages.", "error");
      } finally {
        setLoadingMsgs(false);
      }
    },
    [showToast],
  );

  const selectThread = (t) => {
    setActiveThread(t);
    loadMessages(t);
  };

  /* ── Filtered threads ── */
  const filtered = threads.filter((t) => {
    if (!threadSearch.trim()) return true;
    const q = threadSearch.toLowerCase();
    return (
      t.user1_name?.toLowerCase().includes(q) ||
      t.user2_name?.toLowerCase().includes(q)
    );
  });

  /* ── Delete single message ── */
  const handleDeleteMessage = async () => {
    setConfirmLoading(true);
    try {
      await adminApi.deleteAdminMessage(confirm.target.message_id);
      showToast("Message deleted.", "success");
      setMessages((prev) =>
        prev.filter((m) => m.message_id !== confirm.target.message_id),
      );
      // update thread count
      setThreads((prev) =>
        prev.map((t) =>
          t.user1_id === activeThread.user1_id &&
          t.user2_id === activeThread.user2_id
            ? { ...t, message_count: Math.max(0, t.message_count - 1) }
            : t,
        ),
      );
      setConfirm(null);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to delete message.",
        "error",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  /* ── Delete whole thread ── */
  const handleDeleteThread = async () => {
    setConfirmLoading(true);
    try {
      await adminApi.deleteAdminThread(
        confirm.target.user1_id,
        confirm.target.user2_id,
      );
      showToast(`Conversation deleted.`, "success");
      setThreads((prev) =>
        prev.filter(
          (t) =>
            !(
              t.user1_id === confirm.target.user1_id &&
              t.user2_id === confirm.target.user2_id
            ),
        ),
      );
      if (
        activeThread?.user1_id === confirm.target.user1_id &&
        activeThread?.user2_id === confirm.target.user2_id
      ) {
        setActiveThread(null);
        setMessages([]);
      }
      setConfirm(null);
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to delete conversation.",
        "error",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.admin}
      title="Messages"
      subtitle="View and moderate all user conversations"
      brandTitle="Glucogu"
    >
      <div className="flex h-[calc(100vh-130px)] overflow-hidden">
        {/* ── Left: thread list ── */}
        <aside className="w-72 flex-shrink-0 border-r border-slate-200 flex flex-col bg-white">
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={threadSearch}
                onChange={(e) => setThreadSearch(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="flex justify-center pt-12 text-slate-400">
                <i className="fa fa-circle-notch fa-spin text-2xl" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center pt-12 text-slate-400 text-sm">
                No conversations.
              </div>
            ) : (
              filtered.map((t) => (
                <ThreadRow
                  key={`${t.user1_id}-${t.user2_id}`}
                  thread={t}
                  active={
                    activeThread?.user1_id === t.user1_id &&
                    activeThread?.user2_id === t.user2_id
                  }
                  onClick={() => selectThread(t)}
                />
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400">
            {threads.length} conversation{threads.length !== 1 ? "s" : ""}
          </div>
        </aside>

        {/* ── Right: message view ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!activeThread ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <i className="fa fa-comments text-5xl mb-3 opacity-30" />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white flex-shrink-0">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    {activeThread.user1_name} &amp; {activeThread.user2_name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {messages.length} messages
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfirm({ type: "thread", target: activeThread })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <i className="fa fa-trash" /> Delete Conversation
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
                {loadingMsgs ? (
                  <div className="flex justify-center pt-10 text-slate-400">
                    <i className="fa fa-circle-notch fa-spin text-2xl" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center pt-10 text-slate-400 text-sm">
                    No messages in this conversation.
                  </div>
                ) : (
                  messages.map((m) => (
                    <MsgBubble
                      key={m.message_id}
                      msg={m}
                      onDelete={(msg) =>
                        setConfirm({ type: "msg", target: msg })
                      }
                    />
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── Confirm modals ── */}
      {confirm?.type === "msg" && (
        <ConfirmModal
          title="Delete Message"
          message="This message will be permanently removed. This cannot be undone."
          confirmLabel="Delete"
          danger
          loading={confirmLoading}
          onConfirm={handleDeleteMessage}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm?.type === "thread" && (
        <ConfirmModal
          title="Delete Entire Conversation"
          message={`All messages between ${confirm.target.user1_name} and ${confirm.target.user2_name} will be permanently deleted.`}
          confirmLabel="Delete All"
          danger
          loading={confirmLoading}
          onConfirm={handleDeleteThread}
          onCancel={() => setConfirm(null)}
        />
      )}
    </DashboardLayout>
  );
}
