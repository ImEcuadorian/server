import {transport} from "../config/nodemailer";

interface IEmail {
    email: string;
    token: string;
}

export class AuthEmail {
    static sendConfirmationEmail = async ({email, token}: IEmail) => {
        await transport.sendMail({
            from: "UpTask <admin@uptask.com>",
            to: email,
            subject: "Activate your account",
            html:`
                <div>
                    <h1>Activate your account</h1>
                    <p>Click on the following link to activate your account</p>
                    <a href="${process.env.FRONTED_URL}/auth/confirm-account">Activate account</a>
                    <p>Enter the following code: <b>${token}</b></p>
                    <p>Thanks for choosing us</p>
                </div>
`
        })
    }
    static sendPasswordResetToken = async ({email, token}: IEmail) => {
        await transport.sendMail({
            from: "UpTask <admin@uptask.com>",
            to: email,
            subject: "Reset your password",
            html:`
                <div>
                    <h1>Reset your password</h1>
                    <p>Click on the following link to reset your password</p>
                    <a href="${process.env.FRONTED_URL}/auth/new-password">Reset your password</a>
                    <p>Enter the following code: <b>${token}</b></p>
                    <p>Thanks for choosing us</p>
                </div>
`
        })
    }
}
