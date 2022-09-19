import { Application, Request, Response } from "express";
import { inject, injectable } from "inversify";
import config from "../../config";
import { Cookies } from "../../domain/constants";
import { ISignInModel, ISignUpModel } from "../../domain/interfaces/account";
import { IAccountService } from "../../services/account.service";
import TYPES from "../../types";
import ApiResponse from "../../utilities/apiResponse";
import CookiesHelper from "../../utilities/cookiesHelper";
import getAvatar from "../../utilities/getAvatar";
import JwtHelper from "../../utilities/jwtHelper";
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
    app.post(`/${config.API_URL}/accounts/auth/signin`, this.signIn);
    app.post(`/${config.API_URL}/accounts/auth/signout`, this.signOut);
    app.get(`/${config.API_URL}/accounts/auth/user`, this.authenticateUser);
    app.post(`/${config.API_URL}/accounts/auth/refresh`, this.refreshToken);
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

      const { accessToken, refreshToken } = await this.accountService.signUp(
        model
      );

      CookiesHelper.setTokens(res, accessToken, refreshToken);

      return ApiResponse.success(res, { message: "SIGNED_UP" });
    } catch (error: any) {
      logger.error(
        `[AccountController: signup] - Unable to sign up user: ${error?.message}`
      );
      return ApiResponse.error(res, error?.message);
    }
  };

  signIn = async (req: Request, res: Response): Promise<Response> => {
    try {
      const model: ISignInModel = {
        ...req.body,
      };

      // validate request body
      const validity = AccountValidator.signIn(model);
      if (validity.error) {
        const { message } = validity.error;
        return ApiResponse.error(res, message);
      }

      const { accessToken, refreshToken } = await this.accountService.signIn(
        model
      );

      CookiesHelper.setTokens(res, accessToken, refreshToken);

      return ApiResponse.success(res, { message: "SIGNED_IN" });
    } catch (error: any) {
      logger.error(
        `[AccountController: signIn] - Unable to sign in user: ${error?.message}`
      );
      return ApiResponse.error(res, error?.message);
    }
  };

  signOut = async (req: Request, res: Response): Promise<Response> => {
    try {
      CookiesHelper.clearTokens(res);

      return ApiResponse.success(res, { message: "SIGNED_OUT" });
    } catch (error: any) {
      logger.error(
        `[AccountController: signOut] - Unable to sign out user: ${error?.message}`
      );
      return ApiResponse.error(res, error?.message);
    }
  };

  authenticateUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const accessTokenCookie = req.cookies[Cookies.ACCESS_TOKEN];

      const jwtPayload = await JwtHelper.decodeAccessToken(accessTokenCookie);

      const user = await this.accountService.getUserById(jwtPayload.user._id);

      return ApiResponse.success(res, { user });
    } catch (error: any) {
      logger.error(
        `[AccountController: authenticateUser] - Unable to authenticate user: ${error?.message}`
      );

      const { message } = error;

      if (message === "jwt expired") {
        return ApiResponse.error(res, "UNAUTHENTICATED", 401);
      }
      return ApiResponse.error(res, error?.message);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshTokenCookie = req.cookies[Cookies.REFRESH_TOKEN];

      console.log("COOKIES: ", refreshTokenCookie);

      const jwtPayload = await JwtHelper.decodeRefreshToken(refreshTokenCookie);

      const newAccessToken = await JwtHelper.signAccessToken(
        jwtPayload.user._id
      );

      CookiesHelper.setAccessTokens(res, newAccessToken);

      return ApiResponse.success(res, { message: "ACCESS_TOKEN_REFRESHED" });
    } catch (error: any) {
      logger.error(
        `[AccountController: refreshToken] - Unable to refresh token: ${error?.message}`
      );

      const { message } = error;

      if (message === "jwt expired") {
        return ApiResponse.error(res, "UNAUTHENTICATED", 401);
      }
      return ApiResponse.error(res, error?.message);
    }
  };
}
