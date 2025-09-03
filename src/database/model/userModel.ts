import {
  DocumentType,
  getModelForClass,
  modelOptions,
  pre,
  prop,
  Severity,
} from "@typegoose/typegoose";
import * as argon2 from "argon2";

export const privateFields = ["password", "__v"];

@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: Record<string, any>) {
        privateFields.forEach((field) => delete ret[field]);
      },
    },
    toObject: {
      transform: function (doc, ret: Record<string, any>) {
        privateFields.forEach((field) => delete ret[field]);
      },
    },
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
@pre<User>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hash = await argon2.hash(this.password);
  this.password = hash;
  return;
})
export class User {
  @prop({ required: true, trim: true })
  fullName!: string;

  @prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @prop({ required: true })
  password: string;

  @prop({ enum: ["admin", "user"], required: true })
  role!: "admin" | "user";

  @prop({ default: false })
  isVerified?: boolean;

  async verifyPassword(this: DocumentType<User>, candidatePassword: string) {
    try {
      const result = await argon2.verify(this.password, candidatePassword);
      return result;
    } catch (error) {
      console.log("Argon2 verify error:", error);
      return false;
    }
  }
}

const UserModel = getModelForClass(User);
export default UserModel;
