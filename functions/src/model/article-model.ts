import { db } from "../database/setting";
import { dataBase } from "../database/db-interface";
import { ErrorContent } from "../view-model/error-viewmodel";
import { verify } from "./verify-model";
import { generator } from "./common-model/generator";

class ArticleModel {
  public createOrUpdateArticle(req: any, type: "C" | "U") {
    let asyncData: any;
    if (!!verify.getToken(req)?.userId) {
      const createInfo = {
        content: req.body.content,
        location: req.body.location,
        nickName: req.body.nickName,
        summaryContnet: req.body.summaryContnet,
        tips: req.body.tips,
        title: req.body.title,
        time: Date.now(),
        userId: verify.getToken(req).userId,
      };
      const reference = db.collection("article").doc("detail-article");
      const articleId =
        type === "C"
          ? `article${generator.generatorId()}`
          : req.query.articleId;
      const setParams: any = {};
      setParams[articleId] = createInfo;
      asyncData = dataBase.put({
        reference: reference,
        setParams: setParams,
      });
    } else {
      asyncData = new Promise((resolve) => {
        resolve({
          message: "user unauthorized",
          statusCode: 401,
        } as ErrorContent);
      });
    }

    return asyncData;
  }
}

export const articleModel = new ArticleModel();
