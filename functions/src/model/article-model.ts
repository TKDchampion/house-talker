import { db } from "../database/setting";
import { dataBase } from "../database/db-interface";
import { verify } from "./verify-model";
import { generator } from "./common-model/generator";
import * as moment from "moment";
import { commentModel } from "./comment-model";

class ArticleModel {
  public async createOrUpdateArticle(req: any, type: "C" | "U") {
    const validateMothed =
      type === "U"
        ? await this.isArticleOwner(req)
        : !!verify.getToken(req)?.userId;

    let asyncData: any;
    if (validateMothed) {
      const articleId =
        type === "C"
          ? `article${generator.generatorId()}`
          : req.query.articleId;
      const createInfo = {
        content: req.body.content,
        location: req.body.location,
        nickName: req.body.nickName,
        isHiddenName: req.body.isHiddenName,
        summaryContent: req.body.summaryContent,
        tips: req.body.tips,
        title: req.body.title,
        time: moment(new Date())
          .tz("Asia/Taipei")
          .format("YYYY/MM/DD HH:mm:ss"),
        userId: verify.getToken(req).userId,
        articleId,
      };
      const reference = db.collection("article").doc("detail-article");
      const setParams: any = {};
      setParams[articleId] = createInfo;
      asyncData = dataBase.put({
        reference: reference,
        setParams: setParams,
      });
    } else {
      asyncData = verify.promiseError();
    }

    return asyncData;
  }

  public async deleteArticle(req: any) {
    const validateMothed = await this.isArticleOwner(req);

    let asyncData: any;
    if (validateMothed) {
      const commentsList = await commentModel.getCommentForArticle({
        query: { articleId: req.query.articleId },
      });
      const reference = db.collection("article").doc("detail-article");
      dataBase.delete({
        reference: reference,
        setParams: req.query.articleId,
      });
      const referenceComments = db.collection("comments").doc("comment");
      commentsList.forEach((comment: any) => {
        dataBase.delete({
          reference: referenceComments,
          setParams: comment.commentId,
        });
      });
      asyncData = {
        message: "Delete success!",
        statusCode: 200,
      };
    } else {
      asyncData = verify.promiseError();
    }

    return asyncData;
  }

  public isArticleOwner(req: any) {
    if (!verify.getToken(req)?.userId) {
      return false;
    }

    const reference = db.collection("article").doc("detail-article");
    const formatResultFn = (result: any) => {
      const allArticleData = result.data();
      return allArticleData[req.query.articleId]
        ? allArticleData[req.query.articleId].userId
        : "";
    };

    let ownerId: string;
    return dataBase
      .get({ reference: reference }, formatResultFn)
      .then((userId: string) => {
        ownerId = userId;
        return ownerId === verify.getToken(req)?.userId;
      });
  }

  public isArticleNotFound(req: any) {
    const reference = db.collection("article").doc("detail-article");
    const formatResultFn = (result: any) => {
      const allArticleData = result.data();
      return allArticleData[req.query.articleId] ? true : false;
    };

    return dataBase
      .get({ reference: reference }, formatResultFn)
      .then((state: boolean) => {
        return state;
      });
  }

  public getArticeForUser(req: any) {
    let asyncData: any;
    if (!!verify.getToken(req)?.userId) {
      const reference = db.collection("article").doc("detail-article");
      const articleList: any[] = [];
      const formatResultFn = async (result: any) => {
        const allArticleData = result.data();
        const allArticleIds = Object.keys(allArticleData);

        for (let index = 0; index < allArticleIds.length; index++) {
          const id = allArticleIds[index];
          if (allArticleData[id]["userId"] === verify.getToken(req).userId) {
            delete allArticleData[id]["content"];
            articleList.push(allArticleData[id]);
            const comments = await commentModel.getCommentForArticle({
              query: { articleId: id },
            });

            articleList[index]["countsComment"] = comments.length;
          }
        }

        return articleList;
      };
      asyncData = dataBase.get({ reference: reference }, formatResultFn);
    } else {
      asyncData = verify.promiseError();
    }

    return asyncData;
  }

  public getAllNewsArticles(req: any) {
    const reference = db.collection("article").doc("detail-article");
    const articleList: any[] = [];
    const formatResultFn = async (result: any) => {
      const allArticleData = result.data();
      const allArticleIds = Object.keys(allArticleData);

      for (let index = 0; index < allArticleIds.length; index++) {
        const id = allArticleIds[index];
        articleList[index] = allArticleData[id];
        if (articleList[index].isHiddenName) {
          articleList[index].nickName = "匿名";
        }
        delete articleList[index]["content"];
        const comments = await commentModel.getCommentForArticle({
          query: { articleId: id },
        });

        articleList[index]["countsComment"] = comments.length;
      }
      return articleList;
    };
    const asyncData = dataBase.get({ reference: reference }, formatResultFn);

    return asyncData;
  }

  public async getDetailsArticle(req: any) {
    const isFound = await this.isArticleNotFound(req);
    const validateMothed = await this.isArticleOwner(req);
    let asyncData: any;
    if (isFound) {
      const reference = db.collection("article").doc("detail-article");
      const articleId = req.query.articleId;
      const formatResultFn = (result: any) => {
        const allArticleData = result.data();
        if (!validateMothed) {
          allArticleData[articleId].nickName = "匿名";
        }
        return allArticleData[articleId];
      };
      asyncData = dataBase.get({ reference: reference }, formatResultFn);
    } else {
      asyncData = verify.promiseError();
    }

    return asyncData;
  }
}

export const articleModel = new ArticleModel();
