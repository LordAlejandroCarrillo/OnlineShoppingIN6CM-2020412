import User from "../users/user.model.js"
import Category from "../categories/category.model.js"
import Product from "./product.model.js"
import jwt from "jsonwebtoken"

export const addProduct = async (req, res)=>{
    try {
        const token = await req.header('x-token')

        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const data = req.body

        const query = {state: true}
        const [totalC, categories] = await Promise.all([
            Category.countDocuments(query),
            Category.find(query)
        ])

        let categoryCount = 0
        let catId = ""

        const lowerCategory = data.category ? data.category.toLowerCase() : null;
                const capitalizedCategory = lowerCategory 
                    ? lowerCategory.charAt(0).toUpperCase() + lowerCategory.slice(1) 
                    : null;

        categories.map( localCategory =>{
            if(localCategory.name == capitalizedCategory){
                categoryCount++
                catId = localCategory.id
            }
        })

        const user = await User.findById(uid)

        if(user.role == "ADMIN_ROLE" || user.role == "OWNER_ROLE"){
            if(categoryCount != 0){
                if(catId != ""){
                    const category = await Category.findById(catId)
    
                    const product = await Product.create({
                        name: data.name,
                        description: data.description,
                        stock:data.stock,
                        price:data.price,
                        categoryRef: category.id,
                        categoryName: category.name
                    })
                    
                    return res.status(200).json({
                        success: true,
                        message: "Product created successfully",
                        product
                    })
                }
            } else{
                return res.status(401).json({
                    success: false,
                    message: `There is no "${data.category}" on categories, perhaps you spelled it wrong.`
                })
            }
        } else{
            return res.status(401).json({
                success: false,
                message: "You are not allowed to do this."
            })
        }
        
        
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Product creation failed",
            error: e.message
        })
    }
}

export const getProducts = async (req, res) =>{
    try {
        const query = {state:true}
        const [totalC, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
        ])

        const getExistentProduct = products.filter(localProduct => localProduct.state == true)
        if(getExistentProduct.length != 0){
            return res.status(200).json({
                success: true,
                msg: "Products found.",
                getExistentProduct,
            })
        } else{
            return res.status(401).json({
                success: true,
                msg: "Products not found.",
                getExistentProduct,
            })
        }
        
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Products not found.",
            error: e.message
        })
    }
}

export const getByIdProduct = async (req, res) =>{
    try {
        const {id} = req.params
        
        const product = await Product.findById(id)

        if(product.state == true){
            return res.status(200).json({
                success: true,
                msg: "Product found.",
                product,
            })
        } else{
            return res.status(401).json({
                success: false,
                msg: "Product not found."
            })
        }
        
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Product not found.",
            error: e.message
        })
    }
}

export const updateProduct = async (req, res = response)=>{
    try {
        const token = req.header('x-token')
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const { description, name, category, stock, price } = req.body

        const { data } = req.body

        console.log(data)
        const { id } = req.params
        const query = {state:true}
        const [totalC, categories] = await Promise.all([
            Category.countDocuments(query),
            Category.find(query)
        ])

        const lowerCategory = category ? category.toLowerCase() : null;
                const capitalizedCategory = lowerCategory 
                    ? lowerCategory.charAt(0).toUpperCase() + lowerCategory.slice(1) 
                    : null;
                    
        let categoryDB = {}
        await categories.map(localCategory =>{
            if(localCategory.name == capitalizedCategory){
                categoryDB = localCategory
            }
        })
        const currentUser = await User.findById(uid)
        const productData = await Product.findById(id)
        if(productData.state == true){
            if(currentUser.role == "ADMIN_ROLE" || currentUser.role == "OWNER_ROLE"){
                if(categoryDB != undefined){
                    const product = await Product.findByIdAndUpdate(
                        id, 
                        {
                            name: name,
                            description: description,
                            stock: stock,
                            price: price,
                            categoryRef: categoryDB.id,
                            categoryName: categoryDB.name
                        }, 
                        {new:true}
                    )
                    res.status(200).json({
                        success: true,
                        msg: "Product updated",
                        product
                    })
                } else{
                    res.status(401).json({
                        success: false,
                        msg: `The category ${category} does not exist.`,
                    })
                }
            } else{
                res.status(401).json({
                    success: false,
                    msg: 'You are not allowed to do this.',
                })
            }
        } else{
            res.status(401).json({
                success: false,
                msg: 'The product does not exist.',
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating product',
            error
        })
    }
}

export const deleteProduct = async (req, res = response)=>{
    try {
        const {id} = req.params
        const token = req.header('x-token')
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const userData = await User.findById(uid)

        const productData = await Product.findById(id)

        if(productData.state == true){
            if( userData.role == "ADMIN_ROLE" || userData.role == "OWNER_ROLE" ){
                const product = await Product.findByIdAndUpdate(id, {state:false}, {new:true})
                res.status(200).json({
                    success: true,
                    msg: "Product deleted",
                    product
                })
            } else{
                res.status(401).json({
                    success: false,
                    msg: "You are not allowed to do that."
                })
            }
        } else{
            res.status(401).json({
                success: false,
                msg: "Product already deleted."
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deleting product',
            error
        })
    }
}

export const getProductsSelledTheMost = async (req, res) =>{
    try {
        const query = {state:true}
        const [totalC, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
        ])

        const getExistentProduct = products.filter(localProduct => localProduct.state == true)
        if(getExistentProduct.length != 0){
            getExistentProduct.sort((a,b) => b.sold - a.sold)
            return res.status(200).json({
                success: true,
                msg: "Products found.",
                getExistentProduct,
            })
        } else{
            return res.status(401).json({
                success: true,
                msg: "Products not found.",
                getExistentProduct,
            })
        }
        
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Products not found.",
            error: e.message
        })
    }
}

export const getProductsSoldOut = async (req, res) =>{
    try {

        const token = await req.header('x-token')
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const query = {state:true}
        const [totalC, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
        ])

        const getExistentProduct = products.filter(localProduct => localProduct.state == true)

        const currentUser = await User.findById(uid)
        const productsOutOfStock = getExistentProduct.filter(localProduct => localProduct.stock == 0)
        if(currentUser.role == "OWNER_ROLE" || currentUser.role == "ADMIN_ROLE"){
            if(getExistentProduct.length != 0){
                console.log(getExistentProduct[1].stock)
                if(productsOutOfStock.length != 0){
                    return res.status(200).json({
                        success: true,
                        msg: "Products found.",
                        productsOutOfStock
                    })
                } else{
                    return res.status(401).json({
                        success: true,
                        msg: "Products not found.",
                        productsOutOfStock
                    })
                }
            } else{
                return res.status(401).json({
                    success: true,
                    msg: "Products not found.",
                    productsOutOfStock,
                })
            }
        } else{
            return res.status(401).json({
                success: true,
                msg: "You are not allowed to do that."
            })
        }
        
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Products not found.",
            error: e.message
        })
    }
}

export const getProductsByCategory = async (req, res = response)=>{
    try {
        const { category } = req.params

        const query = {state:true}
        const [totalC, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
        ])

        const lowerCategory = category ? category.toLowerCase() : null;
                const capitalizedCategory = lowerCategory 
                    ? lowerCategory.charAt(0).toUpperCase() + lowerCategory.slice(1) 
                    : null

        const verifyIfProductExists = products.filter(localProduct => localProduct.state == true)
        const productWithCategoryRequested = verifyIfProductExists.filter(localCProduct => localCProduct.categoryName.toLowerCase().startsWith(capitalizedCategory.toLowerCase()))
        
        if(productWithCategoryRequested.length != 0){
            res.status(200).json({
                success: true,
                msg: "Products found",
                productWithCategoryRequested
            })
        } else{
            res.status(400).json({
                success:true,
                msg: "Producst not found or your category doesnt exist.",
                productWithCategoryRequested
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error getting product',
            error
        })
    }
}

export const getProductByName = async (req, res = response)=>{
    try {
        const { name } = req.params

        const query = {state:true}
        const [totalC, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
        ])

        const verifyIfProductExists = products.filter(localProduct => localProduct.state == true)
        console.log(verifyIfProductExists)
        const productWithNameRequested = verifyIfProductExists.filter(localNProduct => localNProduct.name.toLowerCase().startsWith(name.toLowerCase()))
        if(productWithNameRequested.length != 0){
            res.status(200).json({
                success: true,
                msg: "Products found",
                productWithNameRequested
            })
        } else{
            res.status(400).json({
                success:true,
                msg: "Producst not found or your name doesnt exist.",
                productWithNameRequested
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error getting products.',
            error
        })
    }
}