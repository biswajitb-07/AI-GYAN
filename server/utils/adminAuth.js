import crypto from "crypto";
import { env } from "../config/env.js";

const COOKIE_NAME = "ai_gyan_admin_session";

const base64UrlEncode = (value) => Buffer.from(value).toString("base64url");
const base64UrlDecode = (value) => Buffer.from(value, "base64url").toString("utf8");

export const createAdminSessionToken = (payload) => {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", env.adminAuthSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
};

export const verifyAdminSessionToken = (token) => {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  const expectedSignature = crypto.createHmac("sha256", env.adminAuthSecret).update(body).digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(body));

  if (!payload?.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
};

export const getAdminCookieName = () => COOKIE_NAME;
