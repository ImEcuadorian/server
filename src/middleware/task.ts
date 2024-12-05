import Task, {ITask} from "../models/Task";
import {Request, Response, NextFunction} from 'express';

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export const validateTask = async (req: Request, res: Response, next: NextFunction, id: string) => {
    try {
        const {taskId} = req.params;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({message: "Task not found"});
        }
        req.task = task;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
}

export const taskBeLongToProject = async (req: Request, res: Response, next: NextFunction) => {
    if (req.task.projectId.toString() !== req.project.id.toString()) {
        return res.status(404).json({message: "Task not found"});
    }
    next();
}

export const hasAuthorization = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        return res.status(404).json({message: "You are not authorized to view this project"});
    }
    next();
}
