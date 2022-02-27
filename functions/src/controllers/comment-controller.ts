import { commentModel } from "./../model/comment-model";
import { Request, Response } from "express";

class CommentController {
  createComment(req: Request, res: Response) {
    const result = commentModel.createOrUpdateComment(req, "C");
    result.then((response: any) => {
      const statusCode = response.statusCode ? response.statusCode : 200;
      return res.status(statusCode).send(response);
    });
  }

  updateComment(req: Request, res: Response) {
    const result = commentModel.createOrUpdateComment(req, "U");
    result.then((response: any) => {
      const statusCode = response.statusCode ? response.statusCode : 200;
      return res.status(statusCode).send(response);
    });
  }

  getCommentForArticle(req: Request, res: Response) {
    const result = commentModel.getCommentForArticle(req);
    result.then((response: any) => {
      const statusCode = response.statusCode ? response.statusCode : 200;
      return res.status(statusCode).send(response);
    });
  }

  deleteComment(req: Request, res: Response) {
    const result = commentModel.deleteComment(req);
    result.then((response: any) => {
      const statusCode = response.statusCode ? response.statusCode : 200;
      return res.status(statusCode).send(response);
    });
  }
}

export const commentController = new CommentController();
