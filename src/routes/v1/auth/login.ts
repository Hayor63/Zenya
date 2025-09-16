import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import UserRepo from "../../../database/repository/userRepo";
import JWTRepo from "../../../database/repository/JWTRepo";
import WalletModel from "../../../database/model/walletModel";

const loginHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    
  // Input validation
    if (!email || !password) {
      return APIResponse.error("Email and password are required", 400).send(res);
    }

    // Finding user by email
    const user = await UserRepo.findByEmail(email);
    if (!user) {
      return APIResponse.error("Invalid email or password", 401).send(res);
    }

    // Checking if user is verified
    if (!user.isVerified) {
      return APIResponse.error("Please verify email before logging in", 403).send(res);
    }

    // Verifing password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return APIResponse.error("Invalid email or password", 401).send(res);
    }

    // Generating access token
    const { password: _, ...rest } = user.toObject();
    const accessToken = JWTRepo.signAccessToken(rest);

    //Fetching wallet for the user
    const wallet = await WalletModel.findOne({ userId: user._id });
    
    // Returning success response with token + wallet
    return APIResponse.success({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      wallet: wallet
        ? {
            id: wallet._id,
            balance: wallet.balance,
            currency: wallet.currency,
          }
        : null, 
    }).send(res);
  } catch (error) {
    return APIResponse.error((error as Error).message, 500).send(res);
  }
};

export default loginHandler;
