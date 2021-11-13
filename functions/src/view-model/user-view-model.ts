export interface UserInfo {
  account: string;
  password: string;
  userId: string;
}

export class UserInfoInstance implements UserInfo {
  account: string = "";
  password: string = "";
  userId: string = "";
  constructor(user: any) {
    this.account = user.account;
    this.password = user.password;
    this.userId = user.userId;
  }
}
