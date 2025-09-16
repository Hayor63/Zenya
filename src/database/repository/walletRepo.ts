import { DocumentType } from "@typegoose/typegoose";
import WalletModel, { Wallet } from "../model/walletModel";

export default class walletRepo {
  // Get the current user's wallet
  static async getWalletByUserId(
    userId: string
  ): Promise<DocumentType<Wallet> | null> {
    return await WalletModel.findOne({ userId });
  }

  // Get wallet balance
  static async getWalletBalance(userId: string): Promise<number | null> {
    const wallet = await WalletModel.findOne({ userId }, "balance")
      .lean()
      .exec();
    return wallet?.balance ?? null;
  }

  // Get wallet by walletId(admin)
  static async getWalletById(id: string): Promise<DocumentType<Wallet> | null> {
    return await WalletModel.findById(id);
  }

  // Get all wallets (admin)
  static async getAllWallets(): Promise<Wallet[]> {
    return await WalletModel.find().lean().exec();
  }

  // Freeze wallet (admin)
  static async freezeWallet(
    walletId: string
  ): Promise<DocumentType<Wallet> | null> {
    return WalletModel.findByIdAndUpdate(
      walletId,
      { isFrozen: true },
      { new: true }
    ).exec();
  }

  // Unfreeze wallet (admin)
  static async unfreezeWallet(walletId: string): Promise<Wallet | null> {
    return WalletModel.findByIdAndUpdate(
      walletId,
      { isFrozen: false },
      { new: true }
    )
      .lean()
      .exec();
  }

  // Update wallet metadata/currency (admin)
  static async updateWallet(
    walletId: string,
    update: Partial<Pick<Wallet,  "metadata">>
  ): Promise<DocumentType<Wallet>| null> {
    return WalletModel.findByIdAndUpdate(walletId, update, { new: true })
  }

  // Delete wallet (admin)
  static async deleteWallet(id: string): Promise<Wallet | null> {
    return WalletModel.findByIdAndDelete(id).lean().exec();
  }
}
