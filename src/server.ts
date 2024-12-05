import express from 'express';
import dotenv from 'dotenv';
import {connectDb} from "./config/db";
import projectRoutes from "./routes/project-routes";
import cors from 'cors';
import {corsOptions} from "./config/cors";
import morgan from "morgan";
import authRoutes from "./routes/auth-routes";

dotenv.config();

connectDb();

const app = express();

app.use(cors(corsOptions));

app.use(morgan("dev"))

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
export default app;
