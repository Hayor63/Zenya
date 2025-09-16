import { Request, Response } from "express";
import mongoose, { ClientSession } from "mongoose";
import UserRepo from "../../../database/repository/userRepo";
import APIResponse from "../../../utils/api";
import OtpService from "../../../services/otpService";
import WalletModel, { Wallet } from "../../../database/model/walletModel";
import { User } from "../../../database/model/userModel";
import { DocumentType } from "@typegoose/typegoose";

const createUserHandler = async (req: Request, res: Response) => {
  const { email, fullName, password } = req.body;

  // Input validation
  if (!email || !fullName || !password) {
    return APIResponse.error(
      "Email, full name, and password are required",
      400
    ).send(res);
  }

  // Declaring variables in function scope
  let newUser: DocumentType<User> | undefined;
  let wallet: DocumentType<Wallet> | undefined;

  try {
    // Checking if user already exists outside transaction for performance
    const existingUser = await UserRepo.findByEmail(email);

    if (existingUser) {
      // Handling unverified existing user
      if (!existingUser.isVerified) {
        const hasPending = await OtpService.checkPendingVerification(
          existingUser._id.toString()
        );

        if (hasPending) {
          return APIResponse.success({
            message:
              "An OTP is already active for this email. Please check your email or wait to request a new one.",
            user: {
              id: existingUser._id.toString(),
              email: existingUser.email,
              fullName: existingUser.fullName,
            },
          }).send(res);
        }

        // Resend OTP for unverified user
        const otpResult = await OtpService.resendSignupOtp(
          existingUser._id.toString(),
          email,
          existingUser.fullName
        );

        if (!otpResult.success) {
          if (otpResult.waitTime) {
            return APIResponse.error(
              `${otpResult.error} Please wait ${otpResult.waitTime} seconds.`,
              429
            ).send(res);
          }
          return APIResponse.error(
            otpResult.error || "Failed to resend OTP",
            400
          ).send(res);
        }

        return APIResponse.success({
          message: "New OTP sent to your email. Please verify to continue.",
          user: {
            id: existingUser._id.toString(),
            email: existingUser.email,
            fullName: existingUser.fullName,
          },
        }).send(res);
      }

      // User exists and is already verified
      return APIResponse.error(
        "Email already exists and is verified",
        409
      ).send(res);
    }

    // if User doesn't exist, create new user and wallet in transaction
    const session: ClientSession = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Creating user first
        newUser = await UserRepo.createUser(
          { email, fullName, password },
          { session }
        );

        if (!newUser?._id) {
          throw new Error("Failed to create user - no ID returned");
        }

        // Creating wallet for the user
        const walletArray = await WalletModel.create(
          [
            {
              userId: newUser._id,
              balance: 0,
              currency: "NGN",
              isFrozen: false,
            },
          ],
          { session }
        );

        wallet = walletArray[0] as DocumentType<Wallet>;

        if (!wallet?._id) {
          throw new Error("Failed to create wallet - no ID returned");
        }

      });
    } catch (transactionError) {
      console.error("Transaction failed:", transactionError);
      throw new Error(
        `Transaction failed: ${
          transactionError instanceof Error
            ? transactionError.message
            : "Unknown error"
        }`
      );
    } finally {
      await session.endSession();
    }

    // safety check 
    if (!newUser || !wallet) {
      return APIResponse.error("Failed to create user or wallet", 500).send(
        res
      );
    }

    //Sending OTP outside transaction since it's external service
    const otpResult = await OtpService.sendSignupOtp(
      newUser._id.toString(),
      email,
      newUser.fullName
    );

    if (!otpResult.success) {
      if (otpResult.waitTime) {
        return APIResponse.error(
          `${otpResult.error} Please wait ${otpResult.waitTime} seconds.`,
          429
        ).send(res);
      }

      return APIResponse.error(
        otpResult.error ||
          "Failed to send verification email. Please try again.",
        500
      ).send(res);
    }

    // Success response
    return APIResponse.success(
      {
        message:
          "User registration successful. Please verify your email using the OTP sent.",
        user: {
          id: newUser._id.toString(), 
          email: newUser.email, 
          fullName: newUser.fullName, 
          isVerified : newUser.isVerified
        },
        wallet: {
          id: wallet._id.toString(),
          balance: wallet.balance,
          currency: wallet.currency,
        },
      },
      201
    ).send(res);
  } catch (error) {
    return APIResponse.error(
      "Registration failed. Please try again later.",
      500
    ).send(res);
  }
};

export default createUserHandler;
