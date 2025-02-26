import { Router } from "express"
import { check } from "express-validator"
import {validateFields} from "../middlewares/validate-fields.js"
import { deleteFileOnError } from "../middlewares/delete-file-on-error.js"
import { addProduct, getProducts, getByIdProduct, updateProduct, deleteProduct } from "./product.controller.js"
import { productExistById } from '../helpers/db-validator.js'

const router = Router()

router.get("/get-products/", getProducts)

router.post(
    "/add-products/",
    [
        validateFields,
        deleteFileOnError
    ],
    addProduct
)

router.get(
    "/get-product/:id",
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(productExistById),
        validateFields,
        deleteFileOnError
    ],
    getByIdProduct
)


router.put(
    "/update-product/:id",
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(productExistById),
        validateFields,
        deleteFileOnError
    ],
    updateProduct
)

router.delete(
    "/delete-product/:id",
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(productExistById),
        validateFields,
        deleteFileOnError
    ],
    deleteProduct
)

export default router