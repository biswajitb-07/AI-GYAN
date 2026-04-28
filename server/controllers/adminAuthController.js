import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createAdminSessionToken, getAdminCookieName } from "../utils/adminAuth.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
};

const buildAdminPayload = () => ({
  email: env.adminEmail,
  role: "admin",
  exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim();
  const password = String(req.body.password || "");

  if (email !== env.adminEmail || password !== env.adminPassword) {
    res.status(401);
    throw new Error("Invalid admin credentials");
  }

  const payload = buildAdminPayload();
  const token = createAdminSessionToken(payload);

  res.cookie(getAdminCookieName(), token, cookieOptions);
  res.json({
    data: {
      email: payload.email,
      role: payload.role,
    },
  });
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  res.clearCookie(getAdminCookieName(), { ...cookieOptions, maxAge: 0 });
  res.json({ success: true });
});

export const getAdminSession = asyncHandler(async (req, res) => {
  res.json({
    data: {
      email: req.admin.email,
      role: req.admin.role,
    },
  });
});
