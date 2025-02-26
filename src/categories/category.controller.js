import User from "../users/user.model.js"
import jwt from "jsonwebtoken"
import Category from "./category.model.js"
import Product from "../products/product.model.js"

export const addCategory = async (req, res)=>{
    try {
        const token = await req.header('x-token')
        
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const data = req.body

        const currentUser = await User.findById(uid)
        
        if(currentUser.role == "ADMIN_ROLE" || currentUser.role == "OWNER_ROLE"){

            const category = await Category.create({
                name: data.name,
                description: data.description
            })
            
            return res.status(201).json({
                message: "Category created successfully",
                category
            })
        } else{
            return res.status(401).json({
                message: "You are not allowed to do this."
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Category creation failed",
            error: e.message
        })
    }
}

export const editCategory = async (req, res)=>{
    try {
        const token = await req.header('x-token')
        
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const { id } = req.params

        const data = req.body

        const currentUser = await User.findById(uid)

        const categoryUpdating = await Category.findById(id)
        
        if(currentUser.role == "ADMIN_ROLE" || currentUser.role == "OWNER_ROLE"){
            if(categoryUpdating.state == true){
                if(categoryUpdating.name != "Default"){
                    const category = await Category.findByIdAndUpdate(
                        id,
                        {
                            name: data.name,
                            description: data.description
                        },
                        {new:true}
                    )
                    return res.status(201).json({
                        message: "Category updated successfully",
                        category
                    })
                } else{
                    return res.status(401).json({
                        message: "Category called Default, cannot change."
                    })
                }
            } else{
                return res.status(401).json({
                    message: "Category does not exsit."
                })
            }
            
        } else{
            return res.status(401).json({
                message: "You are not allowed to do this."
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Category updating failed",
            error: e.message
        })
    }
}

export const deleteCategory = async (req, res)=>{
    try {
        const token = await req.header('x-token')
        
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }

        const query = {state:true}
        const [totalP, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
        ])

        const [totalC, categories] = await Promise.all([
            Category.countDocuments(query),
            Category.find(query)
        ])

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const { id } = req.params

        const currentUser = await User.findById(uid)

        const categoryUpdating = await Category.findById(id)
        if(categoryUpdating.state == true){
            if(currentUser.role == "ADMIN_ROLE" || currentUser.role == "OWNER_ROLE"){
                if(categoryUpdating.name != "Default"){
                    const category = await Category.findByIdAndUpdate(
                        id,
                        {
                            state: false
                        },
                        {new:true}
                    )
                    let catId = ''
                    let catName = ''
                    categories.map( localCategory =>{
                        if(localCategory.name == "Default"){
                            catName = localCategory.name
                            catId = localCategory.id
                        }
                    })
            

                    products.map( async localProduct =>{
                        if(category.id == localProduct.categoryRef.toString()){
                            await Product.findByIdAndUpdate(localProduct.id, {categoryName:catName, categoryRef:catId}, {new:true})
                        }
                    })
        
                    return res.status(201).json({
                        message: "Category deleted successfully",
                        category
                    })
                } else{
                    return res.status(401).json({
                        message: "Category called Default cannot be deleted."
                    })
                }
            } else{
                return res.status(401).json({
                    message: "You are not allowed to do this."
                })
            }
        } else{
            return res.status(401).json({
                message: "Category has been already deleted."
            })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Category deletion failed",
            error: e.message
        })
    }
}

export const getCategories = async (req, res) =>{
    try {
        const query = {state:true}
        const [totalC, categories] = await Promise.all([
            Category.countDocuments(query),
            Category.find(query)
        ])

        const getExistentCategories = categories.filter(localCategory => localCategory.state == true)
        if(getExistentCategories.length != 0){
            return res.status(200).json({
                success: true,
                msg: "Categories found.",
                getExistentCategories,
            })
        } else{
            return res.status(200).json({
                success: true,
                msg: "Categories not found.",
                getExistentCategories,
            })
        }
        
    } catch (error) {
        console.log(e)
        return res.status(500).json({
            message: "Categories not found.",
            error: e.message
        })
    }
}