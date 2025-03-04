import jwt from "jsonwebtoken";

import User from '../users/user.model.js'

export const  validateJWT = async (req, res, next) =>{
    const token = await req.header('x-token')

    if(!token){
        return res.status(401).json({
            msg: 'No hay token en la peticion'
        })
    }

    try {
        
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const user = await User.findById(uid)

        if(!user){
            return res.status(401).json({
                msg: 'Usuario no existe en la base de datos'
            })
        }

        if(user.state === false){
            return res.status(401).json({
                msg: 'Token no valido - usuarios con estado: false',
            })
        }
        
        req.user = user

        next()

    } catch (e) {
        console.log(e)
        res.status(401).json({
            msg: 'Token no valido'
        })
    }
}