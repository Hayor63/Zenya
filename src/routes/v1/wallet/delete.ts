import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import walletRepo from "../../../database/repository/walletRepo";
import mongoose from "mongoose";

const deleteWalletHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Checking if the walletId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return APIResponse.error("Invalid wallet ID", 400).send(res);
    }

    // Attempting to delete the wallet from the database
    const wallet = await walletRepo.deleteWallet(id);

    // If no wallet was found with the return 404
    if (!wallet) {
      return APIResponse.error("Wallet not found", 404).send(res);
    }

    // Successfully deleted wallet
    return APIResponse.success(
      {
        message: "Wallet deleted successfully",
      },
      200
    ).send(res);
  } catch (error) {
    return APIResponse.error(
      "Failed to delete wallet. Please try again later.",
      500
    ).send(res);
  }
};

export default deleteWalletHandler;
