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
    result.then((response: any) => res.send(response));
  }

  singin(req: Request, res: Response) {
    const result = userModel.singin(req);
    result.then((response: any) => res.send(response));
  }

  //   getUserCounts(req: Request, res: Response) {
  //     const result = userModel.getUserCounts(req);
  //     result.then((response: any) => res.send(response));
  //   }

  createArticle(req: Request, res: Response) {
    const result = userModel.createOrUpdateArticle(req, "C");
    result.then((response: any) => res.send(response));
  }

  updateArticle(req: Request, res: Response) {
    const result = userModel.createOrUpdateArticle(req, "U");
    result.then((response: any) => res.send(response));
  }

  test(req: Request, res: Response) {
    const result = userModel.test(req);
    result.then((response: any) => res.send(response));
  }
}

export const userController = new UserController();
