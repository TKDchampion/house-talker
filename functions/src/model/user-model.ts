import { db } from "../database/setting";
import { dataBase } from "../database/db-interface";
import { UserInfoInstance, UserInfo } from "../view-model/user-view-model";
import { ErrorContent } from "../view-model/error-viewmodel";
import { verify } from "./verify-model";
import { Key } from "../database/private-key";

const jwt = require("jsonwebtoken");

class UserModel {
  public getAllAccounts(req: any) {
    const reference = db.collection("users");
    const fights: any[] = [];
    const formatResultFn = (result: any) => {
      result.forEach((doc: any) => {
        fights.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      return fights;
    };
    const asyncData = dataBase.get({ reference: reference }, formatResultFn);

    return asyncData;
  }

  test(req: any) {
    const obj = req.body;
    const reference = db.collection("article").doc("test");
    const setParams: any = {};
    setParams[obj.article] = obj.data;
    const asyncData = dataBase.put({
      reference: reference,
      setParams: setParams,
    });
    return asyncData;
  }

  public createOrUpdateArticle(req: any, type: "C" | "U") {
    let asyncData: any;
    if (!!verify.getToken(req).userId) {
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
        type === "C" ? `article${this.generatorId()}` : req.query.articleId;
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
          errorStatus: 401,
        } as ErrorContent);
      });
    }

    return asyncData;
  }

  public login(req: any) {
    const account = req.body.account;
    const password = req.body.password;
    const user = new UserInfoInstance({ account, password });
    const dbRoute = "users";
    const reference = db.collection(dbRoute).doc("user");
    const asyncData = dataBase.get({ reference: reference }, this.verify(user));
    return asyncData;
  }

  public singin(req: any) {
    const account = req.body.account;
    const password = req.body.password;
    const reference = db.collection("users").doc("user");
    const userId = `user${this.generatorId()}`;
    const setParams: any = {};
    setParams[userId] = {
      account,
      password,
      userId,
    };
    const asyncData = dataBase.post({
      reference: reference,
      setParams: setParams,
    });
    return asyncData;
  }

  private generatorId() {
    return (
      Math.random().toString(36).substr(2, 7) +
      Date.now().toString(36).substr(4, 9)
    );
  }

  private verify(userinfo: UserInfo) {
    const formatResultFn = (result: any) => {
      const resultData = Object.values(result.data());
      const user: any = resultData.find(
        (data: any) =>
          data.account === userinfo.account &&
          data.password === userinfo.password
      );
      if (user) {
        console.log(Key.JWT);

        const payload = JSON.parse(JSON.stringify(new UserInfoInstance(user)));
        const token = jwt.sign(payload, Key.JWT);
        return {
          access_token: token,
          token_type: "Bearer",
          account: user.account,
          userId: user.userId,
        };
      }
      return { message: "user unauthorized", errorStatus: 401 } as ErrorContent;
    };
    return formatResultFn;
  }
}

export const userModel = new UserModel();
