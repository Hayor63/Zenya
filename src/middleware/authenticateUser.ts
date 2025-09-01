import { NextFunction, Request, Response } from "express";
import APIResponse from "../utils/api";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!res.locals.user) {
    return APIResponse.error("Access token is required").send(res);
  }
  req.user = res.locals.user;
  next();
};

export default authenticateUser;
