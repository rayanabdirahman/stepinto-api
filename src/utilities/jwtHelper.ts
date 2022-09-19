import jwt from "jsonwebtoken";
import config from "../config";
import { JWTTokenExpiration } from "../domain/constants";

interface IJWTPayload {
  user: { _id: string };
}

interface IJwtHelper {
  signAccessToken(userId: string): Promise<string>;
  signRefreshToken(userId: string): Promise<string>;
  decodeAccessToken(token: string): Promise<IJWTPayload>;
  decodeRefreshToken(token: string): Promise<IJWTPayload>;
}

const _setPayload = (userId: string): { user: { _id: string } } => {
  return {
    user: {
      _id: userId as unknown as string,
    },
  };
};

const JwtHelper: IJwtHelper = {
  async signAccessToken(userId: string): Promise<string> {
    const payload = _setPayload(userId);

    return jwt.sign(payload, `${config.JWT_ACCESS_TOKEN_SECRET}`, {
      expiresIn: JWTTokenExpiration.ACCESS,
    });
  },
  async signRefreshToken(userId: string): Promise<string> {
    const payload = _setPayload(userId);

    return jwt.sign(payload, `${config.JWT_REFRESH_TOKEN_SECRET}`, {
      expiresIn: JWTTokenExpiration.REFRESH,
    });
  },
  async decodeAccessToken(token: string): Promise<IJWTPayload> {
    const payload = jwt.verify(
      token,
      `${config.JWT_ACCESS_TOKEN_SECRET}`
    ) as IJWTPayload;

    return payload;
  },
  async decodeRefreshToken(token: string): Promise<IJWTPayload> {
    const payload = jwt.verify(
      token,
      `${config.JWT_REFRESH_TOKEN_SECRET}`
    ) as IJWTPayload;

    return payload;
  },
};

export default JwtHelper;
