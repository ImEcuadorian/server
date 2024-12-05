import {Document, model, Schema, Types} from "mongoose";


export interface INote extends Document {
    content: string;
    createBy: Types.ObjectId;
    taskId: Types.ObjectId;
}

const NoteSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    createBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    taskId: {
        type: Types.ObjectId,
        ref: 'Task',
        required: true
    }
},{
    timestamps: true
})

const Note = model<INote>('Note', NoteSchema);
export default Note;
