import { Request, Response } from "express";
import { userModel } from "../model/user-model";

class UserController {
  //取得所有會員
  getAllAccounts(req: Request, res: Response) {
    const result = userModel.getAllAccounts(req);
    result.then((response: any) => res.send(response));
  }

  login(req: Request, res: Response) {
    const result = userModel.login(req);
    result.then((response: any) => {
      const statusCode = response.statusCode ? response.statusCode : 200;
      return res.status(statusCode).send(response);
    });
  }

  signUp(req: Request, res: Response) {
    const result = userModel.signUp(req);
    result.then((response: any) => {
      const statusCode = response.statusCode ? response.statusCode : 200;
      return res.status(statusCode).send(response);
    });
  }

  test(req: Request, res: Response) {
    const result = userModel.test(req);
    result.then((response: any) => res.send(response));
  }
}

export const userController = new UserController();
