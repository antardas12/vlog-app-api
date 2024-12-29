import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const delateOnCloudinary = async (publicId) => {
    try {

        const result = await cloudinary.uploader.destroy(publicId);

        return result;


    } catch (error) {
        console.log("some error in when file delate from cloudinary", error)
    }
}

export { delateOnCloudinary }