import { Request } from "express";
import rateLimit from "express-rate-limit";

export interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

export const genLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req: AuthenticatedRequest): string => {
    // using userId if exists
    const userId = req.user?._id?.toString();
    if (userId) return userId;

    // fallback to IP safely (ensure string)
    return req.ip || "unknown-ip";
  },
  message: "Too many transaction history requests, try again later",
});

export default genLimiter;
