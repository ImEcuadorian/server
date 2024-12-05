import {Request, Response} from 'express';
import Note, {INote} from "../models/Note";
import {ObjectId} from "mongoose";

type NoteParams = {
    noteId: ObjectId;
}

export class NoteController {

    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
        const {content} = req.body;
        const note = new Note();
        note.content = content;
        note.createBy = req.user.id;
        note.taskId = req.task.id;

        req.task.notes.push(note.id);

        try {
            await Promise.allSettled([note.save(), req.task.save()]);
            return res.status(201).json("Note created successfully");
        } catch (e) {
            return res.status(500).json({error: e.message});
        }

    }

    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({taskId: req.task.id});
            res.status(200).json(notes);
        } catch (error) {
            return res.status(500).json({
                error: error.message
            });
        }
    }

    static deleteNote = async (req: Request<NoteParams>, res: Response) => {
        try {
            const note = await Note.findById(req.params.noteId);
            if (!note) {
                return res.status(404).json({error: "Note not found"});
            }

            if (note.createBy.id !== req.user.id) {
                return res.status(403).json({error: "You are not allowed to delete this note"});
            }

            req.task.notes = req.task.notes.filter((noteId) => noteId.toString() !== note.id.toString());

            await Promise.allSettled([req.task.save(), note.deleteOne()]);
            return res.status(200).json("Note deleted successfully");
        } catch (e) {
            return res.status(500).json({error: e.message});
        }
    }
}
