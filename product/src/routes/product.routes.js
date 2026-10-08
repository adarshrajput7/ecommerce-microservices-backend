import express from 'express'
import createAuthMiddleware from '../middlewares/auth.middleware.js'
import multer from 'multer'
import createProductValidators from '../validators/product.validators.js'
import productController from '../controllers/product.controller.js'



const router = express.Router()
const upload = multer({storage: multer.memoryStorage()})



//create product 
router.post('/',createAuthMiddleware(['admin','seller']),upload.array('images',5),createProductValidators.createProductValidators,productController.createProduct)

//get product
router.get('/',productController.getProducts)


router.patch('/:id', createAuthMiddleware(["seller"]), productController.updateProduct)

router.delete('/:id', createAuthMiddleware(["seller"]), productController.deleteProduct)

router.get('/seller',createAuthMiddleware(['seller']),productController.getProductBySeller)


router.get('/:id', productController.getProductById)

export default router