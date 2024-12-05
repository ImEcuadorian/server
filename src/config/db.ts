import * as mongoose from "mongoose";
import colors from "colors";

export const connectDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI)
        console.log(colors.green(`MongoDB connected: ${connection.connection.host}`));
    }catch (error) {
        console.log(error);
        process.exit(1);
    }
}
