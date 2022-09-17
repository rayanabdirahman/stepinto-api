import { injectable, inject } from "inversify";
import { IUserDocument } from "../database/models/user.model";
import { IUserRepository } from "../database/repositories/user.repository";
import { ISignUpModel } from "../domain/interfaces/account";
import TYPES from "../types";
import logger from "../utilities/logger";

export interface IAccountService {
  signUp(model: ISignUpModel): Promise<any>;
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

  async signUp(model: ISignUpModel): Promise<IUserDocument> {
    try {
      // check for a valid default username
      const username = await this.validateUsername(model.username);

      // create new user
      const user = await this.userRepository.createOne({ ...model, username });

      return user;
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
}
