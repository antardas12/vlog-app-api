import { User } from "../models/user.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asynHandler } from "../utilis/asynHandler.js";
import { uploadOncloudinary } from "../utilis/cloudinary.js";
import { delateOnCloudinary } from "../utilis/deleteCloudinary.js";

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken =user.generateRefreshToken();
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave : false});

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(400, "some thing want wrong while generate access and refreshToken")
    }
}


const registerUser = asynHandler(async (req,res)=>{
    const {fullname,password,username,email,bio} =req.body;

    if(
        [fullname,email,username,password,bio].some((filed)=>filed?.trim()==="")
    ){
        throw new ApiError(400, "all filed are required")
    }

    const exsistUser = await User.findOne({
        $or : [{username},{email}]
    });

    if(exsistUser){
        throw new ApiError(400, "username and email all ready register")
    }

    const profileLocalPath = req.file.path;
    if(!profileLocalPath){
        throw new ApiError(400, "profile picture are required")
    }

    const profilePicture = await uploadOncloudinary(profileLocalPath);

    if(!profilePicture){
        throw new ApiError(400, "error upload profile picture on cloudinary")
    }

    const user = await User.create({
        fullname,
        username,
        email,
        profilePicture : profilePicture.url,
        bio,
        password

    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500, "some error while creating user")
    }

    return res.status(200).json(
        new ApiResponse(200, "user register successfully",createdUser)
    )


});


const logInUser = asynHandler(async (req,res)=>{
    const {email,username,password} =req.body;

    if(!(email || username)){
        throw new ApiError(400, "username or email is required")
    }



    const user = await User.findOne({
        $or : [{email}, {username}]
    });

    if(!user){
        throw new ApiError(400, "user are not register ")
    }

    const validPasword = await user.isPasswordCorrect(password);
    if(!validPasword){
        throw new ApiError(400, "password is invalid")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    
    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,
            "user login successfully",
            {
                user : loggedInUser,accessToken,refreshToken
            }
        )
    )






});


const logOutUser = asynHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $unset : {
            refreshToken : 1
        }
    },{
        new : true
    });


    const options ={
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200, "user logout successfully ", {})
    )
});

const changeCurrentPassword = asynHandler(async (req,res)=>{
    const {oldPassword , newPassword} = req.body;
    const user = await User.findById(req.user._id);
    
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const validPasword =await user.isPasswordCorrect(oldPassword);
    if(!validPasword){
        throw new ApiError(400, "invalid old password ")
    }

    user.password=newPassword;
   await user.save({validateBeforeSave : false});

    return res.status(200).json(
        new ApiResponse(200, "current password change successfully ")
    )




});


const changeproFilePicture = asynHandler(async (req,res)=>{
    
    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError(400,"user not found ")
    }

    const oldProfileUrl =user.profilePicture;
    const oldproFilePubliCID =  oldProfileUrl ? oldProfileUrl.split('/').pop().split('.')[0] : null;
    

    const newProFileLocalPath =req.file.path;
    if(!newProFileLocalPath){
        throw new ApiError(400, "new profile are required")
    }
    const newProfilePicture = await uploadOncloudinary(newProFileLocalPath);
    if(!newProFileLocalPath){
        throw new ApiError(400, "error upload file in cloudinary")
    }

    await User.findByIdAndUpdate(user._id
        ,{
            $set : {
                profilePicture : newProfilePicture.url
            }
        }
    )

    if(oldproFilePubliCID){
      const result =  await delateOnCloudinary(oldproFilePubliCID);
      
    }

    return res.status(200).json(
        new ApiResponse(200,"profile picture change successfully")
    )


});


const updateBio = asynHandler(async (req,res)=>{
    const {bio} =req.body;
    if(!bio){
        throw new ApiError(400, "bio are required")
    }

    await User.findByIdAndUpdate(
        req.user._id,{
            $set : {
                bio : bio
            }
        },{
            new : true
        }
    );

    return res.status(200).json(
        new ApiResponse(200, "update bio successfully")
    )
});

const followUser = asynHandler(async (req,res)=>{
    const userOne = req.user._id;
    const userTwo =req.params.username;
    const userTwoData = await User.findOne({username : userTwo});
    if(!userTwoData){
        throw new ApiError(400, "user not found")
    }

    if(!userTwoData.followers.includes(userOne)){
       await User.findByIdAndUpdate(userTwoData._id,{
        $push : {
            followers : userOne
        }
       });

       await User.findByIdAndUpdate(userOne,{
        $push : {
            following : userTwoData._id
        }
       })
    }else{
        throw new ApiError(400, "you already followed this user")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, "Follow successful")
    )
});

const unFollowUser = asynHandler(async (req,res)=>{
    const userOne = req.user._id;
    const userTwo =req.params.username;
    const userTwoData = await User.findOne({username : userTwo});
    if(!userTwoData){
        throw new ApiError(400, "user not found")
    }

    if(userTwoData.followers.includes(userOne)){
       await User.findByIdAndUpdate(userTwoData._id,{
        $pull : {
            followers : userOne
        }
       });

       await User.findByIdAndUpdate(userOne,{
        $pull : {
            following : userTwoData._id
        }
       })
    }else{
        throw new ApiError(400, "you already unfollowed this user")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, "unfollow successful")
    )
});



 
export {
    registerUser,
    logInUser,
    logOutUser,
    changeCurrentPassword,
    changeproFilePicture,
    updateBio,
    followUser,
    unFollowUser
}