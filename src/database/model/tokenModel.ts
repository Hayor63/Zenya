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
  export class Token {
    @prop({ required: true, ref: () => User })
    userId!: Ref<User>;
  
    @prop({ required: true })
    token!: string;
  
    @prop({ default: Date.now, expires: 1800 })
    expiredAt!: Date;
  }
  
  const TokenModel = getModelForClass(Token);
  export default TokenModel;
  