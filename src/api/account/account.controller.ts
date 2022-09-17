import { Application, Request, Response } from "express";
import { inject, injectable } from "inversify";
import config from "../../config";
import { ISignUpModel } from "../../domain/interfaces/account";
import { IAccountService } from "../../services/account.service";
import TYPES from "../../types";
import ApiResponse from "../../utilities/apiResponse";
import getAvatar from "../../utilities/getAvatar";
import logger from "../../utilities/logger";
import { RegistrableController } from "../registrable.controller";
import AccountValidator from "./account.validator";

@injectable()
export default class AccountController implements RegistrableController {
  private accountService: IAccountService;

  constructor(@inject(TYPES.AccountService) accountService: IAccountService) {
    this.accountService = accountService;
  }

  registerRoutes(app: Application): void {
    app.post(`/${config.API_URL}/accounts/auth/signup`, this.signUp);
  }

  signUp = async (req: Request, res: Response): Promise<Response> => {
    try {
      const model: ISignUpModel = {
        ...req.body,
        // set default username
        username: `${req.body.name.split(" ")[0]}${
          req.body.name.split(" ")[1]
        }`,
        // default user avatar
        avatar: getAvatar.default(req.body.name),
        role: req.body.role && req.body.role,
      };

      // validate request body
      const validity = AccountValidator.signUp(model);
      if (validity.error) {
        const { message } = validity.error;
        return ApiResponse.error(res, message);
      }

      const user = await this.accountService.signUp(model);

      return ApiResponse.success(res, { user });
    } catch (error: any) {
      logger.error(
        `[AccountController: signup] - Unable to sign up user: ${error?.message}`
      );
      return ApiResponse.error(res, error?.message);
    }
  };
}
