import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import UserRepo from "../../../database/repository/userRepo";
import JWTRepo from "../../../database/repository/JWTRepo";
import TokenModel from "../../../database/model/tokenModel";
import sendEmail from "../../../services/sendMail";
import config from "../../../../config/default";

const forgotPasswordHandler = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return APIResponse.error("Email is required", 400).send(res);
  }

  try {
    // Finding user by email
    const user = await UserRepo.findByEmail(email);
    if (!user) {
      return APIResponse.success({
        message:
          "If an account exists with this email, you will receive a password reset link.",
      }).send(res);
    }

    // Checking if user is verified
    if (!user.isVerified) {
      return APIResponse.error(
        "Please verify your email first before resetting password",
        400
      ).send(res);
    }

    // Generating reset token
    const resetToken = JWTRepo.signResetToken(user._id.toString());

    // Removing any existing reset tokens for this user
    await TokenModel.deleteMany({ userId: user._id });

    // Storing the reset token in the database (1 hour expiry)
    await TokenModel.create({
      userId: user._id,
      token: resetToken,
      expiredAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Creating reset link and Send email to user with reset link
    const resetLink = `${config.baseUrl}/reset-password?token=${resetToken}`;

    const emailSent = await sendEmail({
      fullName: user.fullName,
      from: config.userMailLogin,
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}. This link will expire in 10 minutes.`,
    });

    // Checking if email was sent successfully
    if (!emailSent.success) {
      return APIResponse.error(
        "Failed to send reset email. Please try again later.",
        500
      ).send(res);
    }

    return APIResponse.success({
      message: "Password reset email sent successfully",
    }).send(res);
  } catch (error) {
    return APIResponse.error(
      "Failed to process password reset request. Please try again later.",
      500
    ).send(res);
  }
};

export default forgotPasswordHandler;
