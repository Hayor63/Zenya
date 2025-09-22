import { DocumentType } from "@typegoose/typegoose";
import { createTransactionInput } from "../../validationSchema/internalTransaction";
import InternalTransactionModel, {
  InternalTransaction,
} from "../model/internalTransactionModel";
import { Wallet } from "../model/walletModel";
import { PartialLoose } from "../../utils/helper";
import { formatResponseRecord } from "../../utils/formatter";

interface TransactionResponseDTO {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: number;
  fees: number;
  description: string;
  createdAt: string;
  processedAt?: string;
  fromWallet?: {
    id: string;
    currency: string;
  };
  toWallet?: {
    id: string;
    currency: string;
  };
}

export function mapTransactionToDTO(tx: any): TransactionResponseDTO {
  return {
    id: tx._id.toString(),
    reference: tx.reference,
    type: tx.type,
    status: tx.status,
    amount: tx.transferAmount,
    fees: tx.internalFees,
    description: tx.description,
    createdAt: tx.createdAt?.toISOString(),
    processedAt: tx.processedAt?.toISOString(),
    fromWallet: tx.fromWalletId
      ? {
          id: tx.fromWalletId._id.toString(),
          currency: tx.fromWalletId.currency,
        }
      : undefined,
    toWallet: tx.toWalletId
      ? { id: tx.toWalletId._id.toString(), currency: tx.toWalletId.currency }
      : undefined,
  };
}

class InternalTransactionsExtend extends InternalTransaction {
  createdAt: Date;
}

type SortLogic = PartialLoose<
  InternalTransactionsExtend,
  "asc" | "desc" | 1 | -1
>;
const defaultSortLogic: SortLogic = { createdAt: -1 };
export interface PaginatedFetchParams {
  pageNumber: number;
  pageSize: number;
  filter: Record<string, any>;
  sortLogic: SortLogic;
  search: string;
  fromDate?: string;
  toDate?: string;
}

export default class internalTransactionRepo {
  // create transaction
  static async createTransaction(internal: createTransactionInput) {
    const transaction = await InternalTransactionModel.create(internal);
    return transaction;
  }

  //Get single transaction details with wallet info
  static async getSingleTransactionDetails(id: string, filter: Record<string, any> = {}) {
    return InternalTransactionModel.findOne({ _id :id, ...filter})
      .populate<{ fromWalletId: DocumentType<Wallet> }>(
        "fromWalletId",
        "balance currency userId"
      )
      .populate<{ toWalletId: DocumentType<Wallet> }>(
        "toWalletId",
        "balance currency userId"
      );
  }

  // View transaction history (with filters)
  static getTransactionHistory = async ({
    pageNumber = 1,
    pageSize = 10,
    filter: _filter,
    sortLogic = defaultSortLogic,
    search,
    fromDate,
    toDate,
  }: Partial<PaginatedFetchParams>) => {
    const allowedFilterKeys = ["status", "type", "userId"];
    const sanitizedFilter = Object.fromEntries(
      Object.entries(_filter || {}).filter(([key]) =>
        allowedFilterKeys.includes(key)
      )
    );
    const filter: any = {
      ...sanitizedFilter,
      ...(fromDate && toDate
        ? {
            createdAt: {
              $gte: new Date(fromDate),
              $lte: new Date(toDate),
            },
          }
        : {}),
      ...(search && {
        $or: [
          { reference: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
          { type: { $regex: search, $options: "i" } },
        ],
      }),
    };
    const [totalItems, transactionHistory] = await Promise.all([
      InternalTransactionModel.countDocuments(filter),
      InternalTransactionModel.find(filter)
        .populate("fromWalletId toWalletId") 
        .sort(sortLogic)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .exec(),
    ]);

    const formattedTransactions: TransactionResponseDTO[] =
      transactionHistory.map(mapTransactionToDTO);

    return {
      data: formattedTransactions,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      pageNumber,
      pageSize,
    };
  };
}
