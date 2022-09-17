import { AccountRolesEnum } from "../enums/account";

export interface ISignUpModel {
  name: string;
  username: string;
  email: string;
  avatar: string;
  password: string;
  role: AccountRolesEnum;
}

export interface IGoogleSignUpModel {
  googleId: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role?: AccountRolesEnum;
}
