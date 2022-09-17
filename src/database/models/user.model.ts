import mongoose from "mongoose";
import { AccountRolesEnum } from "../../domain/enums/account";
import BycryptHelper from "../../utilities/bcryptHelper";

export interface IUserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  googleId: string | undefined;
  name: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  verified: boolean;
  role: AccountRolesEnum[];
}

const UserSchema: mongoose.Schema = new mongoose.Schema(
  {
    googleId: { type: String },
    name: { type: String, required: true, trim: true, text: true },
    username: {
      type: String,
      required: true,
      trim: true,
      text: true,
      unique: true,
    },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    verified: { type: Boolean, default: false },
    role: {
      type: [String],
      enum: [AccountRolesEnum],
      default: AccountRolesEnum.BUYER,
    },
  },
  { timestamps: true }
);

// Encrypt user password before saving
UserSchema.pre("save", async function () {
  if (this.isModified("password")) {
    // hash user password
    const password = await BycryptHelper.encryptPassword(this.get("password"));
    this.set({ password });
  }
});

export default mongoose.model<IUserDocument>("User", UserSchema);
