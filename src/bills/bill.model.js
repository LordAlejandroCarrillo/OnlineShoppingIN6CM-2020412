import { Schema, model } from "mongoose";

const BillSchema = Schema(
    {
        nameOfUser:{
            type: String,
            required: [true,"Name of user required."]
        },
        surnameOfUser:{
            type: String,
            required: [true,"Surname of user required."]
        },
        emailOfUser:{
            type: String,
            required: [true,"Email of user required."]
        },
        userRef: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: [true, "User required"]
        },
        total:{
            type: Number,
            default: 0
        },
        productList:{
            type: [],
            required: [true,"List of products required"]
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

export default model('Bill', BillSchema);