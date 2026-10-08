import cartModel from "../models/cart.model.js"


// const addItemToCart = async (req, res) => {
//     try {
//         const { productId, qty } = req.body

//         const user = req.user

//         console.log("USER:", user);
//         console.log("USER ID:", user?.id);

//         let cart = await cartModel.findOne({ user: user.id })

//         if (!cart) {
//             cart = new cartModel({ user: user.id, items: [] })
//         }

//         const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId)

//         if (existingItemIndex >= 0) {
//             cart.items[existingItemIndex].quantity += qty
//         } else {
//             cart.items.push({ productId, quantity: qty })
//         }

//         await cart.save()

//         res.status(200).json({
//             message: "Item added to cart",
//             cart,
//             success: true
//         })

//     } catch (error) {
//         console.error("🚀 ~ addItemToCart ~ error:", error)
//     }
// }

const addItemToCart = async (req, res) => {
    try {
        const { productId, qty, size } = req.body
        const userId = req.user?.id

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        if (!productId || !qty || qty <= 0 || !size) {
            return res.status(400).json({
                success: false,
                message: "productId, qty and size are required"
            })
        }

         // Ek baar me bhi 5 se zyada allow nahi
        if (Number(qty) > 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum quantity is 5"
            })
        }

        let cart = await cartModel.findOne({ user: userId })

        if (!cart) {
            cart = new cartModel({
                user: userId,
                items: []
            })
        }

        // Product + Size dono check honge
        const existingItemIndex = cart.items.findIndex(
            item =>
                item.productId.toString() === productId.toString() &&
                item.size === size
        )

        if (existingItemIndex !== -1) {
            cart.items[existingItemIndex].quantity += Number(qty)
        } else {
            cart.items.push({
                productId,
                quantity: Number(qty),
                size
            })
        }

        await cart.save()

        return res.status(200).json({
            success: true,
            message: "Item added to cart",
            cart
        })

    } catch (error) {
        console.error("addItemToCart error:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to add item to cart",
            error: error.message
        })
    }
}


const updateItemQuantity = async (req, res) => {
    try {
        const { productId } = req.params
        const { qty } = req.body
        const user = req.user
        const cart = await cartModel.findOne({ user: user.id })

        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found',
                success: false
            })
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId)

        if (existingItemIndex < 0) {
            return res.status(404).json({ message: 'Item not found', success: false })
        }

        cart.items[existingItemIndex].quantity = qty
        await cart.save()
        res.status(200).json({
            message: 'Item updated',
            cart,
            success: true
        })

    } catch (error) {
        console.error("🚀 ~ updateItemQuantity ~ error:", error)
    }
}

const getCart = async (req, res) => {
    try {
        const user = req.user;

        let cart = await cartModel.findOne({
            user: user.id
        })

        if (!cart) {
            cart = new cartModel({ user: user.id, items: [] })
            await cart.save();
        }

        res.status(200).json({
            cart,
            totals: {
                itemCount: cart.items.length,
                totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity,0)
            },
            success: true
        })
    } catch (error) {
        console.error("🚀 ~ getCart ~ error:", error)
    }
}

const deleteOneCart = async (req, res) => {
    try {
        const user = req.user
        const { productId } = req.params
        const cart = await cartModel.findOne({ user: user.id })
        if (!cart) {
            return res.status(404).json({
                message: 'Cart not found',
                success: false
            })
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId)
        if (existingItemIndex < 0) {
            return res.status(404).json({
                message: 'Item not found in the cart',
                success: false
            })
        }

        cart.items.splice(existingItemIndex, 1)
        await cart.save()

        return res.status(200).json({
            message: "Item removed from cart",
            cart,
            success: true
        });

    } catch (error) {
        console.error("🚀 ~ deleteOneCart ~ error:", error)
    }
}

const clearCart = async (req, res) => {
    try {
        const user = req.user;

        const cart = await cartModel.findOne({
            user: user.id
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false
            });
        }

        // Saare cart items remove
        cart.items = [];

        await cart.save();

        return res.status(200).json({
            message: "Cart cleared successfully",
            cart,
            success: true
        });

    } catch (error) {
        console.error("🚀 ~ clearCart ~ error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};



export default {
    addItemToCart,
    updateItemQuantity,
    getCart,
    deleteOneCart,
    clearCart
}