import mongoose from 'mongoose'


const paymentSchema = new mongoose.Schema({
    //order id from mongo 
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    paymentId: {
        type: String
    },
    //ye id razorpay genrate karega
    razorpayOrderId: {
        type: String,
        required:true
    },
    signature: {
        type:String
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default:'PENDING'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    price: {
        amount: {
            type: Number,
            required:true
        },
        currency: {
            type: String,
            required: true,
            enum: ['INR', 'USD'],
            default:'INR'
        }
    }
},{timestamps:true})

const paymentModel = mongoose.model('payment', paymentSchema)

export default paymentModel