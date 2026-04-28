import { getAdminCookieName, verifyAdminSessionToken } from "../utils/adminAuth.js";

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((accumulator, part) => {
    const [key, ...value] = part.trim().split("=");

    if (!key) {
      return accumulator;
    }

    accumulator[key] = decodeURIComponent(value.join("="));
    return accumulator;
  }, {});

export const requireAdminAuth = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[getAdminCookieName()];
  const payload = verifyAdminSessionToken(token);

  if (!payload) {
    res.status(401).json({ message: "Unauthorized admin session" });
    return;
  }

  req.admin = payload;
  next();
};
