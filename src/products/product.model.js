import { Schema, model } from "mongoose";

const ProductSchema = Schema(
    {
        name: {
            type: String,
            unique: [true, "Product already exists"],
            required: [true, "Name is required"],
            maxLength: [25, "Cant be overcome 25 characters"]
        },
        description: {
            type: String,
            maxLength: [350, "Cant be overcome 350 characters"]
        },
        stock:{
            type: Number,
            default: 0
        },
        sold:{
            type: Number,
            default: 0
        },
        price:{
            type: Number,
            required: [true,"Price required"],
            default:0
        },
        categoryRef:{
            type: Schema.Types.ObjectId,
            ref: 'category'
        },
        categoryName: {
            type: String,
            required : [true, "Category name required"]
        },
        state: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

export default model('Product', ProductSchema);