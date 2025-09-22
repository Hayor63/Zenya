import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  Severity,
  index,
} from "@typegoose/typegoose";
import { Wallet } from "./walletModel";
import { InternalTransaction } from "./internalTransactionModel";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
// quick lookup from webhook
@index({ providerReference: 1 })
export class ExternalTransaction {
  @prop({ required: true, ref: () => InternalTransaction, index: true })
  transactionId!: Ref<InternalTransaction>;

  @prop({
    required: true,
    enum: [
      "stripe",
      "paypal",
      "flutterwave",
      "paystack",
      "bank",
      "crypto",
      "manual",
    ],
  })
  provider!: string;

  @prop({ required: true })
  amount!: number;

  @prop({ required: true, default: "NGN" })
  currency!: string;

  @prop({ required: true, enum: ["deposit", "withdrawal"] })
  type!: "deposit" | "withdrawal";

  @prop()
  serviceFee!: number; 

  @prop()
  providerReference?: string;

  @prop({ type: () => Object })
  providerData?: Record<string, any>;

  @prop()
  providerFee?: number;

  @prop({ enum: ["pending", "completed", "failed"], default: "pending" })
  status!: string;

  @prop()
  processedAt?: Date;

  @prop()
  gatewayResponse?: string;

  @prop()
  rawWebhookData?: Record<string, any>;

  @prop({ default: 0 })
  webhookAttempts?: number;

  @prop()
  lastWebhookAt?: Date;
}

const ExternalTransactionModel = getModelForClass(ExternalTransaction);
export default ExternalTransactionModel;
