import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        likes: {
            type: Number,
            default: 0,
        },
    }, { timestamps: true }
)
export const Comment = mongoose.model("Comment", commentSchema);