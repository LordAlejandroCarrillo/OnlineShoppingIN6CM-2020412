import User from "../users/user.model.js"
import Category from "../categories/category.model.js"
import Product from "../products/product.model.js"
import Bill from "../bills/bill.model.js"

export const existentEmail = async (email = ' ') => {
    
    const existEmail = await User.findOne({email})
    
    if(existEmail){
        throw new Error(`El correo ${ email } ya existe en la base de datos`)
    }
}

export const userExistsById = async(id = "") => {
    const userExists = await User.findById(id)

    if(!userExists){
        throw new Error(`The ID ${id} doesn't exist`)
    }
}

export const categoryExistById = async(id = "") => {
    const categoryExists = await Category.findById(id)

    if(!categoryExists){
        throw new Error(`The ID ${id} doesn't exist`)
    }
}

export const productExistById = async(id = "") => {
    const productExists = await Product.findById(id)

    if(!productExists){
        throw new Error(`The ID ${id} doesn't exist`)
    }
}

export const billExistById = async(id = "") => {
    const billExists = await Bill.findById(id)

    if(!billExists){
        throw new Error(`The ID ${id} doesn't exist`)
    }
}