import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import UserRepo from "../../../database/repository/userRepo";
import OtpService from "../../../services/otpService";

const resendOtpHandler = async (req: Request, res: Response) => {
  const { email } = req.body;

  // Making sure the user provided an email
  if (!email) {
    return APIResponse.error("Email is required", 400).send(res);
  }

  try {
    //  Checking if the user exists in the system
    const user = await UserRepo.findByEmail(email);
    if (!user) {
      return APIResponse.error("User not found", 404).send(res);
    }

    // checking If the user is already verified, no need to resend OTP
    if (user.isVerified) {
      return APIResponse.error("Email is already verified", 400).send(res);
    }

    // resending a new OTP (rate limiting is handled in the service)
    const otpResult = await OtpService.resendSignupOtp(
      user._id.toString(),
      email,
      user.fullName
    );

    //  Handling errors when sending OTP
    if (!otpResult.success) {
      // If it failed due to rate limiting (too many requests) tell user how long to wait
      if (otpResult.waitTime) {
        return APIResponse.error(
          `Please wait ${otpResult.waitTime} seconds before requesting a new OTP.`,
          429
        ).send(res);
      }
      // For any other failure, return a generic error
      return APIResponse.error(
        otpResult.error || "Failed to resend OTP",
        400
      ).send(res);
    }

    //return a success response
    return APIResponse.success({
      message: "New OTP sent to your email",
    }).send(res);
  } catch (error) {
    console.error("Resend OTP error:", error);
    return APIResponse.error(
      "Failed to resend OTP. Please try again later.",
      500
    ).send(res);
  }
};

export default resendOtpHandler;
