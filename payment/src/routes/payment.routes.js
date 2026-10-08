import express from 'express'
import createAuthMiddleware from '../middlewares/auth.middleware.js'
import paymentController from '../controllers/payment.controller.js'


const router = express.Router()

router.post('/create/:orderId', createAuthMiddleware(['user']), paymentController.createPayment)

router.post('/verify', createAuthMiddleware(['user']), paymentController.verifyPayment)







export default router