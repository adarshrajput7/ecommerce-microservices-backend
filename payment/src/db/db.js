import mongoose from "mongoose";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.PAYMENT_MONGO_URI)
        console.log("Payment MongoDB connected");
        
    } catch (error) {
        console.error("🚀 ~ connectDB ~ error:", error)
    }
}


export default connectDB