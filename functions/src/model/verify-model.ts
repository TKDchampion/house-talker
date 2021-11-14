import { Key } from "../database/private-key";
import { ErrorContent } from "../view-model/error-viewmodel";

const jwt = require("jsonwebtoken");

class VerifyModel {
  public account: string = "";
  public password: string = "";

  public verifyUser(req: any, ftn: Function) {
    return jwt.verify(
      req.header("Authorization").replace("Bearer ", ""),
      Key.JWT,
      (error: { message: any }, decoded: any) => {
        if (error) {
          return this.formatResultErrorFn;
        }

        if (decoded.account) {
          return ftn;
        } else {
          return this.formatResultErrorFn;
        }
      }
    );
  }

  public getToken(req: any) {
    return !!req.header("Authorization")
      ? jwt.verify(req.header("Authorization").replace("Bearer ", ""), Key.JWT)
      : this.formatResultErrorFn;
  }

  public formatResultErrorFn = (result: any) => {
    return { message: "user unauthorized", errorStatus: 401 } as ErrorContent;
  };
}

export const verify = new VerifyModel();
