import mongoose from "mongoose";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.SELLER_MONGO_URI)
        console.log("Seller-Dashboard mongoDB connected");
        
    } catch (error) {
        console.error("🚀 ~ connectDB ~ error:", error)
    }
}

export default connectDB