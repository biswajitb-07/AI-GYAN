import rateLimit from "express-rate-limit";

const buildLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

export const authLimiter = buildLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Please try again later.",
});

export const analyticsLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: "Too many analytics requests. Please slow down.",
});

export const aiLimiter = buildLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many AI requests. Please try again in a minute.",
});
