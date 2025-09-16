import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import walletRepo from "../../../database/repository/walletRepo";
import mongoose from "mongoose";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
  };
}

const unfreezeWalletHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Checking if walletId was provided
    if (!id) {
      return APIResponse.error("Wallet ID is required", 400).send(res);
    }

    // Validating ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return APIResponse.error("Invalid wallet ID format", 400).send(res);
    }

    // Checking if wallet exists
    const existingWallet = await walletRepo.getWalletById(id);
    if (!existingWallet) {
      return APIResponse.error("Wallet not found", 404).send(res);
    }

    // Ensuring it's currently frozen
    if (!existingWallet.isFrozen) {
      return APIResponse.error("Wallet is not frozen", 409).send(res);
    }

    // Unfreeze the wallet
    const wallet = await walletRepo.unfreezeWallet(id);

    if (!wallet) {
      return APIResponse.error("Failed to unfreeze wallet", 500).send(res);
    }

    // Return success
    return APIResponse.success(
      {
        message: "Wallet unfrozen successfully",
        data: {
          id: wallet._id.toString(),
          isFrozen: wallet.isFrozen,
          userId: wallet.userId,
          balance: wallet.balance,
        },
      },
      200
    ).send(res);
  } catch (error) {
    console.error("unfreezeWalletHandler error:", error);

    return APIResponse.error(
      "Failed to unfreeze wallet. Please try again later.",
      500
    ).send(res);
  }
};

export default unfreezeWalletHandler;
