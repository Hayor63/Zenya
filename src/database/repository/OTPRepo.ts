import OtpModel, { Otp } from "../model/otpModel";
import { DocumentType } from "@typegoose/typegoose";

interface OtpVerificationResult {
  success: boolean;
  error?: string;
  userId?: string;
}

interface ResendResult {
  success: boolean;
  error?: string;
  waitTime?: number; 
}

export default class OTPRepo {
  //  Creating or updating OTP for a user
  static async createOrUpdate(
    userId: string,
    otp: string,
    expiresAt: Date = new Date(Date.now() + 10 * 60 * 1000)
  ): Promise<DocumentType<Otp>> {
    // Invalidating any existing OTP for this user
    await OtpModel.updateMany({ userId, isUsed: false }, { isUsed: true });

    const newOTP = new OtpModel({
      userId,
      otp, 
      expiresAt,
    });

    return newOTP.save();
  }

  //  Verifing OTP for a specific user and marking it as used if valid
  static async verifyOtp(
    userId: string,
    inputOtp: string
  ): Promise<OtpVerificationResult> {
    try {
      const otpRecord = await OtpModel.findOne({
        userId,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return {
          success: false,
          error: "No valid OTP found. Please request a new one.",
        };
      }

      if (new Date() > otpRecord.expiresAt) {
        return {
          success: false,
          error: "OTP has expired. Please request a new one.",
        };
      }

      const isValid = await otpRecord.verifyOtp(inputOtp);

      if (isValid) {
        otpRecord.isUsed = true;
        await otpRecord.save();

        return {
          success: true,
          userId: otpRecord.userId.toString(),
        };
      } else {
        return {
          success: false,
          error: "Invalid OTP. Please check and try again.",
        };
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      return {
        success: false,
        error: "Verification failed. Please try again.",
      };
    }
  }

  //  Rate limiting to prevent spam
  static async canRequestOtp(userId: string): Promise<ResendResult> {
    // Checking recent OTP requests (last 2 minutes)
    const recentOtps = await OtpModel.find({
      userId,
      createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) },
    }).sort({ createdAt: -1 });

    // Rate limiting: max 2 OTPs per 2 minutes
    if (recentOtps.length >= 2) {
      const oldestRecent = recentOtps[recentOtps.length - 1];
      const waitTime = Math.max(
        0,
        Math.ceil(
          (oldestRecent.createdAt.getTime() + 2 * 60 * 1000 - Date.now()) / 1000
        )
      );

      return {
        success: false,
        error: "Too many OTP requests. Please wait before requesting again.",
        waitTime: Math.max(waitTime, 0),
      };
    }

    // Checking if there's an active, unexpired OTP
    const activeOtp = await OtpModel.findOne({
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (activeOtp) {
      // Allow resend if OTP is older than 1 minute
      const otpAge = Date.now() - activeOtp.createdAt.getTime();
      if (otpAge < 60 * 1000) {
        const waitTime = Math.ceil((60 * 1000 - otpAge) / 1000);
        return {
          success: false,
          error: "Please wait before requesting a new OTP. Check your email first.",
          waitTime,
        };
      }
    }

    return { success: true };
  }

  //  Resend OTP with validation
  static async resendOtp(
    userId: string,
    newOtp: string
  ): Promise<ResendResult> {
    const canRequest = await this.canRequestOtp(userId);
    if (!canRequest.success) {
      return canRequest;
    }

    try {
      await this.createOrUpdate(userId, newOtp);
      return { success: true };
    } catch (error) {
      console.error("OTP resend error:", error);
      return {
        success: false,
        error: "Failed to resend OTP. Please try again.",
      };
    }
  }

  //  Cleaning up expired OTPs 
  static async purgeExpired(): Promise<number> {
    const result = await OtpModel.deleteMany({
      $or: [
        // Delete expired OTPs
        { expiresAt: { $lte: new Date() } },
        // Delete used OTPs older than 24 hours
        {
          isUsed: true,
          createdAt: { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      ],
    });
    return result.deletedCount || 0;
  }

  // Checking if user has pending verification
  static async hasPendingVerification(userId: string): Promise<boolean> {
    const activeOtp = await OtpModel.findOne({
      userId,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
    return !!activeOtp;
  }
}