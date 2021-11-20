import Route from "./route";
import { UserRoute } from "../routes/user-route";
import { ArticleRoute } from "../routes/article-route";

export const router: Array<Route> = [new UserRoute(), new ArticleRoute()];
