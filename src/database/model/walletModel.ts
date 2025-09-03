import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
  Severity,
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
export class Wallet {
  @prop({ required: true, ref: () => User })
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
