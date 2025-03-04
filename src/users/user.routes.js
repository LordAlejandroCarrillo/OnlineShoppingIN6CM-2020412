import { Router } from "express"
import { check } from "express-validator"
import { getUsers, updateUser, updateRoleUser, deleteUser, addProductToUser } from "./user.controller.js"
import { validateFields } from "../middlewares/validate-fields.js"
import { deleteFileOnError } from "../middlewares/delete-file-on-error.js"
import { userExistsById, productExistById } from "../helpers/db-validator.js"

const router = Router()

router.get("/", getUsers)

router.put(
    "/update-user/:id",
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(userExistsById),
        validateFields,
        deleteFileOnError
    ],
    updateUser
)

router.put(
    "/update-role/:id",
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(userExistsById),
        validateFields,
        deleteFileOnError
    ],
    updateRoleUser
)

router.put(
    "/update-shoppingCart/:id",
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(productExistById),
        validateFields,
        deleteFileOnError
    ],
    addProductToUser
)

router.delete(
    "/delete-user/:id",
    [
        check("id", "Is not a valid ID").isMongoId(),
        check("id").custom(userExistsById),
        validateFields,
        deleteFileOnError
    ],
    deleteUser
)

export default router