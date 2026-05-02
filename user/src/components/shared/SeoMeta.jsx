import { useEffect } from "react";

const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL || "https://aigyan.online").replace(/\/+$/, "");
const SITE_NAME = "Ai Gyan";

const upsertMetaTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const upsertLinkTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const SeoMeta = ({ title, description, canonicalPath = "/", image = "/logo.png", type = "website" }) => {
  useEffect(() => {
    const normalizedPath = canonicalPath === "/" ? "/" : `/${String(canonicalPath).replace(/^\/+/, "").replace(/\/+$/, "")}`;
    const canonicalUrl = normalizedPath.startsWith("http") ? normalizedPath : `${SITE_ORIGIN}${normalizedPath}`;
    const imageUrl = image.startsWith("http") ? image : `${SITE_ORIGIN}${image}`;

    document.title = title;
    upsertMetaTag('meta[name="description"]', { name: "description", content: description });
    upsertMetaTag('meta[name="robots"]', { name: "robots", content: "index,follow,max-image-preview:large" });
    upsertMetaTag('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMetaTag('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMetaTag('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMetaTag('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMetaTag('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    upsertMetaTag('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
    upsertMetaTag('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMetaTag('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMetaTag('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMetaTag('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    upsertLinkTag('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });
  }, [canonicalPath, description, image, title, type]);

  return null;
};

export default SeoMeta;
