import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import walletRepo from "../../../database/repository/walletRepo";
import mongoose from "mongoose";

const getWalletByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
 // Checking if the walletId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return APIResponse.error("Invalid wallet ID", 400).send(res);
    }

  // Checking if wallet exists
    const wallet = await walletRepo.getWalletById(id);

    if (!wallet) {
      return APIResponse.error("Wallet not found", 404).send(res);
    }

    return APIResponse.success(
      {
        message: "Wallet retrieved successfully",
        data: {
          id: wallet._id.toString(),
          userId: wallet.userId, 
          balance: wallet.balance,
          currency: wallet.currency,
          isFrozen: wallet.isFrozen, 
          
        },
      },
      200
    ).send(res);
  } catch (error) {
    console.error("getWalletByIdHandler error:", error);

    return APIResponse.error(
      "Failed to retrieve wallet. Please try again later.",
      500
    ).send(res);
  }
};

export default getWalletByIdHandler;
