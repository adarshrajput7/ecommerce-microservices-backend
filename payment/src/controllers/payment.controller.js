import axios from 'axios'
import paymentModel from '../models/payment.model.js';
import dotenv from 'dotenv'
import Razorpay from 'razorpay'
import { validatePaymentVerification } from '../../node_modules/razorpay/dist/utils/razorpay-utils.js';
import broker from '../broker/broker.js'

dotenv.config()

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// const createPayment = async (req, res) => {
//     const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
//     try {

//         const orderId = req.params.orderId

//         const orderResponse = await axios.get(`http://localhost:3003/api/order/${orderId}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         })

//         const price = orderResponse.data.order.totalPrice

//         const order = await razorpay.orders.create(price);

//         const payment = await paymentModel.create({
//             order: orderId,
//             razorpayOrderId: order.id,
//             user: req.user.id,
//             price: {
//                 amount: order.amount,
//                 currency: order.currency
//             }
//         })

//         await Promise.all([

//             broker.publishToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED", payment),

//             broker.publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", {
//                 email: req.user.email,
//                 orderId: orderId,
//                 amount: price.amount / 100,
//                 currency: price.currency,
//                 username: req.user.username,
//             })

//         ])


//         return res.status(200).json({
//             message: 'Payment initiated',
//             success: true,
//             payment
//         })

//     } catch (error) {
//         console.error("🚀 ~ createPayment ~ error:", error)
//         return res.status(500).json({
//             message: 'Internal Server error',
//             Error: error.message
//         })
//     }
// }

const createPayment = async (req, res) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    try {
        const orderId = req.params.orderId;

        // 1. Order Service se Order Data fetch
        const orderResponse = await axios.get(`http://localhost:3003/api/order/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const price = orderResponse.data.order.totalPrice;
        
        // [CHANGE 1]: Razorpay amount hamesha integer paise mein mangta hai (₹1 = 100 paise)
        const rawAmount = price?.amount || price; 
        const amountInPaise = Math.round(Number(rawAmount) * 100);
        const currency = price?.currency || "INR";

        // [CHANGE 2]: Proper payload object pass kiya
        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: currency,
            receipt: `rcpt_${orderId.slice(-10)}`
        });

        const payment = await paymentModel.create({
            order: orderId,
            razorpayOrderId: order.id,
            user: req.user.id,
            price: {
                amount: order.amount,
                currency: order.currency
            }
        });

        await Promise.all([
            broker.publishToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED", payment),

            // [CHANGE 3]: Email notification me original rupees amount bhej rahe hain (paise nahi)
            broker.publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", {
                email: req.user.email,
                orderId: orderId,
                amount: rawAmount,
                currency: currency,
                username: req.user.username,
            })
        ]);

        // [CHANGE 4]: 'order' aur 'razorpayKeyId' frontend checkout popup ke liye add kiya
        return res.status(200).json({
            message: 'Payment initiated',
            success: true,
            order,                                // Frontend options me order.id use karne ke liye
            razorpayKeyId: process.env.RAZORPAY_KEY_ID, // Frontend me popup open karne ke liye
            payment
        });

    } catch (error) {
        console.error("🚀 ~ createPayment ~ error:", error);
        return res.status(500).json({
            message: 'Internal Server error',
            Error: error.message
        });
    }
};



// const verifyPayment = async (req, res) => {
//     const { razorpayOrderId, paymentId, signature } = req.body;
//     const secret = process.env.RAZORPAY_KEY_SECRET
//     try {

//         const isValid = validatePaymentVerification({
//             order_id: razorpayOrderId,
//             payment_id: paymentId
//         }, signature, secret)

//         if (!isValid) {
//             return res.status(400).json({
//                 message: 'Invalid signature'
//             })
//         }

//         const payment = await paymentModel.findOne({
//             razorpayOrderId, status: 'PENDING'
//         })

//         if (!payment) {
//             return res.status(404).json({
//                 message: 'Payment not found'
//             })
//         }

//         payment.paymentId = paymentId;
//         payment.signature = signature;
//         payment.status = 'COMPLETED';

//         await payment.save()

//         await Promise.all([
//             broker.publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED",
//             {
//                 email: req.user.email,
//                 orderId: payment.order,
//                 paymentId: payment.paymentId,
//                 amount: payment.price.amount / 100,
//                 currency: payment.price.currency,
//                 fullName: req.user.fullName
//             }
//         ),

//             broker.publishToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATED", payment)
        

//         ])

//         return res.status(200).json({
//             message: 'Payment verified successfully',
//             payment
//         })

//     } catch (error) {
//         console.error("🚀 ~ verifyPayment ~ error:", error)
//         console.error("STATUS:", error.response?.status);
//         console.error("DATA:", error.response?.data);
//         console.error("MESSAGE:", error.message);
//         await publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED",
//             {
//                 email: req.user.email,
//                 paymentId: paymentId,
//                 orderId: razorpayOrderId,
//                 fullName: req.user.fullName
//             }
//         )
//         return res.status(500).json({
//             message: 'Internal Server error',
//             Error: error.message
//         })
//     }
// }


const verifyPayment = async (req, res) => {
    
    // Underscore aur camelCase dono check laga diye
    const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
    const paymentId = req.body.paymentId || req.body.razorpay_payment_id;
    const signature = req.body.signature || req.body.razorpay_signature;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    try {
        // Validation check
        const isValid = validatePaymentVerification(
            {
                order_id: razorpayOrderId,
                payment_id: paymentId
            }, 
            signature, 
            secret
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        // Database me pending payment find karo
        const payment = await paymentModel.findOne({
            razorpayOrderId, 
            status: 'PENDING'
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment record not found ya already complete hai'
            });
        }

        // Status update to COMPLETED
        payment.paymentId = paymentId;
        payment.signature = signature;
        payment.status = 'COMPLETED';

        await payment.save();

        // Queues publish
        await Promise.all([
            broker.publishToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", {
                email: req.user.email,
                orderId: payment.order,
                paymentId: payment.paymentId,
                amount: payment.price.amount / 100,
                currency: payment.price.currency,
                fullName: req.user.fullName
            }),
            broker.publishToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATED", payment)
        ]);

        return res.status(200).json({
            success: true,
            message: 'Payment verified and status updated to COMPLETED',
            payment
        });

    } catch (error) {
        console.error("verifyPayment error:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server error',
            error: error.message
        });
    }
};


//test for verifypaymet genrated by AI

// const verifyPayment = async (req, res) => {
//     const {
//         razorpayOrderId,
//         paymentId,
//         signature
//     } = req.body;

//     try {

//         const payment = await paymentModel.findOne({
//             razorpayOrderId,
//             status: 'PENDING'
//         });

//         if (!payment) {
//             return res.status(404).json({
//                 message: 'Payment not found'
//             });
//         }

//         payment.paymentId = paymentId;
//         payment.signature = signature;
//         payment.status = 'COMPLETED';

//         await payment.save();

//         return res.status(200).json({
//             message: 'Payment verified successfully',
//             payment
//         });

//     } catch (error) {
//         console.error(error);

//         return res.status(500).json({
//             message: 'Internal Server error',
//             error: error.message
//         });
//     }
// };


export default {
    createPayment,
    verifyPayment
}
