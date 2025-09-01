import dotenv from "dotenv";
dotenv.config();


export default {
  port: Number(process.env.PORT) || 9000,
  dbURI:
    process.env.NODE_ENV === "development"
      ? process.env.MONGODB_URL
      : process.env.NODE_ENV === "test"
      ? process.env.TEST
      : process.env.DB,
  accessTokenPrivateKey: process.env.ACCESSTOKEN,
  refreshTokenPrivateKey: process.env.REFRESHTOKEN,
  brevoMailkey: process.env.BREVO_MAIL_KEY || "",
  brevoPort: Number(process.env.BREVO_PORT) || 465, // Ensuring it's a number
  brevoHost: process.env.BREVO_HOST || "",
  userMailLogin: process.env.USER_MAIL_LOGIN || "",
  baseUrl: process.env.BASE_URL || "http://localhost:5173",
  emailVerificationPrivateKey: process.env.EMAIL_VERIFICATION_PRIVATE_KEY,
  resetPasswordPrivateKey: process.env.RESET_PASSWORD_PRIVATE_KEY,
  jwtSecretKey: process.env.JWT_SECRET || "your_default_secret_key",
};
