import React from "react";

/**
 * Reusable confirmation modal.
 *
 * Props:
 *   title        {string}   Modal heading
 *   message      {string}   Body text / description
 *   confirmLabel {string}   Label for the confirm button  (default "Confirm")
 *   cancelLabel  {string}   Label for the cancel button   (default "Cancel")
 *   danger       {boolean}  Red confirm button style       (default false)
 *   loading      {boolean}  Disable buttons, show spinner (default false)
 *   onConfirm    {function} Called when user clicks confirm
 *   onCancel     {function} Called when user clicks cancel or backdrop
 */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel?.();
      }}
    >
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
        {/* Icon strip */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto
          ${danger ? "bg-red-100" : "bg-blue-100"}`}
        >
          <i
            className={`fa text-xl ${danger ? "fa-triangle-exclamation text-red-600" : "fa-circle-question text-blue-600"}`}
          />
        </div>

        <h3 className="text-lg font-bold text-slate-800 text-center mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 text-sm rounded-xl font-semibold text-white disabled:opacity-60 transition-colors
              ${danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fa fa-circle-notch fa-spin text-xs" /> Processing…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
