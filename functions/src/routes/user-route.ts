import Route from "../router/route";
import { userController } from "../controllers/user-controller";

export class UserRoute extends Route {
  constructor() {
    super();
    this.prefix = "";
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.post("/login", userController.login);
    this.router.post("/signUp", userController.signUp);
    // this.router.get("/test", userController.test);
    this.router.put("/test", userController.test);
  }
}
