import { articleController } from "../controllers/article-controller";
import Route from "../router/route";

export class ArticleRoute extends Route {
  constructor() {
    super();
    this.prefix = "";
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.post("/createArticle", articleController.createArticle);
    this.router.put("/updateArticle", articleController.updateArticle);
    this.router.get(
      "/getAllNewsArticles",
      articleController.getAllNewsArticles
    );
  }
}
