import { Request, Response } from "express";
import mongoose from "mongoose";
import APIResponse from "../../../utils/api";
import InternalTransactionModel, { InternalTransaction } from "../../../database/model/internalTransactionModel";
import { DocumentType } from "@typegoose/typegoose";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
    email?: string;
  };
}

// Allowed statuses in the system
const ALLOWED_STATUSES = ["pending", "completed", "failed", "cancelled"];

// Define which transitions are allowed
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["completed", "failed", "cancelled"], // pending can move to these
  completed: [], // once completed, it's final
  failed: [], // once failed, can't change
  cancelled: [], // once cancelled, can't change
};

const auditStatusChange = (
  transactionId: string,
  adminId: string,
  oldStatus: string,
  newStatus: string,
  reason?: string
) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action: "TRANSACTION_STATUS_UPDATE",
    transactionId,
    adminId,
    oldStatus,
    newStatus,
    reason: reason || "Manual admin update",
    level: "AUDIT",
  };

  console.log(JSON.stringify(auditEntry));
  // TODO: Save to audit table/service for compliance
};

const updateTransactionHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const adminId = req.user?._id;

  try {
    // Validating transaction ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return APIResponse.error("Invalid transaction ID", 400).send(res);
    }

    if (!adminId) {
      return APIResponse.error("Unauthorized: admin ID missing", 403).send(res);
    }

    // Validating status input
    if (!status) {
      return APIResponse.error("Status is required", 400).send(res);
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return APIResponse.error(
        `Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
        400
      ).send(res);
    }

    // Fetching current transaction
    const transaction = await InternalTransactionModel.findById(id);
    if (!transaction) {
      return APIResponse.error("Transaction not found", 404).send(res);
    }

    // Checking if status is actually changing
    if (transaction.status === status) {
      return APIResponse.error(`Transaction is already ${status}`, 400).send(
        res
      );
    }

    // Checking valid transitions
    if (!VALID_TRANSITIONS[transaction.status].includes(status)) {
      return APIResponse.error(
        `Invalid transition: cannot go from ${transaction.status} to ${status}`,
        400
      ).send(res);
    }

    // Preparing update data
    const updateData: Partial<DocumentType<InternalTransaction>> = {
      status,
      lastModifiedBy: new mongoose.Types.ObjectId(adminId),
      lastModifiedAt: new Date(),
      processedAt: status !== "pending" ? new Date() : undefined,
    };

    // Performing the update
    const updatedTransaction = await InternalTransactionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return APIResponse.error("Failed to update transaction", 500).send(res);
    }

    // Auditing log
    auditStatusChange(id, adminId!, transaction.status, status, reason);

    return APIResponse.success(
      {
        message: "Transaction status updated successfully",
        data: {
          id: updatedTransaction._id.toString(),
          previousStatus: transaction.status,
          status: updatedTransaction.status,
          updatedBy: adminId,
          updatedAt: updatedTransaction.lastModifiedAt,
          processedAt: updatedTransaction.processedAt,
        },
      },
      200
    ).send(res);
  } catch (error: any) {
    console.error("Transaction update error:", {
      transactionId: id,
      adminId,
      requestedStatus: status,
      error: error.message,
      stack: error.stack,
    });

    let statusCode = 500;
    let message = "Failed to update transaction status";

    if (error.name === "ValidationError") {
      statusCode = 400;
      message = "Invalid transaction data";
    } else if (error.name === "CastError") {
      statusCode = 400;
      message = "Invalid transaction ID format";
    }

    return APIResponse.error(message, statusCode).send(res);
  }
};

export default updateTransactionHandler;
