import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
    windoMs: 15 * 60 *1000,
    mas: 100,
    message:{
        success:true,
        msg: "To much request from this IP, please try after 15 minutes."
    }
})

export default limiter