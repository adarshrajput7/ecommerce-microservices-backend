import { body, validationResult } from 'express-validator'
import mongoose from 'mongoose'

const validateResult = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors:errors.array() })
    }
    next()
}

const validateAddItemToCart = [
    body('productId').isString()
        .withMessage("product id must be a string")
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Invalid product id format'),
    body('qty').isInt({ gt: 0 })
        .withMessage("Quantity must be a positive integer"),
    validateResult
]


export default {
    validateAddItemToCart
}