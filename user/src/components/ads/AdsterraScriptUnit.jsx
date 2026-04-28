import { useEffect, useMemo, useRef, useState } from "react";
import { adsterraConfig } from "../../config/adsterra";

const AdsterraScriptUnit = ({ desktopUnit = null, mobileUnit = null, title = "Sponsored", minHeight = 90 }) => {
  const hostRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 640 : false));
  const [activeUnit, setActiveUnit] = useState(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const preferredUnit = useMemo(() => (isMobile ? mobileUnit || desktopUnit : desktopUnit || mobileUnit), [desktopUnit, isMobile, mobileUnit]);
  const fallbackUnit = useMemo(() => {
    const alternateUnit = isMobile ? desktopUnit : mobileUnit;

    if (!preferredUnit || !alternateUnit) {
      return null;
    }

    const preferredIdentity = preferredUnit.key || preferredUnit.containerId || preferredUnit.scriptSrc;
    const alternateIdentity = alternateUnit.key || alternateUnit.containerId || alternateUnit.scriptSrc;

    return preferredIdentity === alternateIdentity ? null : alternateUnit;
  }, [desktopUnit, isMobile, mobileUnit, preferredUnit]);

  useEffect(() => {
    setActiveUnit(preferredUnit);
    setShowFallback(false);
  }, [preferredUnit]);

  useEffect(() => {
    if (!activeUnit || !hostRef.current) {
      return undefined;
    }

    hostRef.current.innerHTML = "";
    let disposed = false;
    let fallbackTriggered = false;

    const tryFallback = () => {
      if (disposed || fallbackTriggered) {
        return;
      }

      fallbackTriggered = true;

      if (fallbackUnit) {
        setActiveUnit(fallbackUnit);
        return;
      }

      setShowFallback(true);
    };

    const hasRenderableContent = () => {
      if (!hostRef.current) {
        return false;
      }

      return Boolean(hostRef.current.querySelector("iframe, img, ins, object, embed"));
    };

    if (activeUnit.type === "iframe") {
      window.atOptions = {
        key: activeUnit.key,
        format: "iframe",
        height: activeUnit.height,
        width: activeUnit.width,
        params: {},
      };

      const script = document.createElement("script");
      script.src = activeUnit.scriptSrc;
      script.async = true;
      script.type = "text/javascript";
      script.onerror = tryFallback;
      hostRef.current.appendChild(script);
    }

    if (activeUnit.type === "native") {
      const container = document.createElement("div");
      container.id = activeUnit.containerId;
      hostRef.current.appendChild(container);

      const script = document.createElement("script");
      script.src = activeUnit.scriptSrc;
      script.async = true;
      script.type = "text/javascript";
      script.dataset.cfasync = "false";
      script.onerror = tryFallback;
      hostRef.current.appendChild(script);
    }

    const renderCheckTimeout = window.setTimeout(() => {
      if (!hasRenderableContent()) {
        tryFallback();
      }
    }, 4500);

    return () => {
      disposed = true;
      window.clearTimeout(renderCheckTimeout);

      if (hostRef.current) {
        hostRef.current.innerHTML = "";
      }

      if (window.atOptions) {
        delete window.atOptions;
      }
    };
  }, [activeUnit, fallbackUnit]);

  if (!activeUnit) {
    return null;
  }

  const resolvedMinHeight = activeUnit.type === "iframe" ? activeUnit.height : minHeight;

  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4 shadow-xl shadow-slate-950/15">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{title}</p>
      <div className="mt-3 overflow-hidden rounded-[1.2rem] bg-slate-950/60" style={{ minHeight: resolvedMinHeight }}>
        {showFallback ? (
          <div className="flex min-h-[inherit] flex-col items-start justify-center gap-3 px-5 py-5 text-slate-200">
            <p className="text-sm font-semibold text-white">Sponsored content is unavailable on this network</p>
            <p className="text-sm leading-6 text-slate-300">
              Some networks or browser filters block ad delivery. You can still open our sponsor link below.
            </p>
            <a
              href={adsterraConfig.directLinkUrl || "/tools"}
              target={adsterraConfig.directLinkUrl ? "_blank" : undefined}
              rel={adsterraConfig.directLinkUrl ? "noreferrer" : undefined}
              className="inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              {adsterraConfig.directLinkUrl ? "Open sponsor link" : "Explore tools"}
            </a>
          </div>
        ) : (
          <div ref={hostRef} className="h-full w-full" style={{ minHeight: resolvedMinHeight }} />
        )}
      </div>
    </div>
  );
};

export default AdsterraScriptUnit;
