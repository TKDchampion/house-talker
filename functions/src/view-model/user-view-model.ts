export interface UserInfo {
  account: string;
  password: string;
  userId: string;
  nickName: string;
}

export class UserInfoInstance implements UserInfo {
  account: string = "";
  password: string = "";
  userId: string = "";
  nickName: string = "";

  constructor(user: any) {
    this.account = user.account;
    this.password = user.password;
    this.userId = user.userId;
    this.nickName = user.nickName;
  }
}
