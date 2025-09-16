import { Request, Response } from "express";
import walletRepo from "../../../database/repository/walletRepo";
import APIResponse from "../../../utils/api";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

const getWalletBalanceHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;

    // checking if user ID is not present
    if (!userId) {
      return APIResponse.error("Unauthorized", 401).send(res);
    }
    // Fetching wallet balance
    const balance = await walletRepo.getWalletBalance(userId);

    // If no wallet is found for the user, return a 404 error
    if (balance === null) {
      return APIResponse.error("Wallet not found", 404).send(res);
    }

    return APIResponse.success(
      {
        message: "Wallet balance retrieved successfully",
        data: {
          balance: balance,
          currency: "NGN",
        },
      },
      200
    ).send(res);
  } catch (error) {
    console.error("getUserWallet error:", error);

    return APIResponse.error(
      "Failed to retrieve wallet Balance. Please try again later.",
      500
    ).send(res);
  }
};

export default getWalletBalanceHandler;
