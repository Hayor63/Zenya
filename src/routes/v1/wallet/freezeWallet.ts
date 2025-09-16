import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import walletRepo from "../../../database/repository/walletRepo";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

const freezeWalletHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { walletId } = req.params;

    // validating walletId exists
    if (!walletId) {
      return APIResponse.error("Wallet ID is required", 400).send(res);
    }

    //Validating ObjectId format
    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return APIResponse.error("Invalid wallet ID format", 400).send(res);
    }

    // Checking if wallet exists and current status
    const existingWallet = await walletRepo.getWalletById(walletId);
    if (!existingWallet) {
      return APIResponse.error("Wallet not found", 404).send(res);
    }

    if (existingWallet.isFrozen) {
      return APIResponse.error("Wallet is already frozen", 409).send(res);
    }

    //Freeze the wallet
    const wallet = await walletRepo.freezeWallet(walletId);

    if (!wallet) {
      return APIResponse.error("Failed to freeze wallet", 500).send(res);
    }

    //Returning success with proper data
    return APIResponse.success(
      {
        message: "Wallet frozen successfully",
        data: {
          id: walletId, 
          isFrozen: wallet.isFrozen,
          userId: wallet.userId, 
          balance: wallet.balance 
        },
      },
      200
    ).send(res);
  } catch (error) {
    console.error("freezeWalletHandler error:", error);

    return APIResponse.error(
      "Failed to freeze wallet. Please try again later.",
      500
    ).send(res);
  }
};

export default freezeWalletHandler