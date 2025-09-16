import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import UserRepo from "../../../database/repository/userRepo";
import JWTRepo from "../../../database/repository/JWTRepo";
import TokenModel from "../../../database/model/tokenModel";
import argon2 from "argon2";
import sendEmail from "../../../services/sendMail";
import config from "../../../../config/default";

const resetPasswordHandler = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Validating input
    if (!token || !newPassword) {
      return APIResponse.error("Token and new password are required", 400).send(
        res
      );
    }

    // Validating password strength
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return APIResponse.error(
        "Password must be at least 6 characters long",
        400
      ).send(res);
    }

    // Verifing JWT token and extract user ID
    let userId: string;
    try {
      const decoded = JWTRepo.verifyResetToken(token as string);
      if (!decoded) {
        return APIResponse.error("Invalid or expired token", 400).send(res);
      }
      userId = decoded.userId;
    } catch (error) {
      return APIResponse.error("Invalid or expired token", 400).send(res);
    }

    // Checking if token exists in database and is not expired
    const tokenRecord = await TokenModel.findOne({
      userId,
      token: token as string,
      expiredAt: { $gt: new Date() },
    }).lean();

    if (!tokenRecord) {
      return APIResponse.error("Invalid or expired token", 400).send(res);
    }

    // Finding  the user
    const user = await UserRepo.findById(userId);
    if (!user) {
      return APIResponse.error("User not found", 404).send(res);
    }

    // Checking if user is verified
    if (!user.isVerified) {
      return APIResponse.error("Please verify your email first", 400).send(res);
    }

    // Hashing the new password
    const hashedPassword = await argon2.hash(newPassword);

    // Updating user's password
    await UserRepo.updateUserProfile(userId, {
      password: hashedPassword,
    });

    //sending email notification to user
    const emailSent = await sendEmail({
      fullName: user.fullName,
      from: config.userMailLogin,
      to: user.email,
      subject: "Password Reset Confirmation",
      text: `Your password was sucessfully changed. If this wasn't you, contact support immediately.`,
    });

    // Checking if email was sent successfully
    if (!emailSent.success) {
      return APIResponse.error(
        "Failed to send reset email. Please try again later.",
        500
      ).send(res);
    }
    // Deleting all reset tokens for this user
    await TokenModel.deleteMany({ userId });

    return APIResponse.success({
      message:
        "Password reset successfully. You can now login with your new password.",
    }).send(res);
  } catch (error) {
    return APIResponse.error(
      "Failed to reset password. Please try again later.",
      500
    ).send(res);
  }
};

export default resetPasswordHandler;
