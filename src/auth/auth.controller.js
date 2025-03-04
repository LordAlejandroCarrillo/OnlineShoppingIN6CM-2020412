import User from "../users/user.model.js";
import { generateJWT } from "../helpers/generate-jwt.js";
import { hash, verify } from "argon2";

export const login = async(req, res) => {
    const {email, password, username} = req.body
    try {
        const lowerEmail = email ? email.toLowerCase() : null
        const lowerUsername = username ? username.toLowerCase() : null

        const user = await User.findOne({
            $or: [{email: lowerEmail}, {username: lowerUsername}]
        })

        if(!user){
            return res.status(400).json({
                msg: 'Invalid credentials, email not found.'
            })
        }

        if(!user.state){
            return res.status(400).json({
                msg: 'User not found in the database.'
            })
        }
        
        const validPassword = await verify(user.password,password)
        if(!validPassword){
            return res.status(400).json({
                msg: 'Incorrect password.'
            })
        }
        const token = await generateJWT(user.id)
        res.status(200).json({
            msg: 'Logged in successfully!',
            userDetails:{
                username: user.username,
                token: token
            }
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Server error',
            error: e.message
        })
    }
}

export const register = async (req, res)=>{
    try {
        const data = req.body
        
        const encryptedPassword = await hash (data.password)
        
        const user = await User.create({
            name: data.name,
            surname: data.surname,
            username: data.username,
            email: data.email,
            password: encryptedPassword
        })
        
        return res.status(201).json({
            message: "User created successfully",
            userDetails : {
                user: user.email
            }
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "User registration failed",
            error: e.message
        })
    }
}