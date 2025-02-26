import { Router } from "express"
import { check } from "express-validator"
import {validateFields} from "../middlewares/validate-fields.js"
import { deleteFileOnError } from "../middlewares/delete-file-on-error.js"
import { addCategory, editCategory, deleteCategory, getCategories } from "./category.controller.js"
import { userExistsById, categoryExistById } from '../helpers/db-validator.js'

const router = Router()

router.get("/get-categories/", getCategories)

router.post(
    "/add-category/",
    [
        validateFields,
        deleteFileOnError
    ],
    addCategory
)

router.put(
    "/update-category/:id",
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(categoryExistById),
        validateFields,
        deleteFileOnError
    ],
    editCategory
)

router.delete(
    "/delete-category/:id",
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(categoryExistById),
        validateFields,
        deleteFileOnError
    ],
    deleteCategory
)

export default router