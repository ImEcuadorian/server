import jwt from 'jsonwebtoken';
import {Types} from "mongoose";
import User from "../models/User";

type UserPayload = {
    id: Types.ObjectId;
}

export const generateToken = (payload: UserPayload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });
    return token;
}

export const verifyToken = async (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET) as UserPayload;
}
