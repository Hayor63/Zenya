import { Request, Response } from "express";
import mongoose from "mongoose";
import APIResponse from "../../../utils/api";
import walletRepo from "../../../database/repository/walletRepo";
import WalletModel from "../../../database/model/walletModel";

const updateWalletHandler = async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;
    const { metadata } = req.body;
// Checking if the walletId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(walletId)) {
      return APIResponse.error("Invalid wallet ID", 400).send(res);
    }
    // Validating that metadata is provided and is an object
    if (!metadata || typeof metadata !== "object") {
      return APIResponse.error(
        "Metadata must be provided as an object",
        400
      ).send(res);
    }

     // updating the wallet in the database
    const updatedWallet = await walletRepo.updateWallet(walletId, { metadata });

    if (!updatedWallet) {
      return APIResponse.error("Wallet not found", 404).send(res);
    }

    return APIResponse.success(
      {
        message: "Wallet updated successfully",
        data: {
          id: updatedWallet._id?.toString(),
          userId: updatedWallet.userId,
          metadata: updatedWallet.metadata,
        },
      },
      200
    ).send(res);
  } catch (error) {
    console.error("updateWalletHandler error:", error);
    return APIResponse.error("Server error while updating wallet", 500).send(
      res
    );
  }
};

export default updateWalletHandler;
