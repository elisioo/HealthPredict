import React, { useEffect, useRef, useState, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { messageApi, predictionApi } from "../../api/authApi";

/* ------------------------------------------------------------------ */
/* Report message encoding / decoding                                   */
/* ------------------------------------------------------------------ */

const REPORT_PREFIX = "%%REPORT%%";
const REPORT_SUFFIX = "%%END%%";

function encodeReportMessage(report, text) {
  const payload = JSON.stringify({
    id: report.prediction_id,
    risk: report.risk_level,
    prob: parseFloat(report.probability ?? 0),
    age: report.age,
    bmi: report.bmi,
    hba1c: report.HbA1c_level,
    glucose: report.blood_glucose_level,
    date: new Date(report.created_at).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  });
  return `${REPORT_PREFIX}${payload}${REPORT_SUFFIX}${text ? `\n${text}` : ""}`;
}

function decodeReportMessage(raw) {
  if (!raw || !raw.startsWith(REPORT_PREFIX))
    return { report: null, text: raw };
  const end = raw.indexOf(REPORT_SUFFIX);
  if (end === -1) return { report: null, text: raw };
  try {
    const json = raw.slice(REPORT_PREFIX.length, end);
    const report = JSON.parse(json);
    const text = raw.slice(end + REPORT_SUFFIX.length).replace(/^\n/, "");
    return { report, text };
  } catch {
    return { report: null, text: raw };
  }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

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

const RISK_STYLE = {
  high: {
    bg: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
    label: "High Risk",
  },
  moderate: {
    bg: "bg-yellow-50 border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
    label: "Moderate",
  },
  low: {
    bg: "bg-green-50 border-green-200",
    badge: "bg-green-100 text-green-700",
    label: "Low Risk",
  },
};

function ReportCard({ report, dark }) {
  const style = RISK_STYLE[report.risk] ?? RISK_STYLE.low;
  return (
    <div
      className={`rounded-xl border p-3 mb-2 text-xs ${
        dark ? "bg-blue-500 border-blue-300" : style.bg
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`font-semibold ${dark ? "text-white" : "text-gray-700"}`}
        >
          <i className="fas fa-file-medical mr-1" />
          Prediction Report
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            dark ? "bg-blue-300 text-blue-900" : style.badge
          }`}
        >
          {style.label}
        </span>
      </div>
      <div
        className={`grid grid-cols-2 gap-x-4 gap-y-1 ${dark ? "text-blue-100" : "text-gray-600"}`}
      >
        <span>
          Probability:{" "}
          <strong className={dark ? "text-white" : "text-gray-800"}>
            {report.prob}%
          </strong>
        </span>
        <span>
          Date:{" "}
          <strong className={dark ? "text-white" : "text-gray-800"}>
            {report.date}
          </strong>
        </span>
        <span>
          Age:{" "}
          <strong className={dark ? "text-white" : "text-gray-800"}>
            {report.age}
          </strong>
        </span>
        <span>
          BMI:{" "}
          <strong className={dark ? "text-white" : "text-gray-800"}>
            {report.bmi}
          </strong>
        </span>
        <span>
          HbA1c:{" "}
          <strong className={dark ? "text-white" : "text-gray-800"}>
            {report.hba1c}
          </strong>
        </span>
        <span>
          Glucose:{" "}
          <strong className={dark ? "text-white" : "text-gray-800"}>
            {report.glucose}
          </strong>
        </span>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMine }) {
  const { report, text } = decodeReportMessage(msg.message);
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
          isMine
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
        }`}
      >
        {report && <ReportCard report={report} dark={isMine} />}
        {text && <p className="whitespace-pre-wrap break-words">{text}</p>}
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

  // Report attach (health_user only)
  const [predictions, setPredictions] = useState([]);
  const [attachedReport, setAttachedReport] = useState(null);
  const [showReportPicker, setShowReportPicker] = useState(false);

  // New conversation picker (patients only)
  const [showPicker, setShowPicker] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  /* ── Load inbox on mount ── */
  useEffect(() => {
    setLoadingContacts(true);
    messageApi
      .getInbox()
      .then(({ data }) => setContacts(data.inbox ?? []))
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

      // Prediction history for report attachment
      predictionApi
        .getHistory()
        .then(({ data }) => setPredictions(data.predictions ?? []))
        .catch(() => setPredictions([]));
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
    setAttachedReport(null);

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
    if ((!trimmed && !attachedReport) || !activeContact || sending) return;
    setSending(true);
    setSendError("");

    const body = attachedReport
      ? encodeReportMessage(attachedReport, trimmed)
      : trimmed;

    try {
      await messageApi.sendMessage({
        receiver_id: activeContact.user_id,
        message: body,
      });
      const newMsg = {
        message_id: Date.now(),
        sender_id: user?.user_id ?? user?.id,
        receiver_id: activeContact.user_id,
        message: body,
        is_read: 0,
        sent_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
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
      setAttachedReport(null);
      textareaRef.current?.focus();
    } catch (err) {
      setSendError(
        err.response?.data?.message ?? "Failed to send. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }, [text, attachedReport, activeContact, sending, user]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const canSend =
    (text.trim().length > 0 || attachedReport !== null) && !!activeContact;

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

                {/* Attached report preview */}
                {attachedReport && (
                  <div className="mb-2 relative">
                    <div className="border border-blue-200 rounded-xl bg-blue-50 px-3 py-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-blue-700">
                          <i className="fas fa-paperclip mr-1" />
                          Attaching prediction report
                        </span>
                        <button
                          onClick={() => setAttachedReport(null)}
                          className="text-blue-400 hover:text-blue-600 ml-2"
                          title="Remove attachment"
                        >
                          <i className="fas fa-xmark" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-blue-600">
                        <span>
                          Risk:{" "}
                          <strong className="capitalize">
                            {attachedReport.risk_level}
                          </strong>
                        </span>
                        <span>
                          Prob: <strong>{attachedReport.probability}%</strong>
                        </span>
                        <span>
                          {new Date(
                            attachedReport.created_at,
                          ).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* Attach Report button (health_user only) */}
                  {role === "health_user" && (
                    <button
                      onClick={() => setShowReportPicker(true)}
                      title="Attach a prediction report"
                      className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors flex-shrink-0 ${
                        attachedReport
                          ? "bg-blue-100 border-blue-300 text-blue-600"
                          : "border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-blue-600"
                      }`}
                    >
                      <i className="fas fa-paperclip text-sm" />
                    </button>
                  )}

                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      attachedReport
                        ? "Add a message or concern… (optional)"
                        : "Type a message… (Enter to send)"
                    }
                    className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 overflow-y-auto"
                    style={{ minHeight: "2.625rem" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!canSend || sending}
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

      {/* ── Report picker modal (health_user only) ── */}
      {showReportPicker && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowReportPicker(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[32rem] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Attach a Prediction Report
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  The doctor will see your health data alongside your message.
                </p>
              </div>
              <button
                onClick={() => setShowReportPicker(false)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-2">
              {predictions.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">
                  No prediction records found. Run a prediction first.
                </p>
              ) : (
                predictions.map((p) => {
                  const rs = RISK_STYLE[p.risk_level] ?? RISK_STYLE.low;
                  const isSelected =
                    attachedReport?.prediction_id === p.prediction_id;
                  return (
                    <button
                      key={p.prediction_id}
                      onClick={() => {
                        setAttachedReport(p);
                        setShowReportPicker(false);
                      }}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : `${rs.bg} hover:border-blue-300`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          {new Date(p.created_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${rs.badge}`}
                        >
                          {rs.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-xs text-gray-700">
                        <span>
                          Prob:{" "}
                          <strong>{parseFloat(p.probability ?? 0)}%</strong>
                        </span>
                        <span>
                          BMI: <strong>{p.bmi}</strong>
                        </span>
                        <span>
                          HbA1c: <strong>{p.HbA1c_level}</strong>
                        </span>
                        <span>
                          Glucose: <strong>{p.blood_glucose_level}</strong>
                        </span>
                        <span>
                          Age: <strong>{p.age}</strong>
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
