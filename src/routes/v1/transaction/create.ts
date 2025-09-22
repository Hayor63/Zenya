import { Request, Response } from "express";
import mongoose from "mongoose";
import APIResponse from "../../../utils/api";
import walletRepo from "../../../database/repository/walletRepo";
import InternalTransactionModel from "../../../database/model/internalTransactionModel";
import { generateReference } from "../../../utils/ref";
import internalTransactionRepo from "../../../database/repository/internalTransationRepo";
import WalletModel from "../../../database/model/walletModel";

interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

const createInternalTransactionHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  let session: mongoose.ClientSession | null = null;

  try {
    const userId = req.user?._id;
    const { toWalletId, transferAmount, description, idempotencyKey } = req.body;

    // --- Basic Validation ---
    if (!toWalletId || !transferAmount || !description) {
      return APIResponse.error("All fields are required", 400).send(res);
    }

    if (!mongoose.Types.ObjectId.isValid(toWalletId)) {
      return APIResponse.error("Invalid destination wallet ID", 400).send(res);
    }

    if (typeof transferAmount !== "number" || transferAmount <= 0) {
      return APIResponse.error("Amount must be a positive number", 400).send(res);
    }

    // --- Start DB session ---
    session = await mongoose.startSession();
    let transactionResult;

    await session.withTransaction(async () => {
      // --- Fetch wallets ---
      const fromWallet = await WalletModel.findOne({ userId });
      const toWallet = await walletRepo.getWalletById(toWalletId, session);

      if (!fromWallet || !toWallet) {
        throw new Error("Wallet not found");
      }

      if (fromWallet._id.toString() === toWallet._id.toString()) {
        throw new Error("Cannot transfer to the same wallet");
      }

      if (fromWallet.isFrozen) throw new Error("Source wallet is frozen");
      if (toWallet.isFrozen) throw new Error("Destination wallet is frozen");

      // --- Balance checks ---
      const feeRate = 0.02;
      const internalFees = Math.round(transferAmount * feeRate * 100) / 100;
      const totalDeduction = transferAmount + internalFees;

      if (fromWallet.balance < totalDeduction) {
        throw new Error("Insufficient balance");
      }

      const senderBalanceBefore = fromWallet.balance;
      const senderBalanceAfter = senderBalanceBefore - totalDeduction;

      const receiverBalanceBefore = toWallet.balance;
      const receiverBalanceAfter = receiverBalanceBefore + transferAmount;

      // --- Generate reference ---
      const reference = generateReference("transfer");

      // --- Create transaction ---
      const transactionData = {
        userId,
        fromWalletId: fromWallet._id,
        toWalletId,
        transferAmount,
        description: description.trim(),
        internalFees,
        balanceBefore: senderBalanceBefore,
        balanceAfter: senderBalanceAfter,
        type: "transfer",
        status: "completed",
        reference,
        idempotencyKey,
        metadata: {
          receiverBalanceBefore,
          receiverBalanceAfter,
        },
      };

      const [transaction] = await InternalTransactionModel.create(
        [transactionData],
        { session }
      );

      // --- Update wallets ---
      await walletRepo.updateWalletBalance(fromWallet._id.toString(), senderBalanceAfter, session);
      await walletRepo.updateWalletBalance(toWallet._id.toString(), receiverBalanceAfter, session);

      // --- Store result for response ---
      transactionResult = {
        transaction: {
          id: transaction._id.toString(),
          reference,
          transferAmount,
          internalFees,
          status: transaction.status,
        },
        fromWallet: { newBalance: senderBalanceAfter },
        toWallet: { newBalance: receiverBalanceAfter },
      };
    });

    return APIResponse.success(
      { message: "Internal transfer completed successfully", transactionResult },
      201
    ).send(res);
  } catch (error: any) {
    console.error("Create internal transaction error:", error.message || error);
    return APIResponse.error(error.message || "Failed to create transaction", 500).send(res);
  } finally {
    if (session) await session.endSession();
  }
};


export default createInternalTransactionHandler;
