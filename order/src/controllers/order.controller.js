import axios from 'axios'
import orderModel from '../models/order.model.js';
import broker from '../broker/broker.js'


const createOrder = async (req, res) => {

    const user = req.user;
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({
                message: "Authentication token missing"
            });
        }

        //cart service se all cart get kar rhe jo user ne cart me add kar rakha hai 
        const cartResponse = await axios.get(
            "http://localhost:3002/api/cart/",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        //product service se all cart me add product fetched kar rahe hai
        const products = await Promise.all(cartResponse.data.cart.items.map(async (item) => {
            return (await axios.get(`http://localhost:3001/api/product/${item.productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })).data.data
        }))

        let priceAmount = 0;

        //2 item get karne hai 1 productId 2 quantity
        const orderItems = cartResponse.data.cart.items.map((item, index) => {

            //products se price or currency find karni hai
            const product = products.find(p => p._id === item.productId)

            //agar out of stock hai
            if (product.stock < item.quantity) {
                throw new Error(`Product ${product.title} is out of stock or insufficient stock`)
            }

            //price me quantity ki multiply 
            const itemTotal = product.price.amount * item.quantity;
            priceAmount += itemTotal

            return {
                product: item.productId,

                title: product.title,
                images: product.images[0]?.url,
                size: item.size,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: product.price.currency
                }
            }

        })

        //create order in database
        const order = await orderModel.create({
            user: user.id,
            items: orderItems,
            status: "PENDING",
            totalPrice: {
                amount: priceAmount,
                currency: "INR"
            },
            shippingAddress: req.body.shippingAddress
        })

        await broker.publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", order)

        return res.status(201).json({
            message: "Order placed successfully!",
            order,
            success: true
        });

    } catch (error) {
        console.error("createOrder error:", error);

        return res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || error.message,
            message: 'Internal server error'
        });
    }
};

const updatePayment = async (req, res) => {
    try {
        const {orderId} = req.params;

        const order = await orderModel.findByIdAndUpdate(orderId,
            {
                "payment.isPaid": true,
                "payment.paidAt": new Date()
            },
            { returnDocument: 'after' }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payment marked as paid",
            order
        });

    } catch (error) {
        console.error("🚀 ~ updatePayment ~ error:", error)
    }
}

const getMyOrder = async (req, res) => {
    try {

        const user = req.user

        const orders = await orderModel.find({ user: user.id });

        res.status(200).json({
            orders,
            totalOrder: orders.length,
            success: true
        })


    } catch (error) {
        console.error("🚀 ~ getMyOrder ~ error:", error)

        return res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || error.message,
            message: 'Internal server error'
        });
    }
}

const getOrderById = async (req, res) => {
    try {

        const user = req.user
        const orderId = req.params.id

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            })
        }

        if (order.user.toString() !== user.id) {
            return res.status(404).json({
                message: "your dont have access"
            })
        }

        res.status(200).json({
            order
        })


    } catch (error) {
        console.error("🚀 ~ getOrderById ~ error:", error)

        return res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || error.message,
            message: 'Internal server error'
        });
    }
}

const cancelOrderById = async (req, res) => {
    try {
        const user = req.user
        const orderId = req.params.id

        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            })
        }

        if (order.user.toString() !== user.id) {
            return res.status(404).json({
                message: "your dont have access"
            })
        }

        //only PENDING orders can be cancelled
        if (order.status !== "PENDING") {
            return res.status(404).json({
                message: "Order can not be cancelled at this stage"
            })
        }

        order.status = "CANCELLED"
        await order.save()

        res.status(200).json({ message: "Order Cancelled", order })

    } catch (error) {
        console.error("🚀 ~ cancelOrderById ~ error:", error)

        return res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || error.message,
            message: 'Internal server error'
        });
    }
}

const updateOrderAddress = async (req, res) => {
    try {
        const user = req.user
        const orderId = req.params.id

        const order = await orderModel.findById(orderId)

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            })
        }

        if (order.user.toString() !== user.id) {
            return res.status(404).json({
                message: "your dont have access"
            })
        }

        //only PENDING orders can have address updated
        if (order.status !== "PENDING") {
            return res.status(409).json({ message: "Order address cannot be updated at this stage" });
        }

        order.shippingAddress = req.body.shippingAddress

        await order.save()

        res.status(200).json({ message: "Address updated", success: true, order })

    }
    catch (error) {
        console.error("🚀 ~ cancelOrderById ~ error:", error)

        return res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || error.message,
            message: 'Internal server error'
        });
    }
}

export default {
    createOrder,
    updatePayment,
    getMyOrder,
    getOrderById,
    cancelOrderById,
    updateOrderAddress
}