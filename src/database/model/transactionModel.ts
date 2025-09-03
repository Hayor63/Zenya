import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  Severity,
} from "@typegoose/typegoose";
import { Wallet } from "./walletModel";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Transaction {
  @prop({ required: true, ref: () => Wallet })
  walletId!: Ref<Wallet>; 

  @prop({ ref: () => Wallet })
  fromWalletId?: Ref<Wallet>; 

  @prop({ ref: () => Wallet })
  toWalletId?: Ref<Wallet>; 

  @prop({ required: true, default: 0 })
  amount!: number;

  @prop({ required: true, default: "NGN" })
  currency!: string;

  @prop({
    required: true,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  })
  status!: "pending" | "completed" | "failed";

  @prop({ required: true, unique: true })
  reference!: string;

  @prop({ required: true, enum: ["deposit", "withdrawal", "transfer"] })
  type!: "deposit" | "withdrawal" | "transfer";

  @prop({ type: () => Object })
  metadata?: Record<string, any>;
}

const TransactionModel = getModelForClass(Transaction);
export default TransactionModel;
