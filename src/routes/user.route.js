import { Router } from "express";
import { upload } from "../middelwerers/multer.middelwere.js";
import { changeCurrentPassword, changeproFilePicture, followUser, logInUser, logOutUser, registerUser, unFollowUser, updateBio } from "../contorllers/user.controller.js";
import { varifyJWT } from "../middelwerers/auth.middelwere.js";


const router = Router();

router.route("/register").post(upload.single('profilePicture'),registerUser);
router.route("/login").post(logInUser);
router.route("/logout").post(varifyJWT,logOutUser);
router.route("/change-password").patch(varifyJWT,changeCurrentPassword);
router.route("/change-profile").patch(varifyJWT,upload.single('profilePicture'),changeproFilePicture);
router.route("/update-bio").patch(varifyJWT,updateBio);
router.route("/follow/:username").patch(varifyJWT,followUser);
router.route("/un-follow/:username").patch(varifyJWT,unFollowUser);


export default router;