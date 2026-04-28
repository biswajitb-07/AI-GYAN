import { useEffect, useRef } from "react";

const AdsterraScriptUnit = ({ scriptSrc, title = "Sponsored", minHeight = 90 }) => {
  const hostRef = useRef(null);

  useEffect(() => {
    if (!scriptSrc || !hostRef.current) {
      return undefined;
    }

    hostRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.type = "text/javascript";
    hostRef.current.appendChild(script);

    return () => {
      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }
    };
  }, [scriptSrc]);

  if (!scriptSrc) {
    return null;
  }

  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/15">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{title}</p>
      <div ref={hostRef} className="mt-3 overflow-hidden rounded-[1.2rem] bg-slate-950/60" style={{ minHeight }} />
    </div>
  );
};

export default AdsterraScriptUnit;
