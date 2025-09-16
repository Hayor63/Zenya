import { Router } from "express";
import validate from "../../../middleware/validate";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "../../../validationSchema/user";
import loginHandler from "./login";
import forgotPasswordHandler from "./forgotPassword";
import resetPasswordHandler from "./resetPassword";

const authRoutes = Router();

authRoutes.post("/login", validate(loginSchema), loginHandler);
//reset password
authRoutes.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);

//reset password
authRoutes.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPasswordHandler
);



export default authRoutes;