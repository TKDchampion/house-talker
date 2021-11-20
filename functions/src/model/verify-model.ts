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
    const token = req.header("Authorization");
    if (!token) {
      return;
    }

    try {
      return jwt.verify(
        req.header("Authorization").replace("Bearer ", ""),
        Key.JWT
      );
    } catch (error) {
      return;
    }
  }

  public formatResultErrorFn = (result: any) => {
    return { message: "user unauthorized", errorStatus: 401 } as ErrorContent;
  };

  public promiseError = () => {
    return new Promise((resolve) => {
      resolve({
        message: "user unauthorized",
        statusCode: 401,
      } as ErrorContent);
    });
  };
}

export const verify = new VerifyModel();
