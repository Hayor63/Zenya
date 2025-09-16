import { DocumentType } from "@typegoose/typegoose";
import UserModel, { User } from "../model/userModel";
import { ClientSession } from "mongoose";

export default class UserRepo {
  //create user
 static async createUser(
    user: Partial<User>,
    options?: { session?: ClientSession }
  ): Promise<DocumentType<User>> {
    const createdUser = await UserModel.create([user], options);
    return createdUser[0] as DocumentType<User>;
  }

  //find user by email
  static findByEmail = async (
    email: string
  ): Promise<DocumentType<User> | null> => {
    const user = await UserModel.findOne({ email });
    return user;
  };

  //find user by ids
  static findById = async (id: string): Promise<DocumentType<User> | null> => {
    const user = await UserModel.findById(id);
    return user;
  };

  //update user profile
  static updateUserProfile: (
    id: string,
    updateParams: Partial<User>
  ) => Promise<Omit<User, "password"> | null> = async (id, updateParams) => {
    const { password, ...rest } = updateParams;
    const updatedUser = await UserModel.findByIdAndUpdate(id, rest, {
      new: true,
      runValidators: true,
    }).select("-password");
    return updatedUser;
  };

  //delete user
  static deleteUser = async (
    id: string
  ): Promise<DocumentType<User> | null> => {
    const user = await UserModel.findByIdAndDelete(id);
    return user;
  };
}
