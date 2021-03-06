import { Key } from "../database/private-key";
import { ErrorContent } from "../view-model/error-viewmodel";

const jwt = require("jsonwebtoken");

class VerifyModel {
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
      return false;
    }
  }

  public getTokenAlready(token: string) {
    if (!token) {
      return;
    }

    try {
      return jwt.verify(token, Key.JWT);
    } catch (error) {
      return false;
    }
  }

  public promiseError = (message = "user unauthorized", statusCode = 401) => {
    return new Promise((resolve) => {
      resolve({
        message,
        statusCode,
      } as ErrorContent);
    });
  };
}

export const verify = new VerifyModel();
