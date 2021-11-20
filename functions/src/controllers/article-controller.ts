import { Request, Response } from "express";
import { articleModel } from "../model/article-model";

class ArticleController {
  createArticle(req: Request, res: Response) {
    const result = articleModel.createOrUpdateArticle(req, "C");
    result.then((response: any) => {
      const statusCode = response.statusCode ? response.statusCode : 200;
      return res.status(statusCode).send(response);
    });
  }

  updateArticle(req: Request, res: Response) {
    const result = articleModel.createOrUpdateArticle(req, "U");
    result.then((response: any) => res.send(response));
  }

  getAllNewsArticles(req: Request, res: Response) {
    const result = articleModel.getAllNewsArticles(req);
    result.then((response: any) => res.send(response));
  }

  getDetailsArticle(req: Request, res: Response) {
    const result = articleModel.getDetailsArticle(req);
    result.then((response: any) => res.send(response));
  }

  getArticeForUser(req: Request, res: Response) {
    const result = articleModel.getArticeForUser(req);
    result.then((response: any) => {
      const statusCode = response.statusCode ? response.statusCode : 200;
      return res.status(statusCode).send(response);
    });
  }
}

export const articleController = new ArticleController();
