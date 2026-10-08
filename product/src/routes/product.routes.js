// import express from 'express'
// import createAuthMiddleware from '../middlewares/auth.middleware.js'
// import multer from 'multer'
// import createProductValidators from '../validators/product.validators.js'
// import productController from '../controllers/product.controller.js'



// const router = express.Router()
// const upload = multer({storage: multer.memoryStorage()})

// //create product 
// router.post('/',createAuthMiddleware(['admin','seller']),upload.array('images',5),createProductValidators.createProductValidators,productController.createProduct)

// //get product
// router.get('/',productController.getProducts)


// router.patch('/:id', createAuthMiddleware(["seller"]), productController.updateProduct)

// router.delete('/:id', createAuthMiddleware(["seller"]), productController.deleteProduct)

// router.get('/seller',createAuthMiddleware(['seller']),productController.getProductBySeller)


// router.get('/:id', productController.getProductById)

// export default router



import express from 'express'
import createAuthMiddleware from '../middlewares/auth.middleware.js'
import multer from 'multer'
import createProductValidators from '../validators/product.validators.js'
import productController from '../controllers/product.controller.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// 1. Specific string routes pehle hone chahiye
router.get('/seller', createAuthMiddleware(['seller']), productController.getProductBySeller)

// 2. Main collection route (query params yahan handle honge)
router.get('/', productController.getProducts)

// 3. Create
router.post('/', createAuthMiddleware(['admin', 'seller']), upload.array('images', 5), createProductValidators.createProductValidators, productController.createProduct)

// 4. Update / Delete
router.patch('/:id', createAuthMiddleware(['seller']), productController.updateProduct)
router.delete('/:id', createAuthMiddleware(['seller']), productController.deleteProduct)

// 5. Param route ko strict regex do taaki wo query ya invalid id ko ObjectId samajh ke crash na kare
router.get('/:id([0-9a-fA-F]{24})', productController.getProductById)

export default router