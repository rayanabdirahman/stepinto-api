export enum JWTTokenExpiration {
  ACCESS = "30s",
  REFRESH = "1w",
}

export enum Cookies {
  ACCESS_TOKEN_NAME = "JWTAccessToken",
  REFRESH_TOKEN_NAME = "JWTRefreshToken",
}
