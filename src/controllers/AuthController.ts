import {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import User from "../models/User";
import Token from "../models/Token";
import {createToken} from "../utils/token";
import {AuthEmail} from "../emails/AuthEmail";
import {generateToken} from "../utils/jwt";
import user from "../models/User";

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {
        try {
            const user = new User(req.body);

            const emailExist = await User.findOne({email: user.email});

            if (emailExist) {
                return res.status(409).send('Email already exists');
            }

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(user.password, salt, async function (err, hash) {
                    user.password = hash;
                    const token = new Token();
                    token.token = createToken();
                    token.user = user.id;
                    await AuthEmail.sendConfirmationEmail({
                        email: user.email,
                        token: token.token
                    });
                    await Promise.allSettled([user.save(), token.save()]);
                });
            });

            res.status(201).send("User created successfully");
        } catch (error) {
            res.status(400).send(error);
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const {token} = req.body;

            const tokenExist = await Token.findOne({token});

            if (!tokenExist) {
                const error = new Error('Invalid token');
                return res.status(404).send(error);
            }

            const user = await User.findById(tokenExist.user);

            if (!user) {
                const error = new Error('User not found');
                return res.status(404).send(error);
            }

            user.confirmed = true;
            await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

            res.status(200).send('Account confirmed successfully');

        } catch (error) {

        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const {email, password} = req.body;

            const user = await User.findOne({email});

            if (!user) {
                return res.status(404).send('User not found');
            }

            if (!user.confirmed) {

                const token = new Token();
                token.user = user.id;
                token.token = createToken();
                await token.save();

                await AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    token: token.token
                });

                return res.status(401).send('Account not confirmed, we sent you a new confirmation email');
            }

            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(401).send('Invalid password');
            }

            const token = generateToken({
                id: user.id,
            });

            res.status(200).send({token});
        } catch (error) {
            res.status(400).send(error);
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const {email} = req.body;

            const user = await User.findOne({email});

            if (!user) {
                return res.status(404).send('User not found');
            }

            if (user.confirmed) {
                return res.status(403).send('Account already confirmed');
            }

            const token = new Token();
            token.user = user.id;
            token.token = createToken();


            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                token: token.token
            });

            await Promise.allSettled([user.save(), token.save()]);

            res.status(200).send('Confirmation code sent successfully');
        } catch (error) {
            res.status(400).send(error);
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const {email} = req.body;

            const user = await User.findOne({email});

            if (!user) {
                return res.status(404).send('User not found');
            }

            const token = new Token();
            token.user = user.id;
            token.token = createToken();
            await token.save();

            await AuthEmail.sendPasswordResetToken({
                email: user.email,
                token: token.token
            });

            res.status(200).send('Password reset token sent successfully');
        } catch (error) {
            res.status(400).send(error);
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const {token} = req.body;

            const tokenExist = await Token.findOne({token});

            if (!tokenExist) {
                return res.status(404).send('Invalid token');
            }

            res.status(200).send('Token is valid');

        } catch (error) {

        }
    }

    static resetPassword = async (req: Request, res: Response) => {
        try {
            const {token} = req.params;

            const tokenExist = await Token.findOne({token});

            if (!tokenExist) {
                return res.status(404).send('Invalid token');
            }

            const user = await User.findById(tokenExist.user);

            if (!user) {
                return res.status(404).send('User not found');
            }

            const {password} = req.body;

            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, async function (err, hash) {
                    user.password = hash;
                    await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
                });
            });

            res.status(200).send('Password reset successfully');
        } catch (error) {

        }
    }

    static getUser = async (req: Request, res: Response) => {
        return res.json(req.user);
    }


    static updateProfile = async (req: Request, res: Response) => {
        const {name, email} = req.body;

        const userExist = await User.findOne({email});

        if (userExist && userExist.id.toString() !== req.user.id.toString()) {
            return res.status(409).send({
                error: "Email already exists"
            });
        }

        req.user.name = name;
        req.user.email = email;

        try {
            await req.user.save();
            res.status(200).send("Profile updated successfully");
        } catch (e) {
            res.status(500).send({
                error: e.message
            });
        }

    }

    static changePassword = async (req: Request, res: Response) => {

        const {current_password, password} = req.body;

        const user = await User.findById(req.user.id);

        const isPasswordValid = await bcrypt.compare(current_password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send({
                error: "Invalid password"
            });
        }

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                user.password = hash;
                await user.save();
            });
        });

        try {
            res.status(200).send("Password updated successfully");
        } catch (e) {
            res.status(500).send({
                error: e.message
            });
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body;
        const user = await User.findById(req.user.id);
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).send({
                error: "Invalid password"
            });
        }

        res.status(200).send("Password is valid");
    }

}
