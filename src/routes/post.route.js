import { Router } from "express";
import { varifyJWT } from "../middelwerers/auth.middelwere.js";
import { upload } from "../middelwerers/multer.middelwere.js";
import { createPost, delatePost, dislikePost, getAllPost, likePost } from "../contorllers/post.contoller.js";


const router =Router();

router.route("/create").post(varifyJWT,upload.single('content'),createPost);
router.route("/all-post").get(varifyJWT,getAllPost);
router.route("/delate-post/:id").delete(varifyJWT,delatePost);
router.route("/like-post/:postId").patch(varifyJWT,likePost);
router.route("/dis-like-post/:postId").patch(varifyJWT,dislikePost);

export default router