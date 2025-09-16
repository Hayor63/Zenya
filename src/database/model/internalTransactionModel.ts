import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  Severity,
  index
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
@index({ reference: 1 }, { unique: true }) 

export class InternalTransaction {
  @prop({ required: true, ref: () => Wallet })
  walletId!: Ref<Wallet>;

  @prop({ ref: () => Wallet })
  fromWalletId?: Ref<Wallet>;

  @prop({ ref: () => Wallet })
  toWalletId?: Ref<Wallet>;

  @prop({ required: true, min: 0 })
  amount!: number;

  @prop({ required: true })
  description!: string;

  @prop({ required: true, default: 0 })
  fees!: number;

  @prop({ required: true })
  balanceBefore!: number; 

  @prop({ required: true })
  balanceAfter!: number;

  @prop({ required: true, default: "NGN", enum: ["NGN", "USD", "EUR"] })
  currency!: string;

  @prop({
    required: true,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  })
  status!: "pending" | "completed" | "failed";

  @prop()
  failureReason?: string;

  @prop()
  processedAt?: Date;

  @prop({ required: true, unique: true })
  reference!: string;

  @prop({ required: true, enum: ["deposit", "withdrawal", "transfer"] })
  type!: "deposit" | "withdrawal" | "transfer";

  @prop({ type: () => Object })
  metadata?: Record<string, any>;
}

const InternalTransactionModel = getModelForClass(InternalTransaction);
export default InternalTransactionModel;
