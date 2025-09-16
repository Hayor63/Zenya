import { Router } from "express";
import validate from "../../../middleware/validate";
import { createUserSchema, loginSchema, resendOtpVerificationSchema, verifyOtpSchema } from "../../../validationSchema/user";
import createUserHandler from "./create";
import verifyOtpHandler from "./verifyOtp";
import resendOtpHandler from "./resendOtpVerification";

const userRoutes = Router();

userRoutes.post("/", validate(createUserSchema), createUserHandler);
userRoutes.patch("/verify-Otp", validate(verifyOtpSchema), verifyOtpHandler);
userRoutes.post("/resend-Otp-Verification", validate(resendOtpVerificationSchema), resendOtpHandler);



export default userRoutes;