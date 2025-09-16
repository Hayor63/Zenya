import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import OtpService from "../../../services/otpService";
import UserRepo from "../../../database/repository/userRepo";

const verifyOtpHandler = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  //Ensuring that email and OTP are provided
  if (!email || !otp) {
    return APIResponse.error("Email and OTP are required", 400).send(res);
  }

  //Ensuring OTP is a string, exactly 6 digits, and only numbers
  if (typeof otp !== 'string' || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return APIResponse.error("OTP must be a 6-digit number", 400).send(res);
  }

  try {
     //Checking if user exists in the database
    const user = await UserRepo.findByEmail(email);
    if (!user) {
      return APIResponse.error("User not found", 404).send(res);
    }

    //checking if user is already verified
    if (user.isVerified) {
      return APIResponse.success({
        message: "Email is already verified",
      }).send(res);
    }

    //Checking if there’s an active/pending OTP for this user
    const hasPending = await OtpService.checkPendingVerification(user._id.toString());
    if (!hasPending) {
      return APIResponse.error(
        "No active OTP found. Please request a new verification code.",
        400
      ).send(res);
    }

    // Verifying the provided OTP
    const result = await OtpService.verifyOtp(user._id.toString(), otp);

    if (!result.success) {
      //Handling expired OTP case
      if (result.error?.includes("expired")) {
        return APIResponse.error(
          "OTP has expired. Please request a new one.",
          400
        ).send(res);
      }
      
      //Handling invalid OTP case
      if (result.error?.includes("Invalid")) {
        return APIResponse.error(
          "Invalid OTP. Please check the code and try again.",
          400
        ).send(res);
      }

      //other verification errors
      return APIResponse.error(
        result.error || "Verification failed",
        400
      ).send(res);
    }

        // If OTP was sent successfully return success response
    return APIResponse.success({
      message: "Email verified successfully! You can now log in.",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isVerified: true
      }
    }).send(res);

  } catch (error) {
    return APIResponse.error(
      "Verification failed. Please try again later.",
      500
    ).send(res);
  }
};

export default verifyOtpHandler;
