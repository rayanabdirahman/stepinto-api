import jwt from "jsonwebtoken";
import config from "../config";
import { JWTTokenExpiration } from "../domain/constants";

interface IJwtHelper {
  signAccessToken(userId: string): Promise<string>;
  signRefreshToken(userId: string): Promise<string>;
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
      expiresIn: JWTTokenExpiration.ACCESS,
    });
  },
};

export default JwtHelper;
