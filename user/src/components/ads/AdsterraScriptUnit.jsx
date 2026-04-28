import { useEffect, useMemo, useRef, useState } from "react";

const AdsterraScriptUnit = ({ desktopUnit = null, mobileUnit = null, title = "Sponsored", minHeight = 90 }) => {
  const hostRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 640 : false));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const unit = useMemo(() => (isMobile ? mobileUnit || desktopUnit : desktopUnit || mobileUnit), [desktopUnit, isMobile, mobileUnit]);

  useEffect(() => {
    if (!unit || !hostRef.current) {
      return undefined;
    }

    hostRef.current.innerHTML = "";

    if (unit.type === "iframe") {
      window.atOptions = {
        key: unit.key,
        format: "iframe",
        height: unit.height,
        width: unit.width,
        params: {},
      };

      const script = document.createElement("script");
      script.src = unit.scriptSrc;
      script.async = true;
      script.type = "text/javascript";
      hostRef.current.appendChild(script);
    }

    if (unit.type === "native") {
      const container = document.createElement("div");
      container.id = unit.containerId;
      hostRef.current.appendChild(container);

      const script = document.createElement("script");
      script.src = unit.scriptSrc;
      script.async = true;
      script.type = "text/javascript";
      script.dataset.cfasync = "false";
      hostRef.current.appendChild(script);
    }

    return () => {
      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }

      if (window.atOptions) {
        delete window.atOptions;
      }
    };
  }, [unit]);

  if (!unit) {
    return null;
  }

  const resolvedMinHeight = unit.type === "iframe" ? unit.height : minHeight;

  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/15">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{title}</p>
      <div ref={hostRef} className="mt-3 overflow-hidden rounded-[1.2rem] bg-slate-950/60" style={{ minHeight: resolvedMinHeight }} />
    </div>
  );
};

export default AdsterraScriptUnit;
