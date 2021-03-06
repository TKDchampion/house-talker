import { db } from "../database/setting";
import { dataBase } from "../database/db-interface";
import { verify } from "./verify-model";
import { generator } from "./common-model/generator";
import * as moment from "moment-timezone";

class CommentModel {
  public async createOrUpdateComment(req: any, type: "C" | "U") {
    const validateMothed =
      type === "U"
        ? await this.isCommentOwner(req)
        : !!verify.getToken(req)?.userId;

    let asyncData: any;
    if (validateMothed) {
      const commentId =
        type === "C"
          ? `comment${generator.generatorId()}`
          : req.query.commentId;
      const createInfo = {
        commentId,
        content: req.body.content,
        articleId: req.body.articleId,
        time: moment(new Date())
          .tz("Asia/Taipei")
          .format("YYYY/MM/DD HH:mm:ss"),
        nickName: verify.getToken(req).nickName,
        userId: verify.getToken(req).userId,
      };
      const reference = db.collection("comments").doc("comment");
      const setParams: any = {};
      setParams[commentId] = createInfo;
      asyncData = dataBase.put({
        reference: reference,
        setParams: setParams,
      });
    } else {
      asyncData = verify.promiseError();
    }

    return asyncData;
  }

  public async deleteComment(req: any) {
    const validateMothed = await this.isCommentOwner(req);

    let asyncData: any;
    if (validateMothed) {
      const reference = db.collection("comments").doc("comment");
      asyncData = dataBase.delete({
        reference: reference,
        setParams: req.query.commentId,
      });
    } else {
      asyncData = verify.promiseError();
    }

    return asyncData;
  }

  public getCommentForArticle(req: any) {
    const reference = db.collection("comments").doc("comment");
    const commentList: any[] = [];
    const formatResultFn = (result: any) => {
      const allComments = result.data();
      const allCommentsIds = Object.keys(allComments);
      allCommentsIds.forEach((id: string, index: number) => {
        if (allComments[id]["articleId"] === req.query.articleId) {
          commentList.push(allComments[id]);
        }
      });

      return commentList;
    };
    const asyncData = dataBase.get({ reference: reference }, formatResultFn);

    return asyncData;
  }

  public isCommentOwner(req: any) {
    if (!verify.getToken(req)?.userId) {
      return false;
    }

    const reference = db.collection("comments").doc("comment");
    const formatResultFn = (result: any) => {
      const allCommentData = result.data();
      return allCommentData[req.query.commentId]?.userId;
    };

    let ownerId: string;
    return dataBase
      .get({ reference: reference }, formatResultFn)
      .then((userId: string) => {
        ownerId = userId;
        return ownerId === verify.getToken(req)?.userId;
      });
  }
}

export const commentModel = new CommentModel();
