import mongoose, {Document, Schema, Types} from "mongoose";

export interface IToken extends Document {
    token: string;
    user: Types.ObjectId;
    createdAt: Date;
}

const TokenSchema: Schema = new Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: Types.ObjectId,
        required: true,
        ref: 'User'
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: "3m"
    }
});

const Token = mongoose.model<IToken>("Token", TokenSchema);
export default Token;
