import { model, Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken';
const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        Token: {
            type: String
        }

    }
)

userSchema.pre("save", async (next) => {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async (password) => {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            _id: this.id,
        },
        process.env.SECRET_TOKEN,
        {
            expiresIn: process.env.TOKEN_EXPIRY

        }
    )
}
export const User = model("User", userSchema);