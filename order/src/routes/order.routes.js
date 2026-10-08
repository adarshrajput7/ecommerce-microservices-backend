import express from 'express'
import createAuthMiddleware from '../middlewares/auth.middleware.js'
import orderController from '../controllers/order.controller.js'
import validation from '../middlewares/validation.middleware.js'


const router = express.Router()


router.post('/', createAuthMiddleware(['user']), validation.createOrderValidation, orderController.createOrder)

// for payment update
router.patch('/pay/:orderId',createAuthMiddleware(['user']),orderController.updatePayment)

router.get("/me", createAuthMiddleware(['user']), orderController.getMyOrder)

router.post("/:id/cancel", createAuthMiddleware(['user']), orderController.cancelOrderById)

router.patch("/:id/address", createAuthMiddleware(['user']),validation.updateAddressValidation, orderController.updateOrderAddress)

router.get("/:id",createAuthMiddleware(['user']),orderController.getOrderById)



export default router