import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
          },
          content: {
            type: String,
            required: true,
           
          },
          caption : {
            type :String,
            required : true
          },
        
          likes: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User', // Users who liked the post
              default : 0
            },
          ],
          dislikes : [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User', // Users who liked the post,
              default : 0
            },
          ],
          comment : [
            {
                type : mongoose.Schema.ObjectId,
                ref : "Comment"
            }
          ]

    },{timestamps : true}
);

export const Post = mongoose.model("Post",postSchema)