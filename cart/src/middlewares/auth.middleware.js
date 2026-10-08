import jwt from 'jsonwebtoken'

const createAuthMiddleware = (roles = ['user']) => {
    return function authMiddleware(req, res, next){
        try {
            const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    message: "Unauthorized: No token provided"
                })
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (!roles.includes(decoded.role)) {
                return res.status(403).json({
                    message: "Forbidden: Insufficient permissions"
                })
            }

            req.user = decoded
            next()
        } catch (error) {
            console.error("🚀 ~ createAuthMiddleware ~ error:", error)
        }
    }
}

export default createAuthMiddleware