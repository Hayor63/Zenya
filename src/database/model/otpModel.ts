import {
  DocumentType,
  getModelForClass,
  modelOptions,
  pre,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { User } from "./userModel";
import * as argon2 from "argon2";

// Interface for timestamps
interface OtpTimestamps {
  createdAt: Date;
  updatedAt: Date;
}
@modelOptions({
  schemaOptions: { timestamps: true },
})
@pre<Otp>("save", async function (this: DocumentType<Otp>) {
  if (!this.isModified("otp")) return;
  this.otp = await argon2.hash(this.otp);
})
export class Otp implements OtpTimestamps {
  @prop({ required: true, ref: () => User })
  userId!: Ref<User>;

  @prop({ required: true })
  otp!: string;

  @prop({ required: true })
  expiresAt!: Date;

  @prop({ default: false })
  isUsed!: boolean;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;

  async verifyOtp(
    this: DocumentType<Otp>,
    candidateOtp: string
  ): Promise<boolean> {
    try {
      return await argon2.verify(this.otp, candidateOtp);
    } catch {
      return false;
    }
  }
}

const OtpModel = getModelForClass(Otp);
export default OtpModel;
