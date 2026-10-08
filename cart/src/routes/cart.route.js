import express from 'express'
import createAuthMiddleware from '../middlewares/auth.middleware.js'
import cartController from '../controllers/cart.controller.js'
import validation from '../middlewares/validation.middleware.js'



const routes = express.Router()

//get cart
routes.get('/',createAuthMiddleware(['user']),cartController.getCart)


//add product in cart
routes.post('/items', validation.validateAddItemToCart, createAuthMiddleware(['user']), cartController.addItemToCart)

routes.patch('/items/:productId', createAuthMiddleware(['user']), cartController.updateItemQuantity)
routes.delete('/delete/:productId', createAuthMiddleware(['user']), cartController.deleteOneCart)
routes.delete('/', createAuthMiddleware(['user']), cartController.clearCart)






export default routes