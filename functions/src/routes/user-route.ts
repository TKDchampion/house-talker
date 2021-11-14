import Route from "../router/route";
import { userController } from "../controllers/user-controller";

export class UserRoute extends Route {
  constructor() {
    super();
    this.prefix = "";
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.get("/getAllAccounts", userController.getAllAccounts);
    this.router.post("/login", userController.login);
    this.router.post("/singin", userController.singin);
    this.router.post("/createArticle", userController.createArticle);
    this.router.put("/updateArticle", userController.updateArticle);
    // this.router.get("/test", userController.test);
    this.router.put("/test", userController.test);
  }
}
