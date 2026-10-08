import mongoose from "mongoose"


const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    price: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            enum: ['USD', 'INR'],
            default: 'INR'
        }
    }, seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    images: [{
        url: String,
        thumbnail: String,
        id: String
    }],
    stock: {
        type: Number,
        default:0
    },
    category: {
        type: String,
        enum: ["FOOTWEAR", "CLOTHING", "MOBILES", "ACTIVE_LIFESTYLE"],
        required: true
    },

    gender: {
        type: String,
        enum: ["MEN", "WOMEN", "UNISEX", "KIDS"]
    }
}, { timestamps: true })

const productModel = mongoose.model('product', productSchema)

export default productModel