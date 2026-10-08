import mongoose from "mongoose";


const addressSchema = new mongoose.Schema(
    {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: String,
        phone:String,
    }
)


const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            price: {
                amount: {
                    type: Number,
                    required: true
                },
                currency: {
                    type: String,
                    required: true,
                    enum: ['USD', 'INR']
                }
            }
        }
    ],
    status: {
        type: String,
        enum: ['PENDING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'SHIPPED']
    },
    totalPrice: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true,
            enum: ['USD', 'INR']
        }
    },
    shippingAddress: {
        type: addressSchema,
        required:true
    },

    // ✅ payment update
    payment: {
        isPaid: {
            type: Boolean,
            default: false
        },
        paidAt: {
            type: Date,
            default: null
        }
    }
}, { timestamps: true })

const orderModel = mongoose.model('order',orderSchema)

export default orderModel