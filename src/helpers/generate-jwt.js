import jwt from "jsonwebtoken";

export const generateJWT = (uid = ' ') => {
    return new Promise((resolve, reject) => {
        const payLoad = { uid }
        jwt.sign(
            payLoad, 
            process.env.SECRETORPRIVATEKEY, {
            expiresIn: '2h'
        }, (err, token)=>{
            err ? (console.log(err), reject('No se pudo generar el token')) : resolve(token)
        })
    })
}