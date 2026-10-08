import mongoose from "mongoose";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.ORDER_MONGO_URI)
        console.log('Order MongoDB connected');
    } catch (error) {
        console.error("🚀 ~ connectDB ~ error:", error)
    }
}

export default connectDB