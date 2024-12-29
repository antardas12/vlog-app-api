import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connect_DB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MONGODB CONNECTED !! DB HOST !! ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("mongodb connection error ",error)
    }
}
export default connect_DB;