import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  Severity,
  index,
} from "@typegoose/typegoose";
import { Wallet } from "./walletModel";
import { User } from "./userModel";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
@index({ reference: 1 }, { unique: true })
@index({ status: 1, type: 1 })
@index({ fromWalletId: 1, createdAt: -1 })
@index({ toWalletId: 1, createdAt: -1 })
export class InternalTransaction {
  @prop({ ref: () => User })
  userId!: Ref<User>;

  @prop({ ref: () => Wallet })
  fromWalletId?: Ref<Wallet>;

  @prop({ ref: () => Wallet })
  toWalletId?: Ref<Wallet>;

  @prop({ required: true, min: 0 })
  transferAmount!: number;

  @prop({ required: true })
  description!: string;

  @prop({ required: true, default: 0 })
  internalFees!: number;

  @prop({ required: true })
  balanceBefore!: number;

  @prop({ required: true })
  balanceAfter!: number;

  @prop({ required: true, default: "NGN" })
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

  @prop({ ref: () => User })
  lastModifiedBy?: Ref<User>;

  @prop()
  lastModifiedAt?: Date;

  @prop({ required: true })
  reference!: string;

  @prop({ required: true, enum: ["deposit", "withdrawal", "transfer"] })
  type!: "deposit" | "withdrawal" | "transfer";

  @prop({ default: false })
  isSettled!: boolean;

  @prop()
  settledAt?: Date;

  @prop({ type: () => Object })
  metadata?: Record<string, any>;

  @prop({ ref: () => InternalTransaction })
  reversalId?: Ref<InternalTransaction>;

  @prop({ default: false })
  isReversed!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const InternalTransactionModel = getModelForClass(InternalTransaction);
export default InternalTransactionModel;
