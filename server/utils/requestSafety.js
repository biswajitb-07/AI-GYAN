export const clampString = (value, maxLength) => String(value || "").trim().slice(0, maxLength);

export const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const toSafeRegex = (value) => new RegExp(escapeRegex(value), "i");

export const isValidHttpUrl = (value) => {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const sanitizePath = (value) => {
  const normalized = clampString(value, 300);
  return normalized.startsWith("/") ? normalized : "";
};
