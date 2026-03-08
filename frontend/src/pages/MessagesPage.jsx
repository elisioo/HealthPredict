import React, { useEffect, useRef, useState, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";
import { useAuth } from "../context/AuthContext";
import { messageApi } from "../api/authApi";

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ContactItem({ contact, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(contact)}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
        isActive ? "bg-blue-50 border-r-2 border-blue-600" : ""
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-semibold text-sm">
        {contact.full_name?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {contact.full_name}
          </span>
          {contact.last_sent_at && (
            <span className="text-xs text-gray-400 ml-1 flex-shrink-0">
              {formatTime(contact.last_sent_at)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {contact.role_label ?? contact.role}
        </p>
      </div>
      {contact.unread_count > 0 && (
        <span className="ml-1 flex-shrink-0 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {contact.unread_count > 9 ? "9+" : contact.unread_count}
        </span>
      )}
    </button>
  );
}

function MessageBubble({ msg, isMine }) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
          isMine
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
        <p
          className={`text-xs mt-1 text-right ${
            isMine ? "text-blue-200" : "text-gray-400"
          }`}
        >
          {formatTime(msg.sent_at)}
        </p>
      </div>
    </div>
  );
}

const ROLE_LABEL = {
  admin: "Admin",
  staff: "Healthcare Staff",
  health_user: "Patient",
};

export default function MessagesPage() {
  const { user } = useAuth();
  const role = user?.role;
  const navKey = role === "health_user" ? "patient" : role;
  const navItems = NAV_BY_ROLE[navKey] ?? NAV_BY_ROLE.patient;

  // Contact list (inbox conversations)
  const [contacts, setContacts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Active conversation
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Compose
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  // New conversation picker (patients only)
  const [showPicker, setShowPicker] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  /* ── Load inbox on mount ── */
  useEffect(() => {
    setLoadingContacts(true);
    messageApi
      .getInbox()
      .then(({ data }) => setContacts(data.conversations ?? []))
      .catch(() => setContacts([]))
      .finally(() => setLoadingContacts(false));

    // Staff list for new-convo picker (health_user only)
    if (role === "health_user") {
      messageApi
        .getStaffList()
        .then(({ data }) =>
          setStaffList(
            (data.staff ?? []).map((s) => ({
              ...s,
              role_label: ROLE_LABEL[s.role] ?? s.role,
            })),
          ),
        )
        .catch(() => setStaffList([]));
    }
  }, [role]);

  useEffect(() => {
    if (!activeContact) return;
    setLoadingMessages(true);
    setMessages([]);
    messageApi
      .getConversation(activeContact.user_id)
      .then(({ data }) => setMessages(data.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [activeContact]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectContact = useCallback((contact) => {
    setActiveContact(contact);
    setText("");
    setSendError("");

    setContacts((prev) =>
      prev.map((c) =>
        c.user_id === contact.user_id ? { ...c, unread_count: 0 } : c,
      ),
    );
  }, []);

  const handlePickStaff = useCallback(
    (staff) => {
      const existing = contacts.find((c) => c.user_id === staff.user_id);
      if (existing) {
        handleSelectContact(existing);
      } else {
        handleSelectContact({ ...staff, unread_count: 0 });
      }
      setShowPicker(false);
    },
    [contacts, handleSelectContact],
  );

  /* ── Send message ── */
  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeContact || sending) return;
    setSending(true);
    setSendError("");
    try {
      const { data } = await messageApi.sendMessage({
        receiver_id: activeContact.user_id,
        message: trimmed,
      });
      const newMsg = {
        message_id: data.message_id,
        sender_id: user?.user_id ?? user?.id,
        receiver_id: activeContact.user_id,
        message: trimmed,
        is_read: 0,
        sent_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      // Update last_sent_at in contacts list
      setContacts((prev) => {
        const exists = prev.find((c) => c.user_id === activeContact.user_id);
        if (exists) {
          return prev.map((c) =>
            c.user_id === activeContact.user_id
              ? { ...c, last_sent_at: newMsg.sent_at }
              : c,
          );
        }
        return [{ ...activeContact, last_sent_at: newMsg.sent_at }, ...prev];
      });
      setText("");
      textareaRef.current?.focus();
    } catch (err) {
      setSendError(
        err.response?.data?.message ?? "Failed to send. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }, [text, activeContact, sending, user]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const myId = user?.user_id ?? user?.id;

  return (
    <DashboardLayout
      navItems={navItems}
      title="Messages"
      subtitle="Chat with your healthcare team"
    >
      <div className="flex h-[calc(100vh-10rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* ── Left panel: Contact list ── */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">
              Conversations
            </h2>
            {role === "health_user" && (
              <button
                onClick={() => setShowPicker(true)}
                title="New conversation"
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
              >
                <i className="fas fa-plus text-xs" />
              </button>
            )}
          </div>

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto">
            {loadingContacts ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10 px-4">
                {role === "health_user"
                  ? "No conversations yet. Tap + to message a staff member."
                  : "No messages yet."}
              </div>
            ) : (
              contacts.map((c) => (
                <ContactItem
                  key={c.user_id}
                  contact={c}
                  isActive={activeContact?.user_id === c.user_id}
                  onClick={handleSelectContact}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right panel: Chat thread ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeContact ? (
            <>
              {/* Chat header */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                  {activeContact.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {activeContact.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeContact.role_label ??
                      ROLE_LABEL[activeContact.role] ??
                      activeContact.role}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-10">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.message_id}
                      msg={msg}
                      isMine={msg.sender_id === myId}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Compose */}
              <div className="px-4 py-3 border-t border-gray-200 bg-white">
                {sendError && (
                  <p className="text-xs text-red-500 mb-1">{sendError}</p>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message… (Enter to send)"
                    className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 overflow-y-auto"
                    style={{ minHeight: "2.625rem" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <i className="fas fa-paper-plane text-sm" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <i className="fas fa-comments text-4xl mb-3 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                Select a conversation
              </p>
              <p className="text-xs mt-1">
                {role === "health_user"
                  ? "Or tap + to start a new one"
                  : "Choose a patient from the list"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Staff picker modal (health_user only) ── */}
      {showPicker && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPicker(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-96 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                Message a Staff Member
              </h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {staffList.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  No staff members available.
                </p>
              ) : (
                staffList.map((s) => (
                  <button
                    key={s.user_id}
                    onClick={() => handlePickStaff(s)}
                    className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm flex-shrink-0">
                      {s.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {s.full_name}
                      </p>
                      <p className="text-xs text-gray-500">{s.role_label}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
