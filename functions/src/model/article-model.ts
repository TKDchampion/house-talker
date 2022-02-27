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
        summaryContnet: req.body.summaryContnet,
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
      const reference = db.collection("article").doc("detail-article");
      asyncData = dataBase.delete({
        reference: reference,
        setParams: req.query.articleId,
      });
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
      return allArticleData[req.query.articleId]?.userId;
    };

    let ownerId: string;
    return dataBase
      .get({ reference: reference }, formatResultFn)
      .then((userId: string) => {
        ownerId = userId;
        return ownerId === verify.getToken(req)?.userId;
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

  public getDetailsArticle(req: any) {
    const reference = db.collection("article").doc("detail-article");
    const articleId = req.query.articleId;
    const formatResultFn = (result: any) => {
      const allArticleData = result.data();

      return allArticleData[articleId];
    };
    const asyncData = dataBase.get({ reference: reference }, formatResultFn);

    return asyncData;
  }
}

export const articleModel = new ArticleModel();
