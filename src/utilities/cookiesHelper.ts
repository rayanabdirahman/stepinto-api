import { Response } from "express";
import { Cookies } from "../domain/constants";

interface ICookiesHelper {
  setAccessTokens(res: Response, access: string): void;
  setTokens(res: Response, access: string, refresh: string): void;
}

const CookiesHelper: ICookiesHelper = {
  setAccessTokens(res: Response, access: string): void {
    res.cookie(Cookies.ACCESS_TOKEN, access, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  },
  setTokens(res: Response, access: string, refresh: string): void {
    res.cookie(Cookies.ACCESS_TOKEN, access, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie(Cookies.REFRESH_TOKEN, refresh, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    });
  },
};

export default CookiesHelper;
