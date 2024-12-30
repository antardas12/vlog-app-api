import { Router } from "express";
import { varifyJWT } from "../middelwerers/auth.middelwere.js";
import { creatComment } from "../contorllers/comment.controller.js";

const router = Router();

router.route("/comment/:postId").post(varifyJWT,creatComment);

export default router;