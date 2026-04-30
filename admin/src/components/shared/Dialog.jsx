import { X } from "lucide-react";

const Dialog = ({ open, title, description, children, onClose, closeIconOnly = false }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-950 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {description ? <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
            className={`rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 ${
              closeIconOnly ? "inline-flex h-10 w-10 items-center justify-center" : "px-4 py-2 text-sm"
            }`}
          >
            {closeIconOnly ? <X size={16} /> : "Close"}
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default Dialog;
