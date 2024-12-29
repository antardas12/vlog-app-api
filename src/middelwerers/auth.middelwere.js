import { User } from "../models/user.model.js";
import { ApiError } from "../utilis/apiError.js";
import { asynHandler } from "../utilis/asynHandler.js";
import jwt from "jsonwebtoken"
export const varifyJWT =asynHandler(async (req,_,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("bearer ", "");
        if(!token){
            throw new ApiError( 400, "unauthorize request ")
        }
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken._id);
        if(!user){
            throw new ApiError(400, "invalid access token")
        }
        
        req.user=user;
        next();





    } catch (error) {
        throw new ApiError(400, error.message || "invalid accessToken")
    }
});