import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import walletRepo from "../../../database/repository/walletRepo";

const getAllWalletHandler = async (req: Request, res: Response) => {
  try {
    // Calling the wallet repository to get all wallets
    const wallets = (await walletRepo.getAllWallets()) || [];
    // Sending a successful response with the retrieved wallets and their count
    return APIResponse.success(
      {
        message:
          wallets.length > 0
            ? "Wallets retrieved successfully"
            : "No wallets found",
        data: wallets,
        count: wallets.length,
      },
      200
    ).send(res);
  } catch (error) {
    console.error("getAllWalletHandler error:", error);
    return APIResponse.error(
      "Failed to retrieve wallets. Please try again later.",
      500
    ).send(res);
  }
};

export default getAllWalletHandler;
