import { Response } from "express";
import { Cookies } from "../domain/constants";

interface ICookiesHelper {
  setTokens(res: Response, access: string, refresh: string): void;
}

const CookiesHelper: ICookiesHelper = {
  setTokens(res: Response, access: string, refresh: string): void {
    res.cookie(Cookies.ACCESS_TOKEN_NAME, access, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie(Cookies.REFRESH_TOKEN_NAME, refresh, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    });
  },
};

export default CookiesHelper;
