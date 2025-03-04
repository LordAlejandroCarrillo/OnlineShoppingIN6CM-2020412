import { Schema, model } from "mongoose";

const UserSchema = Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            maxLength: [25, "Cant be overcome 25 characters"]
        },
        surname: {
            type: String,
            required: [true, "Surname is required"],
            maxLength: [25, "Cant be overcome 25 characters"]
        },
        username: {
            type: String,
            unique: [true, "Username already exists"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email already exists"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: 8
        },
        state: {
            type: Boolean,
            default: true,
        },
        shoppingCart: {
            type: []

        },
        role: {
            type: String,
            default: "USER_ROLE"
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

UserSchema.methods.toJSON = function () {
    const { __v, password, _id, ...user } = this.toObject();
    user.uid = _id;
    return user;
}

export default model('User', UserSchema);