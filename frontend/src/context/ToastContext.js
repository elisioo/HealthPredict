import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let _id = 0;

const TYPE_STYLES = {
  success: { bg: "bg-emerald-600", icon: "fa-circle-check" },
  error: { bg: "bg-red-600", icon: "fa-circle-exclamation" },
  info: { bg: "bg-blue-600", icon: "fa-circle-info" },
  warning: { bg: "bg-amber-500", icon: "fa-triangle-exclamation" },
};

/* ------------------------------------------------------------------ */
/* Provider                                                             */
/* ------------------------------------------------------------------ */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(
    (message, type = "success", duration = 4000) => {
      const id = ++_id;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
      return id;
    },
    [],
  );

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* ── Floating toast stack — bottom-right ── */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-80 pointer-events-none"
      >
        {toasts.map((t) => {
          const cfg = TYPE_STYLES[t.type] ?? TYPE_STYLES.info;
          return (
            <div
              key={t.id}
              role="alert"
              style={{ animation: "hp-toast-in 0.25s ease-out both" }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl text-white text-sm pointer-events-auto ${cfg.bg}`}
            >
              <i className={`fa ${cfg.icon} mt-0.5 flex-shrink-0 text-base`} />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="opacity-70 hover:opacity-100 transition-opacity ml-1 flex-shrink-0 text-base leading-none"
              >
                <i className="fa fa-xmark" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Keyframe injected once into <head> */}
      <style>{`
        @keyframes hp-toast-in {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Hook                                                                 */
/* ------------------------------------------------------------------ */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
