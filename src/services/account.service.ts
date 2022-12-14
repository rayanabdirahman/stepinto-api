import { injectable, inject } from "inversify";
import { IUserDocument } from "../database/models/user.model";
import { IUserRepository } from "../database/repositories/user.repository";
import { ISignInModel, ISignUpModel } from "../domain/interfaces/account";
import TYPES from "../types";
import BycryptHelper from "../utilities/bcryptHelper";
import JwtHelper from "../utilities/jwtHelper";
import logger from "../utilities/logger";

export interface IAccountService {
  signUp(
    model: ISignUpModel
  ): Promise<{ accessToken: string; refreshToken: string }>;
  signIn(
    model: ISignInModel
  ): Promise<{ accessToken: string; refreshToken: string }>;
  getUserById(_id: string): Promise<IUserDocument | null>;
}

@injectable()
export class AccountServiceImpl implements IAccountService {
  private userRepository: IUserRepository;

  constructor(@inject(TYPES.UserRepository) userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async validateUsername(username: string): Promise<string> {
    let isAvailable = false;
    do {
      const user = await this.userRepository.findOneBy({ username });
      if (user) {
        username += (+new Date() * Math.random()).toString().substring(0, 2);
        isAvailable = true;
      } else {
        isAvailable = false;
      }
    } while (isAvailable);

    return username;
  }

  async signUp(
    model: ISignUpModel
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // check for a valid default username
      const username = await this.validateUsername(model.username);

      const user = await this.userRepository.createOne({ ...model, username });

      const accessToken = await JwtHelper.signAccessToken(user._id);

      const refreshToken = await JwtHelper.signRefreshToken(user._id);

      return { accessToken, refreshToken };
    } catch (error: any) {
      if (error?.code === 11000) {
        error.message = `A user with the given credentials exists`;
      }
      logger.error(
        `[AccountService: signUp]: Unabled to create a new user: ${error}`
      );
      throw error;
    }
  }

  async signIn(
    model: ISignInModel
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // find user by email address
      const dbUser = await this.userRepository.findOneBy(
        { email: model.email },
        false
      );
      if (!dbUser) {
        throw new Error("Invalid credentials");
      }

      const { password: hashedPassword, ...user } = dbUser.toObject();

      // check if passwords match
      const doPasswordsMatch = await BycryptHelper.comparePassword(
        model.password,
        hashedPassword
      );
      if (!doPasswordsMatch) {
        throw new Error("Invalid credentials");
      }

      const accessToken = await JwtHelper.signAccessToken(user._id as string);

      const refreshToken = await JwtHelper.signRefreshToken(user._id as string);

      return { accessToken, refreshToken };
    } catch (error: any) {
      logger.error(`[AccountService: signIn]: Unabled to find user: ${error}`);
      throw error;
    }
  }

  async getUserById(_id: string): Promise<IUserDocument | null> {
    try {
      // find user by id
      const user = await this.userRepository.findOneBy({ _id });

      return user;
    } catch (error: any) {
      logger.error(
        `[AccountService: getUserById]: Unabled to find user: ${error}`
      );
      throw error;
    }
  }
}
