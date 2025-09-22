import { Request, Response } from "express";
import APIResponse from "../../../utils/api";
import mongoose from "mongoose";
import internalTransactionRepo, {
  mapTransactionToDTO,
} from "../../../database/repository/internalTransationRepo";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
  };
}

const getSingleTransactionHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const userRole = req.user?.role;

  try {
    // Validating MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return APIResponse.error("Invalid transaction ID", 400).send(res);
    }

    // Building filter based on user role
    const filter: Record<string, any> = {};
    if (userId && userRole !== "admin") {
      filter.userId = userId;
    }

    // Fetching transaction with populated wallet details
    const transaction =
      await internalTransactionRepo.getSingleTransactionDetails(id, filter);

    if (!transaction) {
      return APIResponse.error("Transaction not found", 404).send(res);
    }

    // Using the existing DTO mapping
    const transactionData = mapTransactionToDTO(transaction);

    return APIResponse.success(
      {
        message: "Transaction retrieved successfully",
        data: transactionData,
      },
      200
    ).send(res);
  } catch (error: any) {
    console.error("Single transaction fetch error:", {
      transactionId: id,
      userId,
      error: error.message,
      stack: error.stack,
    });

    return APIResponse.error(
      error.message || "Failed to retrieve transaction",
      500
    ).send(res);
  }
};

export default getSingleTransactionHandler;
