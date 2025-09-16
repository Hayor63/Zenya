import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import walletRepo from "../../../database/repository/walletRepo";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

const getUserWallet = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    // checking if user ID is not present
    if (!userId) {
      return APIResponse.error("Unauthorized", 401).send(res);
    }
  // Checking if wallet exists
    const wallet = await walletRepo.getWalletByUserId(userId);

    if (!wallet) {
      return APIResponse.error("Wallet not found", 404).send(res);
    }

    // Returning only necessary wallet information
    return APIResponse.success(
      {
        message: "Wallet retrieved successfully",
        data: {
          id: wallet._id.toString(),
          balance: wallet.balance,
          currency: wallet.currency,
        },
      },
      200
    ).send(res);
  } catch (error) {
    console.error("getUserWallet error:", error);
    return APIResponse.error(
      "Failed to retrieve wallet. Please try again later.",
      500
    ).send(res);
  }
};

export default getUserWallet;
