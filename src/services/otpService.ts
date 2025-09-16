import crypto from "crypto";
import OTPRepo from "../database/repository/OTPRepo";
import sendEmail from "../services/sendMail";
import config from "../../config/default";
import UserRepo from "../database/repository/userRepo";

// Defining a consistent result type for OTP operations
interface OtpResult {
  success: boolean;
  error?: string;   
  waitTime?: number; // For rate-limiting (how long to wait before retry)
}

class OtpService {
  // Generating a numeric OTP of given length (default = 6 digits)
  static generateOtp(length: number = 6): string {
    const max = Math.pow(10, length) - 1; 
    const min = Math.pow(10, length - 1); 
    return crypto.randomInt(min, max).toString(); 
  }

  // send OTP email to user
  private static async sendOtpEmail(
    email: string,
    fullName: string,
    otp: string
  ): Promise<OtpResult> {
    try {
      const emailSent = await sendEmail({
        from: config.userMailLogin,
        to: email,
        fullName,
        subject: "Email Verification",
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
      });

      return emailSent.success
        ? { success: true }
        : { success: false, error: "Failed to send OTP email" };
    } catch (error) {
      return { success: false, error: "Email service failed" };
    }
  }

  // Sending OTP on signup (with rate limiting)
  static async sendSignupOtp(
    userId: string,
    email: string,
    fullName: string
  ): Promise<OtpResult> {
    // Checking if user is allowed to request OTP (rate limit)
    const canRequest = await OTPRepo.canRequestOtp(userId);
    if (!canRequest.success) {
      return {
        success: false,
        error: canRequest.error,
        waitTime: canRequest.waitTime, // How long they must wait
      };
    }

    // Generating new OTP & set 10-minute expiry
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await OTPRepo.createOrUpdate(userId, otp, expiresAt); // Save OTP to DB
    } catch (error) {
      return { success: false, error: "Failed to generate OTP" };
    }

    // Sending OTP to user's email
    return this.sendOtpEmail(email, fullName, otp);
  }

  // Verifying OTP (and mark user verified if successful)
  static async verifyOtp(userId: string, otp: string): Promise<OtpResult> {
    const result = await OTPRepo.verifyOtp(userId, otp);
    if (!result.success) {
      return result; 
    }

    // Fetching user
    const user = await UserRepo.findById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Marking user as verified (if not already)
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    return { success: true };
  }

  // Resending OTP (rate-limited)
  static async resendSignupOtp(
    userId: string,
    email: string,
    fullName: string
  ): Promise<OtpResult> {
    // Generating new OTP
    const otp = this.generateOtp();

    const result = await OTPRepo.resendOtp(userId, otp);
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        waitTime: result.waitTime, // Return cooldown time if blocked
      };
    }

    return this.sendOtpEmail(email, fullName, otp);
  }

  // Checking if user currently has a pending OTP
  static async checkPendingVerification(userId: string): Promise<boolean> {
    return await OTPRepo.hasPendingVerification(userId);
  }

  // Cleaning up expired OTPs 
  static async cleanupExpiredOtps(): Promise<{ deletedCount: number }> {
    const deletedCount = await OTPRepo.purgeExpired();
    return { deletedCount };
  }
}

export default OtpService;