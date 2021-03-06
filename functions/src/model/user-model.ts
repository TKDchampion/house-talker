import { verify } from "./verify-model";
import { db } from "../database/setting";
import { dataBase } from "../database/db-interface";
import { UserInfoInstance, UserInfo } from "../view-model/user-view-model";
import { ErrorContent } from "../view-model/error-viewmodel";
import { Key, SMTPconfig } from "../database/private-key";
import { generator } from "./common-model/generator";
import * as nodemailer from "nodemailer";

const jwt = require("jsonwebtoken");

class UserModel {
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
    const user = { account, password };
    const dbRoute = "users";
    const reference = db.collection(dbRoute).doc("user");
    const asyncData = dataBase.get({ reference: reference }, this.verify(user));
    return asyncData;
  }

  public async activate(req: any) {
    const userInfo = await this.getUsers(req);
    let asyncData: any;
    if (userInfo) {
      userInfo.info.activate = true;
      const reference = db.collection("users").doc("user");
      const setParams: any = {};
      setParams[userInfo.id] = userInfo.info;
      asyncData = dataBase.put({
        reference: reference,
        setParams: setParams,
      });
    } else {
      asyncData = verify.promiseError("驗證失效", 403);
    }

    return asyncData;
  }

  private getUsers(req: any) {
    const token = req.query.token;
    const verifyToken = verify.getTokenAlready(token);
    const reference = db.collection("users").doc("user");
    const formatResultFn = (result: any) => {
      const data = result.data();
      let userInfo;
      for (const key in data) {
        if (
          key === verifyToken.userId &&
          data[key].account === verifyToken.account
        ) {
          userInfo = {
            id: key,
            info: data[key],
          };
          break;
        }
      }
      return userInfo;
    };

    return !!verifyToken
      ? dataBase
          .get({ reference: reference }, formatResultFn)
          .then((item: any) => item)
      : "";
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
      const formatResultFn = async () => {
        return await this.sendEmail({ account, nickName, userId });
      };

      setParams[userId] = {
        account,
        password,
        userId,
        nickName,
        activate: false,
      };
      asyncData = dataBase.post(
        {
          reference: reference,
          setParams: setParams,
        },
        true,
        formatResultFn
      );
    }
    return asyncData;
  }

  private sendEmail(userInfo: UserInfo) {
    const link = `https://house-talker.com/app/activate?token=${this.createToken(
      userInfo
    )} `;
    const text = `請點選連結啟用: <a href=${link}> ${link}</a><br/><br/><br/><br/><br/><div>如有任何問題歡迎來信詢問: housetalkertw@gmail.com</div>`;

    const transporter = nodemailer.createTransport({
      host: SMTPconfig.host,
      port: SMTPconfig.port,
      secure: SMTPconfig.secure,
      auth: {
        user: SMTPconfig.auth.user,
        pass: SMTPconfig.auth.pass,
      },
    });
    const mailOptions = {
      from: SMTPconfig.auth.user,
      to: userInfo.account,
      subject: "House Talker 啟用信",
      html: text,
    };

    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          resolve(verify.promiseError("寄信有誤", 401));
        }
        resolve({
          message: "success",
          statusCode: "200",
        });
      });
    });
  }

  createToken(userInfo: UserInfo) {
    const payload = JSON.parse(JSON.stringify(new UserInfoInstance(userInfo)));
    const token = jwt.sign(payload, Key.JWT, {
      expiresIn: "10m",
    });
    return token;
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

      if (user && user.activate === true) {
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
