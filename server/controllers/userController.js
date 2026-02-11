import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/utils.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"

//signup new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({
                success: false,
                message: "Missing Details"
            })
        }

        const user = await User.findOne({ email }) //syntax

        if (user) {
            return res.json({
                success: false,
                message: "Account already exists"
            })
        }

        //Hashing is:
        // CPU expensive
        // Multiple rounds (salt rounds)
        // bcrypt runs:
        // In a separate thread (libuv thread pool)
        // So it does not block the event loop
        // That’s why it’s async and promise-based.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        })

        const token = generateToken(newUser._id)

        res.json({
            success: true,
            userData: newUser,
            token,
            message: "Account created successfully"
        })

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        })
    }
}

//login controller

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.json({
                success: false,
                message: "Missing Details"
            })
        }
        const user = await User.findOne({ email })

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            })
        }

        const token = generateToken(user._id)

        res.json({
            success: true,
            userData: user,
            token,
            message: "Login successfully"
        })


    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        })
    }
}

//user is authenticated or not
export const checkAuth = (req, res) => { 
    res.json({
        success: true,
        user: req.user
    })
}

//controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;

        const userId = req.user._id

        let updatedUser;
        //if profile Pic is not provided , only name and bio 
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true })
        } else {
            //profile pic provided
            const upload = await cloudinary.uploader.upload(profilePic)

            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true })
        }
        res.json({
            success: true,
            user: updatedUser
        })
    } catch (e) {
        console.log(e);
        res.json({
            success: false,
            message: e.message
        })

    }
}