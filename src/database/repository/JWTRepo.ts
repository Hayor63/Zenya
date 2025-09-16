import { signjwt, verifyjwt } from "../../utils/jwt";
import { User } from "../model/userModel";

interface ResetTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export default class JWTRepo {
  // Generate access token for authentication
  static signAccessToken = (
    user: Omit<User, "__v" | "password" | "verifyPassword">
  ) => {
    const accessToken = signjwt(user, "accessTokenPrivateKey", {
      expiresIn: "30d",
    });
    return accessToken;
  };

  // Generate email verification token
  static signEmailVerificationToken = (userId: string, email: string) => {
    const verificationToken = signjwt(
      { userId, email },
      "emailVerificationPrivateKey",
      { expiresIn: "30m" }
    );
    return verificationToken;
  };

  // Sign a password reset token
  static signResetToken = (userId: string) => {
    const resetToken = signjwt({ userId }, "resetPasswordPrivateKey", {
      expiresIn: "1h",
    });
    return resetToken;
  };

  //verify password reset token
  static verifyResetToken = (token: string) => {
    return verifyjwt<ResetTokenPayload>(token, "resetPasswordPrivateKey");
  };
}
