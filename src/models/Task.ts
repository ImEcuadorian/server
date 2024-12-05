import mongoose, {Document, Schema, Types, ObjectId} from 'mongoose';
import Note from "./Note";

const taskStatus = {
    PENDING: "PENDING",
    ON_HOLD: "ON_HOLD",
    IN_PROGRESS: "IN_PROGRESS",
    UNDER_REVIEW: "UNDER_REVIEW",
    COMPLETED: "COMPLETED"
} as const;

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus];

export interface ITask extends Document {
    name: string;
    description: string;
    projectId: ObjectId;
    status: TaskStatus;
    completedBy: {
        user: ObjectId;
        status: TaskStatus;
    }[];
    notes: Types.ObjectId[];
}

export const TaskSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    projectId: {
        type: Types.ObjectId,
        ref: 'Project',
    },
    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
    },
    completedBy: [
        {
            user: {
                type: Types.ObjectId,
                ref: 'User',
                default: null

            },
            status: {
                type: String,
                enum: Object.values(taskStatus),
                default: taskStatus.PENDING
            }
        }],
    notes: [
        {
            type: Types.ObjectId,
            ref: 'Note'
        }
    ]
}, {
    timestamps: true
});

TaskSchema.pre("deleteOne", {
        document: true,
        query: false
    },
    async function (next) {
        const task = this._id;
        if (!task) return;
        await Note.deleteMany({task});
        next();
    }
)

const Task = mongoose.model<ITask>("Task", TaskSchema);

export default Task;
