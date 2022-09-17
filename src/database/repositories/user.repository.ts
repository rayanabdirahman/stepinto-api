import { injectable } from "inversify";
import { Types } from "mongoose";
import {
  IGoogleSignUpModel,
  ISignUpModel,
} from "../../domain/interfaces/account";
import User, { IUserDocument } from "../models/user.model";

export interface IUserRepository {
  createOne(model: ISignUpModel | IGoogleSignUpModel): Promise<IUserDocument>;
  findOneBy(model: any, safeguard?: boolean): Promise<IUserDocument | null>;
  findOneByIdAndUpdate(
    _id: Types.ObjectId,
    update: any
  ): Promise<IUserDocument | null>;
}

@injectable()
export class UserRepositoryImpl implements IUserRepository {
  async createOne(
    model: ISignUpModel | IGoogleSignUpModel
  ): Promise<IUserDocument> {
    const user = new User(model);
    return await user.save();
  }

  async findOneBy(model: any, safeguard = true): Promise<IUserDocument | null> {
    return safeguard
      ? await User.findOne(model).select("-password -__v")
      : await User.findOne(model);
  }

  async findOneByIdAndUpdate(
    _id: Types.ObjectId,
    update: any
  ): Promise<IUserDocument | null> {
    return await User.findByIdAndUpdate(_id, update, { new: true });
  }
}
