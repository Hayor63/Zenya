import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  Severity,
  index
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

export class ExternalPayment {
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
  amount!: number; // duplicate from transaction for reconciliation

  @prop({ required: true, default: "NGN", enum: ["NGN", "USD", "EUR"] })
  currency!: string; // duplicate for reconciliation

  @prop()
  providerReference?: string; // e.g. pi_123, flw_txn, bank txn id, crypto hash

  @prop({ type: () => Object })
  providerData?: Record<string, any>; // full webhook payload, response

  @prop()
  fees?: number; // gateway fees

  @prop({ enum: ["pending", "completed", "failed"], default: "pending" })
  status!: string;

  @prop()
  gatewayResponse?: string;
}
