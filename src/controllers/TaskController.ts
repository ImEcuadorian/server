import {Request, Response} from 'express';
import Task from "../models/Task";

export class TaskController {

    static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body);
            task.projectId = req.project.id;
            req.project.tasks.push(task.id);
            await Promise.allSettled([task.save(), req.project.save()]);
            return res.status(201).json({task});
        } catch (e) {
            return res.status(400).json({message: e.message});
        }

    }

    static getAllTasksByProjectId = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({projectId: req.project.id}).populate("projectId");
            return res.status(200).json({tasks});
        } catch (e) {
            return res.status(400).json({message: e.message});
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {

            const task = await Task.findById(req.task.id).populate({
                path: "completedBy.user",
                select: "-password"
            }).populate({
                path: "notes",
                populate: {
                    path: "createdBy",
                    select: "-password"
                }
            })

            return res.send(task);
        } catch (e) {
            return res.status(400).json({message: e.message});
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name;
            req.task.description = req.body.description;
            await req.task.save();
            return res.status(200).json({
                task: req.task
            });
        } catch (e) {
            return res.status(400).json({message: e.message});
        }
    }

    static deleteTask = async (req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter((taskId) => taskId.toString() !== req.task.id);
            await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
            return res.status(200).json({message: "Task deleted successfully"});
        } catch (e) {
            return res.status(400).json({
                message: e.message
            });
        }
    }

    static updateTaskStatus = async (req: Request, res: Response) => {
        try {

            const data = {
                user: req.user.id,
                status: req.body.status
            }

            req.task.completedBy.push(data);

            await req.task.save();
            return res.send(req.task);
        } catch (e) {
            return res.status(400).json({message: e.message});
        }
    }
}
