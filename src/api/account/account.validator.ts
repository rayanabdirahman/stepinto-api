import Joi from "joi";
import { AccountRolesEnum } from "../../domain/enums/account";
import { ISignInModel, ISignUpModel } from "../../domain/interfaces/account";

export default class AccountValidator {
  static signUpSchema: Joi.ObjectSchema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(15).required(),
    avatar: Joi.string().required(),
    role: Joi.string().valid(...Object.values(AccountRolesEnum)),
  });

  static signUp(model: ISignUpModel): Joi.ValidationResult {
    return this.signUpSchema.validate(model);
  }

  static signInSchema: Joi.ObjectSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(15).required(),
  });

  static signIn(model: ISignInModel): Joi.ValidationResult {
    return this.signInSchema.validate(model);
  }
}
