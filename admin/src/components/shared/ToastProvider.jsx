import { createContext, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const iconMap = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
};

const toneMap = {
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  error: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  info: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = (type, message) => {
    const id = `${Date.now()}-${counterRef.current++}`;
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => removeToast(id), 3200);
  };

  const value = useMemo(
    () => ({
      success: (message) => pushToast("success", message),
      error: (message) => pushToast("error", message),
      info: (message) => pushToast("info", message),
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-5 top-5 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl shadow-slate-950/35 backdrop-blur ${toneMap[toast.type]}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm leading-6">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-full p-1 text-current/80 transition hover:bg-white/10 hover:text-current"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};
