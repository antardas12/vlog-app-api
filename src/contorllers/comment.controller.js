import { Comment } from "../models/comment.models.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asynHandler } from "../utilis/asynHandler.js";

const creatComment = asynHandler(async (req, res) => {
    const{ postId } = req.params;
    const { content } = req.body;
    
    const post = await Post.findById(postId);
    
    if (!post) {
        throw new ApiError(400, "post not found")
    }

    if (!content) {
        throw new ApiError(400, "comment content are required")
    }

    const comment = await Comment.create({
        userId: req.user._id,
        postId : postId,
        content,
    });

    const cratedComment = await Comment.findById(comment._id);
    if (!cratedComment) {
        throw new ApiError(500, "some error while create the comment ")
    }

    return res.status(200).json(
        new ApiResponse(200, "create comment successfully", cratedComment)
    )


});

export { creatComment }