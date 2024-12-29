import { Post } from "../models/post.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asynHandler } from "../utilis/asynHandler.js";
import { uploadOncloudinary } from "../utilis/cloudinary.js";

const createPost = asynHandler(async (req, res) => {
    const { caption } = req.body;
    if (!caption) {
        throw new ApiError(400, "caption are required")
    }
    const postImagelocalPath = req.file?.path;
    if (!postImagelocalPath) {
        throw new ApiError(400, "postimage or video are required")
    }

    const postImageorVideo = await uploadOncloudinary(postImagelocalPath);

    if (!postImageorVideo) {
        throw new ApiError(500, "error in upload post image or video on cloudinary")
    }

    const post = await Post.create({
        user: req.user._id,
        caption,
        content: postImageorVideo.url
    });

    const createdPost = await Post.findById(post._id);
    if (!createdPost) {
        throw new ApiError(500, "some error when create post")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, "post create successfully", createdPost)
        )



});

const getAllPost = asynHandler(async (req, res) => {
    const post = await Post.find();
    if (!post) {
        throw new ApiError(400, "not post found")
    }

    return res.status(200).json(
        new ApiResponse(200, "all post get successfully", post)
    )
});

const delatePost = asynHandler(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
        throw new ApiError(400, "post not found")
    }
    await Post.findByIdAndUpdate(post._id);

    return res.status(200).json(
        new ApiResponse(200, "post delate successfully")
    )
});

const likePost = asynHandler(async (req, res) => {
    const { postId } = req.params;
    
    const userId = req.user._id;

    const post = await Post.findById(postId);
    
    if (!post) {
        throw new ApiError(400, "post not found ")
    }

    if (post.likes.includes(userId)) {
        throw new ApiError(400, "post all ready liked")
    }

    if (post.dislikes.includes(userId)) {
        post.dislikes.pull(userId);
    }

    post.likes.push(userId);
    await post.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, "post liked successfully ")
    )
});
const dislikePost = asynHandler(async (req, res) => {
    const { postId } = req.params;
    
    const userId = req.user._id;

    const post = await Post.findById(postId);
    
    if (!post) {
        throw new ApiError(400, "post not found ")
    }

    if (post.dislikes.includes(userId)) {
        throw new ApiError(400, "post all ready disliked")
    }

    if (post.likes.includes(userId)) {
        post.likes.pull(userId);
    }

    post.dislikes.push(userId);
    await post.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, "post dis like successfully ")
    )
});

export {
    createPost,
    getAllPost,
    delatePost,
    likePost,
    dislikePost
}