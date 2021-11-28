import Route from "./route";
import { UserRoute } from "../routes/user-route";
import { ArticleRoute } from "../routes/article-route";
import { CommentRoute } from "../routes/comment-route";

export const router: Array<Route> = [
  new UserRoute(),
  new ArticleRoute(),
  new CommentRoute(),
];
