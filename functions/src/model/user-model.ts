import { db } from "../detabase/setting";
import { dataBase } from "../detabase/db-interface";
import { UserInfoInstance, UserInfo } from "../view-model/user-view-model";
import { ErrorContent } from "../view-model/error-viewmodel";
import { verify } from "./verify-model";

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

  public getUserCounts(req: any) {
    const userId = req.query.userId;
    const reference = db.collection("users").doc("user");
    const formatResultFn = (result: any) => {
      const list = Object.values(result.data());
      const item: any = list.find((i: any) => i.userId === userId);
      delete item.password;
      delete item.read;
      return item;
    };
    const asyncData = dataBase.get(
      { reference: reference },
      verify.verifyUser(req, verify.verifyUser(req, formatResultFn))
    );
    return asyncData;
  }

  test(req: any) {
    const reference = db.collection("users").doc("user");
    const formatResultFn = (result: any) => {
      const list = Object.values(result.data());
      return list;
    };
    const asyncData = dataBase.get({ reference: reference }, formatResultFn);
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
    const userId = this.generatorId();
    const setParams: any = {};
    setParams[`user${userId}`] = {
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
        const payload = JSON.parse(JSON.stringify(new UserInfoInstance(user)));
        const token = jwt.sign(payload, "shhhhh");
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
