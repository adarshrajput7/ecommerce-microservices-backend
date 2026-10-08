import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken'


const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({
            message: "unauthorized",
            success:false
        })
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        const user = decoded

        req.user = user

        next()
    } catch (error) {
        console.error("🚀 ~ authMiddleware ~ error:", error)
        return res.status(401).json({
            message: error.message,
            success:false
        })
    }
}

export default {
    authMiddleware
}