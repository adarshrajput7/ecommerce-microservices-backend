import express from 'express'
import createAuthMiddleware from '../middlewares/auth.middleware.js'
import controller from '../controller/seller.controller.js'


const router = express.Router()

router.get('/metrics',createAuthMiddleware(['seller']),controller.getMetrics)
router.get('/order', createAuthMiddleware(['seller']), controller.getOrders)
router.get("/products", createAuthMiddleware([ "seller" ], controller.getProducts))



export default router