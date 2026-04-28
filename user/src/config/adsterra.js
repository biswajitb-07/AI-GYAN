const createIframeUnit = (key, width, height, scriptHost = "https://www.highperformanceformat.com") =>
  key
    ? {
        type: "iframe",
        key,
        width,
        height,
        scriptSrc: `${scriptHost}/${key}/invoke.js`,
      }
    : null;

const createNativeUnit = (scriptSrc, containerId) =>
  scriptSrc && containerId
    ? {
        type: "native",
        scriptSrc,
        containerId,
      }
    : null;

export const adsterraConfig = {
  directLinkUrl: import.meta.env.VITE_ADSTERRA_DIRECT_LINK_URL || "",
  directLinkLabel: import.meta.env.VITE_ADSTERRA_DIRECT_LINK_LABEL || "Sponsored Link",
  directLinkTitle: import.meta.env.VITE_ADSTERRA_DIRECT_LINK_TITLE || "Explore sponsor offers",
  homeDesktopUnit: createNativeUnit(
    import.meta.env.VITE_ADSTERRA_NATIVE_SCRIPT_SRC || "",
    import.meta.env.VITE_ADSTERRA_NATIVE_CONTAINER_ID || ""
  ),
  homeMobileUnit: createIframeUnit(import.meta.env.VITE_ADSTERRA_BANNER_320X50_KEY || "", 320, 50),
  toolsDesktopUnit: createIframeUnit(import.meta.env.VITE_ADSTERRA_BANNER_728X90_KEY || "", 728, 90),
  toolsMobileUnit: createIframeUnit(import.meta.env.VITE_ADSTERRA_BANNER_320X50_KEY || "", 320, 50),
  detailDesktopUnit: createIframeUnit(import.meta.env.VITE_ADSTERRA_BANNER_300X250_KEY || "", 300, 250),
  detailMobileUnit: createIframeUnit(import.meta.env.VITE_ADSTERRA_BANNER_320X50_KEY || "", 320, 50),
};
