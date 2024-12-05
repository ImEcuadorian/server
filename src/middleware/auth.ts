import { Request, Response, NextFunction } from 'express';
import {verifyToken} from "../utils/jwt";
import User, {IUser} from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    const bearer = req.headers.authorization;
    if (!bearer) {
        return res.status(401).send('Unauthorized');
    }

    const token = bearer.split(' ')[1];
    try {
        const decoded = await verifyToken(token);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).send('Unauthorized');
    }
}
