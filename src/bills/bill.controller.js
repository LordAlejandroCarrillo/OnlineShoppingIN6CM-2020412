import { response, request } from "express"
import User from "../users/user.model.js"
import Product from "../products/product.model.js";
import Bill from "./bill.model.js";
import jwt from "jsonwebtoken"

export const createABill = async (req, res) => {
    try {
        const token = await req.header('x-token')
    
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const currentUser = await User.findById(uid)
        let currentUserList = currentUser.shoppingCart
        let verifyStock = 0
        let outOfStockList = []

        await Promise.all(
            currentUserList.map( async localCurrentUserList => {
                let currentProduct = await Product.findById(localCurrentUserList.productId)
                if(currentProduct.stock < localCurrentUserList.productAmount) {
                    verifyStock++
                    outOfStockList.push({name: currentProduct.name, stock: currentProduct.stock})
                }
            })
        )
        
        if(verifyStock == 0){
            let billTotal = 0
            await currentUserList.map( async localCurrentUserList => {
                let amountByPrice = 0
                amountByPrice = localCurrentUserList.productPrice*localCurrentUserList.productAmount
                billTotal = billTotal+amountByPrice
            })
            console.log(parseInt(billTotal))
            const newBill = await Bill.create({
                nameOfUser:currentUser.name,
                surnameOfUser:currentUser.surname,
                emailOfUser:currentUser.email,
                userRef:currentUser.id,
                total:billTotal,
                productList:currentUser.shoppingCart
            })
            await User.findByIdAndUpdate(uid, {shoppingCart:[]}, {new:true})
            await Promise.all(
                currentUserList.map( async localCurrentUserList => {
                    let currentProductUpdate = await Product.findById(localCurrentUserList.productId)
                    await Product.findByIdAndUpdate(localCurrentUserList.productId, {
                        stock: currentProductUpdate.stock-localCurrentUserList.productAmount,
                        sold: currentProductUpdate.sold+localCurrentUserList.productAmount
                    },{new:true})
                })
            )
            res.status(200).json({
                success: true,
                msg: 'Purchase made successfuly.',
                newBill
            })
        } else{
            if(outOfStockList.length != 0){
                if(outOfStockList == 1){
                    res.status(401).json({
                        success: false,
                        msg: 'The product is out of stock or you are exeeding the stock.',
                        outOfStockList
                    })
                } else{
                    res.status(401).json({
                        success: false,
                        msg: 'Some products are out of stock or you are exeeding the stock.',
                        outOfStockList
                    })
                }
            } else{
                res.status(401).json({
                    success: false,
                    msg: 'List empty',
                })
            }
        }

    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: 'Error creating bill',
            e
        })
    }
}

export const getUserHistory = async (req, res) => {
    try {
        const token = await req.header('x-token')
        
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const query = {state: true}
        const [totalB, bills] = await Promise.all([
            Bill.countDocuments(query),
            Bill.find(query)
        ])
        let userBillsList = []
        bills.map( localBill =>{
            if(localBill.userRef.toString() == uid){
                userBillsList.push(localBill)
            }
        })

        if(userBillsList.length != 0){
            res.status(401).json({
                success: true,
                msg: 'Bills found.',
                userBillsList
            })
        } else{
            res.status(401).json({
                success: false,
                msg: 'Bills not found.',
            })
        }
    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: 'Error getting user bills.',
            e
        })
    }
}

export const getProductsByBill = async (req, res) => {
    try {
        const {id} = req.params
         
        const token = await req.header('x-token')
        
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const billRequested = await Bill.findById(id)
        const productBillList = billRequested.productList
        const currentUser = await User.findById(uid)
        if(billRequested.state == true){
            if(billRequested.userRef.toString() == uid){
                res.status(200).json({
                    success: true,
                    msg: "Producst found.",
                    productBillList
                })
            } else if(currentUser.role == "ADMIN_ROLE" || currentUser.role == "OWNER_ROLE"){ 
                res.status(200).json({
                    success: true,
                    msg: "Producst found.",
                    productBillList
                })
            }else{
                res.status(400).json({
                    success: false,
                    msg: "You are not allowed to do that."
                })
            }
        } else{
            res.status(400).json({
                success: false,
                msg: "Your bill doesnt exist."
            })
        }

    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: 'Error getting products.',
            e
        })
    }
}

export const updateBill = async (req, res) => {
    try {
        const token = await req.header('x-token')

        const { id } = req.params

        const { ...data } = req.body
        
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const currentBill = await Bill.findById(id)

        
        let currentBillList = currentBill.productList
        let verifyStock = 0
        let outOfStockList = []
        let productList = []
        
        let totalProduct = 0
        let productMath = 0
        let newProductList = []

        await Promise.all (data.productList.map( async localProduct=>{
            let currentProduct = await Product.findById(localProduct.productId)
            newProductList.push({
                productId: localProduct.productId,
                productName: currentProduct.name,
                productDescription: currentProduct.description,
                productPrice: currentProduct.price,
                productCategory: currentProduct.categoryName,
                productAmount: localProduct.productAmount
            })
            
            productMath = localProduct.productAmount*currentProduct.price
            totalProduct = totalProduct + productMath
        }))

        console.log(newProductList)
        await Promise.all(
            newProductList.map( async localcurrentBillList => {
                let currentProduct = await Product.findById(localcurrentBillList.productId)
                if(currentProduct.stock < localcurrentBillList.productAmount) {
                    verifyStock++
                    outOfStockList.push({name: currentProduct.name, stock: currentProduct.stock})
                }
            })
        )

        if(data.nameOfUser){
            data.nameOfUser = data.nameOfUser
        }
        if(data.surnameOfUser){
            data.surnameOfUser = data.surnameOfUser
        }
        if(data.emailOfUser){
            data.emailOfUser = data.emailOfUser
        }
        if(data.userRef){
            data.userRef = data.userRef
        }
        if(data.productList){
            data.productList = newProductList
        }
        data.total = totalProduct

        const currentUser = await User.findById(uid)
        if(verifyStock == 0){
            if(currentBill.userRef.toString() == uid || currentUser.role == "OWNER_ROLE" || currentUser.role == "ADMIN_ROLE"){
                const updateBill = await Bill.findByIdAndUpdate(id,data, {new:true})
                
                await Promise.all(
                    newProductList.map( async localProduct => {
                        let currentProductUpdate = await Product.findById(localProduct.productId)
                        await Product.findByIdAndUpdate(localProduct.productId, {
                            stock: currentProductUpdate.stock-localProduct.productAmount,
                            sold: currentProductUpdate.sold+localProduct.productAmount
                        },{new:true})
                    })
                )
                res.status(200).json({
                    success: true,
                    msg: 'Bill updated successfuly.',
                    updateBill
                })
            } else{
                res.status(401).json({
                    success: false,
                    msg: 'You are not allowed to do that.',
                    updateBill
                })
            }
        } else{
            if(outOfStockList.length != 0){
                if(outOfStockList == 1){
                    res.status(401).json({
                        success: false,
                        msg: 'The product is out of stock or you are exeeding the stock.',
                        outOfStockList
                    })
                } else{
                    res.status(401).json({
                        success: false,
                        msg: 'Some products are out of stock or you are exeeding the stock.',
                        outOfStockList
                    })
                }
            } else{
                res.status(401).json({
                    success: false,
                    msg: 'List empty',
                })
            }
        }

    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: 'Error updating bill',
            e
        })
    }
}

export const getBillsUser = async (req, res) => {
    try {
        const token = await req.header('x-token')
        
        if(!token){
            return res.status(401).json({
                msg: 'No hay token en la peticion'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

        const { id }  = req.params

        const query = {state: true}
        const [totalB, bills] = await Promise.all([
            Bill.countDocuments(query),
            Bill.find(query)
        ])
        let userBillsList = []
        bills.map( localBill =>{
            if(localBill.userRef.toString() == id){
                userBillsList.push(localBill)
            }
        })

        const currentUser = await User.findById(uid)

        if(currentUser.role == "OWNER_ROLE" || currentUser.role == "ADMIN_ROLE"){
            if(userBillsList.length != 0){
                res.status(401).json({
                    success: true,
                    msg: 'Bills found.',
                    userBillsList
                })
            } else{
                res.status(401).json({
                    success: false,
                    msg: 'Bills not found.',
                })
            }
        } else{
            res.status(401).json({
                success: false,
                msg: 'You are not allowed to do that.',
            })
        }

    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: 'Error getting user bills.',
            e
        })
    }
}

