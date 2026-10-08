import mongoose from 'mongoose'


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.AUTH_MONGO_URI)
        console.log("Auth MongoDB Connected")
    } catch (error) {
        console.error("🚀 ~ connectDB ~ error:", error)
    }
}

export default connectDB