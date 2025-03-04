import { response, request } from "express"
import User from "./user.model.js"
import Product from "../products/product.model.js";
import jwt from "jsonwebtoken"
import { hash, verify } from "argon2";

export const getUsers = async  (req = request, res = response) => {
    try {
        const {limit = 10, since = 0} = req.query
        const query = {state : true}

        const [total, users] = await Promise.all([
            User.countDocuments(query),
            User.find(query)
                .skip(Number(since))
                .limit(Number(limit))
        ])
        
        res.status(200).json({
            succes: true,
            total,
            users
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg:'Error obtaining users',
            error
        })
    }
}


export const updateUser = async (req, res = response)=>{
    try {
        const {id} = req.params
        const token = req.header('x-token')
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
        
        const {_id, email, ...data} = req.body
        if(data.password){
            data.password = await hash(data.password)
        }
        
        const userData = await User.findById(uid)
        const idParamsUser = await User.findById(id)
        const validPassword = await verify(userData.password,data.oldPassword)
        if(userData.state == true || idParamsUser == true){
            if(uid == id){
                if(data.oldPassword){
                    if(validPassword){
                        const user = await User.findByIdAndUpdate(uid, (data), {new:true})
                        res.status(200).json({
                            success: true,
                            msg: "User updated",
                            user
                        })
                    } else{
                        res.status(200).json({
                            success: true,
                            msg: "Invalid password"
                        })
                    }
                } else{
                    res.status(401).json({
                        success: false,
                        msg: "Is necessary to enter the old password to edit your user."
                    })
                }
            } else if(userData.role == "ADMIN_ROLE" || userData.role == "OWNER_ROLE"){ 
                const user = await User.findByIdAndUpdate(id, (data), {new:true})
                res.status(200).json({
                    success: true,
                    msg: "User updated",
                    user
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
                msg: "User deleted."
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating user',
            error
        })
    }
}

export const deleteUser = async (req, res = response)=>{
    try {
        const {id} = req.params
        const token = req.header('x-token')
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const data = req.body

        const userData = await User.findById(uid)
        const idParamsUser = await User.findById(id)

        const verifyPassword = verify(idParamsUser.password, data.password)

        const confirmationLowercase = data.confirm.toLowerCase()

        if(userData.state == true || idParamsUser == true){
            if(id == uid){
                if(verifyPassword){
                    if(confirmationLowercase == "aceptar"){
                        const user = await User.findByIdAndUpdate(uid, {state:false}, {new:true})
                        res.status(200).json({
                            success: true,
                            msg: "User deleted",
                            user
                        })
                    } else{
                        res.status(401).json({
                            success: false,
                            msg: "Deletion cancelled."
                        })
                    }
                } else{
                    res.status(401).json({
                        success: false,
                        msg: "Invalid password."
                    })
                }
            } else if( userData.role == "ADMIN_ROLE" || userData.role == "OWNER_ROLE" ){
                const user = await User.findByIdAndUpdate(id, {state:false}, {new:true})
                res.status(200).json({
                    success: true,
                    msg: "User deleted",
                    user
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
                msg: "User deleted."
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error deleting user',
            error
        })
    }
}

export const updateRoleUser = async (req, res = response)=>{
    try {
        const { id } = req.params
        const { role } = req.body
        const token = req.header('x-token')
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)
        
        const userData = await User.findById(uid)
        const idDataUser = await User.findById(id)

        if(userData.role == "ADMIN_ROLE" || userData.role == "OWNER_ROLE"){
            if(idDataUser.role == "OWNER_ROLE"){
                res.status(401).json({
                    success: false,
                    msg: "You cant change the Owner role.",
                })
            } else if (role == "ADMIN_ROLE" || role == "USER_ROLE"){
                const user = await User.findByIdAndUpdate(id, {role: role}, {new:true})
                res.status(200).json({
                    success: true,
                    msg: "Role updated",
                    user
                })
            }else{
                res.status(401).json({
                    success: false,
                    msg: "Your role does not exist."
                })
            }
        } else{
            res.status(401).json({
                success: false,
                msg: "You are not allowed to do that."
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error updating user',
            error
        })
    }
}

export const addProductToUser = async (req, res = response)=>{
    try {
        const {id} = req.params
        const { amount } = req.body
        const token = req.header('x-token')
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const userData = await User.findById(uid)
        const addingProduct = await Product.findById(id)

        if(amount == " " || !isNaN(amount)){
            console.log("succeed")
            if(userData.state == true){
    
                if(addingProduct.state == true){
                    
                    if(addingProduct.stock > 0){
                        
                        if(userData.shoppingCart.length == 0){
                            if(amount == " " || amount <= 0){
                                let newShoppingCart = []
                                let {stock} = await Product.findById(id)
                                if(stock >= 1){
                                    newShoppingCart = userData.shoppingCart
                                    newShoppingCart.push({
                                        productId: addingProduct.id,
                                        productName: addingProduct.name,
                                        productDescription: addingProduct.description,
                                        productPrice: addingProduct.price,
                                        productCategory: addingProduct.categoryName,
                                        productAmount: 1
                                        
                                    })
            
                                    const user = await User.findByIdAndUpdate(uid, {shoppingCart: newShoppingCart}, {new:true})
                                    
                                    res.status(200).json({
                                        success: true,
                                        msg: "Product added to shopping cart.",
                                        user
                                    })
                                } else{
                                    res.status(401).json({
                                        success: true,
                                        msg: "You have exceeded the stock of the product.",
                                    })
                                }
                            } else{
                                let {stock} = await Product.findById(id)
                                if(stock >= parseInt(amount)){
                                    let newShoppingCart = []
                                    newShoppingCart = userData.shoppingCart
                                    newShoppingCart.push({
                                        productId: addingProduct.id,
                                        productName: addingProduct.name,
                                        productDescription: addingProduct.description,
                                        productPrice: addingProduct.price,
                                        productCategory: addingProduct.categoryName,
                                        productAmount: parseInt(amount)

                                    })
                                
                                    const user = await User.findByIdAndUpdate(uid, {shoppingCart: newShoppingCart}, {new:true})

                                    res.status(200).json({
                                        success: true,
                                        msg: "Product added to shopping cart.",
                                        user
                                    })
                                } else{
                                    res.status(401).json({
                                        success: true,
                                        msg: "You have exceeded the stock of the product.",
                                    })
                                }
                            }
                            
                        } else if(userData.shoppingCart.length > 0){
                            let productCount = 0
                            userData.shoppingCart.map( localProductUser =>{
                                if(localProductUser.productId == id){
                                    productCount++
                                }
                            })
                            if(productCount == 0){
                                if(amount == " " || amount <= 0){
                                    let {stock} = await Product.findById(id)
                                    if(stock >= 1){
                                        let newShoppingCart = []
                                        newShoppingCart = userData.shoppingCart
                                        newShoppingCart.push({
                                            productId: addingProduct.id,
                                            productName: addingProduct.name,
                                            productDescription: addingProduct.description,
                                            productPrice: addingProduct.price,
                                            productCategory: addingProduct.categoryName,
                                            productAmount: 1
                                            
                                        })
                                        const user = await User.findByIdAndUpdate(uid, {shoppingCart: newShoppingCart}, {new:true})
                                        res.status(200).json({
                                            success: true,
                                            msg: "Product added to shopping cart.",
                                            user
                                        })
                                    } else{
                                        res.status(401).json({
                                            success: true,
                                            msg: "You have exceeded the stock of the product.",
                                        })
                                    }
                                } else{
                                    let {stock} = await Product.findById(id)
                                    if(stock >= parseInt(amount)){
                                        let newShoppingCart = []
                                        newShoppingCart = userData.shoppingCart
                                        newShoppingCart.push({
                                            productId: addingProduct.id,
                                            productName: addingProduct.name,
                                            productDescription: addingProduct.description,
                                            productPrice: addingProduct.price,
                                            productCategory: addingProduct.categoryName,
                                            productAmount: parseInt(amount)
                                        
                                        })
                                        const user = await User.findByIdAndUpdate(uid, {shoppingCart: newShoppingCart}, {new:true})
                                        res.status(200).json({
                                            success: true,
                                            msg: "Product added to shopping cart.",
                                            user
                                        })
                                    } else{
                                        res.status(401).json({
                                            success: true,
                                            msg: "You have exceeded the stock of the product.",
                                        })
                                    }
                                }
                            } else if (productCount > 0){
                                let newShoppingCart = []
                                newShoppingCart = userData.shoppingCart
                                
                                let productAmount = 0
                                newShoppingCart.map( localNewShoppingCart =>{
                                    productAmount = localNewShoppingCart.productAmount
                                })
                                
                                let {stock} = await Product.findById(id)
                                let verifyAmount = ""
                                if(amount == " " || amount == 0 || amount < 0){ 
                                    verifyAmount = 1
                                } else{
                                    verifyAmount = parseInt(amount)
                                }
                                if(stock >= productAmount+verifyAmount){
                                    const filterById = newShoppingCart.filter( localNewShoppingCart => localNewShoppingCart.productId != id)
                                    await User.findByIdAndUpdate(uid, {shoppingCart: filterById}, {new:true})
                                    let newAmount = parseInt(amount)
                                    if(amount != " "){
                                        if(amount < 1){
                                            filterById.push({
                                                productId: addingProduct.id,
                                                productName: addingProduct.name,
                                                productDescription: addingProduct.description,
                                                productPrice: addingProduct.price,
                                                productCategory: addingProduct.categoryName,
                                                productAmount: productAmount+1

                                            })
                                        } else{
                                            filterById.push({
                                                productId: addingProduct.id,
                                                productName: addingProduct.name,
                                                productDescription: addingProduct.description,
                                                productPrice: addingProduct.price,
                                                productCategory: addingProduct.categoryName,
                                                productAmount: productAmount+newAmount

                                            })
                                        }
                                    } else{
                                        filterById.push({
                                            productId: addingProduct.id,
                                            productName: addingProduct.name,
                                            productDescription: addingProduct.description,
                                            productPrice: addingProduct.price,
                                            productCategory: addingProduct.categoryName,
                                            productAmount: productAmount+1

                                        })
                                    }
                                    const user = await User.findByIdAndUpdate(uid, {shoppingCart: filterById}, {new:true})

                                    res.status(200).json({
                                        success: true,
                                        msg: "Product added to shopping cart.",
                                        user
                                    })
                                } else{
                                    res.status(401).json({
                                        success: true,
                                        msg: "You have exceeded the stock of the product.",
                                    })
                                }
                                
                            } else{
                                res.status(401).json({
                                    success: true,
                                    msg: "Some error ocurred.",
                                    
                                })
                            }
                        } else{
                            res.status(401).json({
                                success: true,
                                msg: "Some error ocurred.",
                                
                            })
                        }
                    } else{
                        res.status(401).json({
                            success: false,
                            msg: "Product out of stock."
                        })
                    }
                } else{
                    res.status(401).json({
                        success: false,
                        msg: "Product not found."
                    })
                }
            } else{
                res.status(401).json({
                    success: false,
                    msg: "User not found."
                })
            }

        } else{
            console.log("wrong")
            res.status(401).json({
                success: false,
                msg: "Your amount is not a number."
            })
        }


    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error adding product to user',
            error
        })
    }
}