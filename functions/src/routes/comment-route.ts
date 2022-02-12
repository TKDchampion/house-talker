import { commentController } from "./../controllers/comment-controller";
import Route from "../router/route";

export class CommentRoute extends Route {
  constructor() {
    super();
    this.prefix = "";
    this.setRoutes();
  }

  protected setRoutes() {
    this.router.post("/createComment", commentController.createComment);
    this.router.put("/updateComment", commentController.updateComment);
    this.router.delete("/deleteComment", commentController.deleteComment);
    this.router.get("/listComment", commentController.getCommentForUser);
  }
}
