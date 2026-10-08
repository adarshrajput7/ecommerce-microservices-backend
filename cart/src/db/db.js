import mongoose from "mongoose";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.CART_MONGO_URI)
        console.log("Cart MongoDB Connected");
        
    } catch (error) {
        console.error("🚀 ~ connectDB ~ error:", error)
    }
}


export default connectDB