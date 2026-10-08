import userModel from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import redis from '../db/redis.js'
import { publishToQueue } from "../broker/broker.js"


const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullName: { firstName, lastName }, role } = req.body

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        })

        if (isUserAlreadyExists) {
            return res.status(409).json({
                message: "Username or email already exists",
                success: false
            })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await userModel.create({
            username,
            email,
            password: hash,
            fullName: { firstName, lastName },
            role: role || 'user'  //default role is 'user'
        })

        await Promise.all([

            //publish user created event to rabbitmq
            publishToQueue('AUTH_NOTIFICATION.USER_CREATED', {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
            }),

            publishToQueue('AUTH_SELLER_DASHBOARD.USER_CREATED', user)

        ])

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(201).json({
            message: "Account created successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                addresses: user.addresses
            },
            token
        })

    } catch (error) {
        console.error("🚀 ~ registerUser ~ error:", error)
    }
}

const loginUser = async (req, res,expectedRole) => {
    try {
        const { usernameOrEmail, password } = req.body

        const user = await userModel.findOne({
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        }).select('+password')

        if (!user) {
            return res.status(401).json({
                message: "User not exists",
                success: false
            })
        }

         // Role check
        if (user.role !== expectedRole) {
            return res.status(403).json({
                message: `Please login from ${user.role} dashboard`,
                success: false
            })
        }

        const isMatch = await bcrypt.compare(password, user.password || '')

        if (!isMatch) {
            return res.status(401).json({
                message: "Wrong email or password",
                success: false
            })
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: '1d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(201).json({
            message: `Welcome Back ${user.fullName.firstName}`,
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                addresses: user.addresses
            }
        })


    } catch (error) {
        console.error("🚀 ~ loginUser ~ error:", error)
    }
}

const getCurrentUser = async (req, res) => {
    try {

        const userId = req.user
        const user = await userModel.findById(userId.id)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "Current user fetched successfully",
            user: user,
            success: true
        })
    } catch (error) {
        console.error("🚀 ~ getCurrentUser ~ error:", error)
    }
}

const logoutUser = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (token) {
            await redis.set(`blacklist:${token}`, 'true', "EX", 24 * 60 * 60)
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: true
        })

        return res.status(200).json(
            {
                message: "Logged out",
                success: true
            }
        )

    } catch (error) {
        console.error("🚀 ~ logoutUser ~ error:", error)
    }
}

const getUserAddresses = async (req, res) => {
    try {
        const id = req.user.id

        const user = await userModel.findById(id).select('addresses')

        if (!user) {
            return res.status(404).json({
                message: "user not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "User addresses fetched successfully",
            success: true,
            addresses: user.addresses
        })

    } catch (error) {
        console.error("🚀 ~ getUserAddresses ~ error:", error)
    }

}

const addUserAddress = async (req, res) => {
    try {
        const id = req.user.id

        const { street, city, state, pincode, country, phone, isDefault } = req.body

        const addressCheck = await userModel.findById(id);

        if (!addressCheck) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (addressCheck.addresses.length >= 4) {
            return res.status(400).json({
                message: "You can add maximum 4 addresses",
                success: false
            });
        }

        const user = await userModel.findOneAndUpdate({ _id: id }, {
            $push: {
                addresses: {
                    street,
                    city,
                    state,
                    pincode,
                    country,
                    phone,
                    isDefault
                }
            }
        }, { returnDocument: "after" })

        if (!user) {
            return res.status(404).json({
                message: "user not found",
                success: false
            })
        }

        return res.status(201).json({
            message: "Address added",
            address: user.addresses[user.addresses.length - 1],
            user,
            success:true
        })

    } catch (error) {
        console.error("🚀 ~ addUserAddress ~ error:", error)
    }
}

const deleteUserAddress = async (req, res) => {
    try {
        const id = req.user.id

        const { addressId } = req.params

        const isAddressExists = await userModel.findOne({ _id: id, 'addresses._id': addressId });


        if (!isAddressExists) {
            return res.status(404).json({ message: "Address not found" });
        }

        const user = await userModel.findOneAndUpdate({ _id: id }, {
            $pull: {
                addresses: { _id: addressId }
            }
        }, { returnDocument: "after" })

        if (!user) {
            return res.status(404).json({
                message: "user not found",
                success: false
            })
        }

        const addressExists = user.addresses.some(addr => addr._id.toString() === addressId);

        if (addressExists) {
            return res.status(500).json({
                message: "Failed to delete address",
                success: false
            });
        }

        return res.status(200).json({
            message: "Address deleted",
            addresses: user.addresses,
            user,
            success: true
        });

    } catch (error) {
        console.error("🚀 ~ deleteUserAddress ~ error:", error)
    }
}

export default {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    getUserAddresses,
    addUserAddress,
    deleteUserAddress
}