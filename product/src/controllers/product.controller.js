import productModel from "../models/product.model.js";
import { uploadImage } from "../services/imagekit.service.js";
import mongoose from 'mongoose';
import broker from "../broker/broker.js";


const createProduct = async (req, res) => {
    try {
        const {
            title,
            description,
            priceAmount,
            priceCurrency = 'INR',
            stock,
            category,
            gender
        } = req.body;

        if (!title || priceAmount === undefined || priceAmount === null) {
            return res.status(400).json({
                message: 'Title, Price are required',
                success: false
            });
        }

        const seller = req.user.id;

        const price = {
            amount: Number(priceAmount),
            currency: priceCurrency
        };

        //upload images to imagekit
        const images = await Promise.all(
            (req.files || []).map(file =>
                uploadImage({
                    buffer: file.buffer,
                    originalname: file.originalname,
                    folder: '/Product-Images'
                })

            )
        );


        const product = await productModel.create({
            title,
            description,
            price,
            seller,
            images,
            stock,
            gender,
            category
        });

        await broker.publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", product)
        
        await broker.publishToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", {
            email: req.user.email,
            productId: product._id,
            sellerId: seller
        });


        return res.status(201).json({
            message: 'Product created',
            success: true,
            data: product,
        });

    } catch (error) {
        console.error("🚀 ~ createProduct ~ error:", error);

        return res.status(500).json({
            message: 'Failed to create product',
            success: false,
            error: error.message
        });
    }
};


// const getProducts = async (req, res) => {
//     try {
//         const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query

//         const filter = {}

//         if (q) {
//             filter.$text = { $search: q }
//         }

//         if (minprice) {
//             filter['price.amount'] = { ...filter['price.amount'], $gte: Number(minprice) }
//         }

//         if (maxprice) {
//             filter['price.amount'] = { ...filter['price.amount'], $gte: Number(maxprice) }
//         }

//         const products = await productModel.find(filter).skip(Number(skip)).limit(Math.min(Number(limit), 20))

//         return res.status(200).json({ data: products })

//     } catch (error) {
//         console.error("🚀 ~ getProducts ~ error:", error)
//     }
// }

//orignal
// const getProducts = async (req, res) => {
//     try {
//         const { q, minprice, maxprice, page = 1, limit = 20 } = req.query;

//         const filter = {};

//         // 1. Text Search Filter
//         if (q) {
//             filter.$text = { $search: q };
//         }

//         // 2. Price Filter (Proper Range Handling)
//         if (minprice || maxprice) {
//             filter['price.amount'] = {};
//             if (minprice) filter['price.amount'].$gte = Number(minprice);
//             if (maxprice) filter['price.amount'].$lte = Number(maxprice); // Fixed: $lte instead of $gte
//         }

//         // 3. Pagination Math
//         const parsedPage = Math.max(1, Number(page)); // Minimum page 1 rahega
//         const parsedLimit = Math.min(Math.max(1, Number(limit)), 50); // Max 50 products per request
//         const skipAmount = (parsedPage - 1) * parsedLimit;

//         // 4. Parallel Query (Products + Total Count)
//         const [products, totalProducts] = await Promise.all([
//             productModel.find(filter).skip(skipAmount).limit(parsedLimit),
//             productModel.countDocuments(filter) // Total count for frontend pagination
//         ]);

//         const totalPages = Math.ceil(totalProducts / parsedLimit);

//         // 5. Complete Response
//         return res.status(200).json({
//             success: true,
//             data: products,
//             pagination: {
//                 totalProducts,
//                 totalPages,
//                 currentPage: parsedPage,
//                 pageSize: products.length,
//                 hasNextPage: parsedPage < totalPages,
//                 hasPrevPage: parsedPage > 1
//             }
//         });

//     } catch (error) {
//         console.error("🚀 ~ getProducts ~ error:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// };



// const getProducts = async (req, res) => {
//     try {
//         const {
//             q,
//             minprice,
//             maxprice,
//             gender,
//             page = 1,
//             limit = 20
//         } = req.query;

//         const filter = {};

//         // 1. Text Search Filter
//         if (q) {
//             filter.$text = { $search: q };
//         }

//         // 2. Price Filter
//         if (minprice || maxprice) {
//             filter["price.amount"] = {};

//             if (minprice) {
//                 filter["price.amount"].$gte = Number(minprice);
//             }

//             if (maxprice) {
//                 filter["price.amount"].$lte = Number(maxprice);
//             }
//         }

//         // 3. Gender Filter
//         if (gender) {
//             filter.gender = gender;
//         }

//         // 4. Pagination
//         const parsedPage = Math.max(1, Number(page));

//         const parsedLimit = Math.min(
//             Math.max(1, Number(limit)),
//             50
//         );

//         const skipAmount =
//             (parsedPage - 1) * parsedLimit;

//         // 5. Products + Total Count
//         const [products, totalProducts] = await Promise.all([
//             productModel
//                 .find(filter)
//                 .skip(skipAmount)
//                 .limit(parsedLimit),

//             productModel.countDocuments(filter)
//         ]);

//         const totalPages =
//             Math.ceil(totalProducts / parsedLimit);

//         // 6. Response
//         return res.status(200).json({
//             success: true,
//             data: products,
//             pagination: {
//                 totalProducts,
//                 totalPages,
//                 currentPage: parsedPage,
//                 pageSize: products.length,
//                 hasNextPage: parsedPage < totalPages,
//                 hasPrevPage: parsedPage > 1
//             }
//         });

//     } catch (error) {
//         console.error(
//             "🚀 ~ getProducts ~ error:",
//             error
//         );

//         return res.status(500).json({
//             success: false,
//             message: "Internal server error"
//         });
//     }
// };


const getProducts = async (req, res) => {
    try {
        const { q, minprice, maxprice, gender, category, size, page = 1, limit = 12 } = req.query;

        const filter = {};

        // Search: title, description, category
        if (q && q.trim()) {
            const regex = new RegExp(q.trim(), "i");
            filter.$or = [
                { title: regex },
                { description: regex },
                { category: regex }
            ];
        }

        // Category filter
        if (category) filter.category = category;

        // Price filter
        if (minprice !== undefined || maxprice !== undefined) {
            filter["price.amount"] = {};
            if (minprice !== undefined) filter["price.amount"].$gte = Number(minprice);
            if (maxprice !== undefined) filter["price.amount"].$lte = Number(maxprice);
        }

        // Gender, Size
        if (gender) filter.gender = gender;
        if (size) filter.size = size;

        console.log("FILTER:", JSON.stringify(filter));

        const parsedPage = Math.max(1, Number(page));
        const parsedLimit = 12;
        const skip = (parsedPage - 1) * parsedLimit;

        const [products, totalProducts] = await Promise.all([
            productModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
            productModel.countDocuments(filter)
        ]);

        console.log("FOUND:", products.length);

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                totalProducts,
                totalPages: Math.ceil(totalProducts / parsedLimit),
                currentPage: parsedPage,
                hasNextPage: parsedPage < Math.ceil(totalProducts / parsedLimit),
                hasPrevPage: parsedPage > 1
            }
        });

    } catch (error) {
        console.error("getProducts error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const getProductById = async (req, res) => {
    try {

        const { id } = req.params

        const product = await productModel.findById(id)

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false
            })
        }

        return res.status(200).json({ data: product, success: true })

    } catch (error) {
        console.error("🚀 ~ getProductById ~ error:", error)
    }
}

const updateProduct = async (req, res) => {
    try {

        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid product id",
                success: false
            })
        }

        const product = await productModel.findOne({
            _id: id,
            seller: req.user.id
        })

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false
            })
        }

        const allowedUpdates = ['title', 'description', 'price','stock'];
        for (const key of Object.keys(req.body)) {
            if (allowedUpdates.includes(key)) {
                if (key === 'price' && typeof req.body.price === 'object') {
                    if (req.body.price.amount !== undefined) {
                        product.price.amount = Number(req.body.price.amount);
                    }
                    if (req.body.price.currency !== undefined) {
                        product.price.currency = req.body.price.currency;
                    }
                } else {
                    product[key] = req.body[key];
                }

            }
        }

        await product.save();

        return res.status(200).json({ message: 'Product updated', product, success: true });

    } catch (error) {
        console.error("🚀 ~ updateProduct ~ error:", error)
    }
}

const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const product = await productModel.findOne({
            _id: id,
        })

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'Forbidden: you can only delete your own products'
            })
        }

        // await product.remove()
        await product.deleteOne();
        return res.status(200).json({ message: 'Product deleted', product, success: true });

    } catch (error) {
        console.error("🚀 ~ deleteProduct ~ error:", error)
    }
}

const getProductBySeller = async (req, res) => {
    try {

        const seller = req.user

        const { skip = 0, limit = 20 } = req.query;

        const products = await productModel.find({ seller: seller.id }).skip(skip).limit(Math.min(limit, 20));

        return res.status(200).json({ data: products });

    } catch (error) {
        console.error("🚀 ~ getProductBySeller ~ error:", error)
    }
}

export default { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getProductBySeller };
