import { verify } from "./verify-model";
import { db } from "../database/setting";
import { dataBase } from "../database/db-interface";
import { UserInfoInstance, UserInfo } from "../view-model/user-view-model";
import { ErrorContent } from "../view-model/error-viewmodel";
import { Key } from "../database/private-key";
import { generator } from "./common-model/generator";

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

  public login(req: any) {
    const account = req.body.account;
    const password = req.body.password;
    const user = new UserInfoInstance({ account, password });
    const dbRoute = "users";
    const reference = db.collection(dbRoute).doc("user");
    const asyncData = dataBase.get({ reference: reference }, this.verify(user));
    return asyncData;
  }

  public async signUp(req: any) {
    const isRepeat = await this.isRepeatAccount(req);

    let asyncData: any;
    if (isRepeat) {
      asyncData = verify.promiseError("帳號已存在", 403);
    } else {
      const account = req.body.account;
      const password = req.body.password;
      const nickName = req.body.nickName;
      const reference = db.collection("users").doc("user");
      const userId = `user${generator.generatorId()}`;
      const setParams: any = {};
      setParams[userId] = {
        account,
        password,
        userId,
        nickName,
      };
      asyncData = dataBase.post({
        reference: reference,
        setParams: setParams,
      });
    }
    return asyncData;
  }

  private isRepeatAccount(req: any) {
    const reference = db.collection("users").doc("user");
    const formatResultFn = (result: any) => {
      const allUsers = result.data();
      const allUsersIds = Object.keys(allUsers);
      const allUserList: any[] = [];
      allUsersIds.forEach((id: string, index: number) => {
        allUserList[index] = allUsers[id];
      });

      return allUserList;
    };

    let isAccount: string;
    return dataBase
      .get({ reference: reference }, formatResultFn)
      .then((list: any[]) => {
        isAccount = list.find(
          (i) =>
            i.account === req.body.account || i.nickName === req.body.nickName
        );
        return isAccount;
      });
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
        const token = jwt.sign(payload, Key.JWT, {
          expiresIn: "1d",
        });
        return {
          access_token: token,
          token_type: "Bearer",
          account: user.account,
          nickName: user.nickName,
          userId: user.userId,
        };
      }
      return {
        message: "user unauthorized",
        statusCode: 403,
      } as ErrorContent;
    };
    return formatResultFn;
  }
}

export const userModel = new UserModel();
