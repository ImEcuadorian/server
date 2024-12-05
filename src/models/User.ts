import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    confirmed: boolean;
}

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
