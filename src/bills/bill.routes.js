import { Router } from "express"
import { check } from "express-validator"
import {validateFields} from "../middlewares/validate-fields.js"
import { deleteFileOnError } from "../middlewares/delete-file-on-error.js"
import { createABill, getUserHistory, getProductsByBill, updateBill, getBillsUser } from "./bill.controller.js"
import { billExistById, userExistsById } from '../helpers/db-validator.js'

const router = Router()

router.post("/create-bill/", createABill)

router.get("/user-history/", getUserHistory)

router.get(
    "/user-bills/:id", 
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(userExistsById),
        validateFields,
        deleteFileOnError
    ],
    getBillsUser
)

router.get(
    "/get-products-byBill/:id", 
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(billExistById),
        validateFields,
        deleteFileOnError
    ],
    getProductsByBill
)

router.put(
    "/update-bill/:id", 
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(billExistById),
        validateFields,
        deleteFileOnError
    ],
    updateBill
)

export default router