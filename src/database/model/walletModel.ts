import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  Severity,
  index,
  DocumentType
} from "@typegoose/typegoose";
import { User } from "./userModel";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})

// @index({ userId: 1 }) // fast lookup by user
export class Wallet {
  @prop({ required: true, ref: () => User, unique:true })
  userId!: Ref<User>; 

  @prop({ required: true, default: 0 })
  balance!: number; 

  @prop({ required: true, default: "NGN" })
  currency!: string; 

  @prop({ default: false })
  isFrozen?: boolean;

  @prop({ type: () => Object })
  metadata?: Record<string, any>; 
}

const WalletModel = getModelForClass(Wallet);
export default WalletModel;

export type WalletDoc = DocumentType<Wallet>;