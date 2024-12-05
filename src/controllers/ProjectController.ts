import {Request, Response} from 'express';
import Project from "../models/Project";

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {

        const project = new Project(req.body);

        project.manager = req.user.id;

        try {
            await project.save();
            res.status(201).send(project);
        } catch (error) {
            res.status(400).send(error);
        }

    }
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    {manager: {$in: req.user.id}},
                    {team: {$in: req.user.id}}
                ]
            });
            res.status(200).send(projects);
        } catch (error) {
            res.status(500).send
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        const _id = req.params.id;
        try {
            const project = await Project.findById(_id).populate("tasks");
            if (!project) {
                return res.status(404).json({message: "Project not found"});
            }

            if (project.manager.toString() !== req.user.id && !project.team.includes(req.user.id)) {
                return res.status(403).json({message: "You are not authorized to view this project"});
            }

            res.send(project);
        } catch (error) {
            res.status(500).send();
        }
    }

    static updateProject = async (req: Request, res: Response) => {

        try {

            req.project.projectName = req.body.projectName;
            req.project.clientName = req.body.clientName;
            req.project.description = req.body.description;

            await req.project.save();
            res.send(req.project);
        } catch (error) {
            res.status(400).send(error);
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        try {
            await req.project.deleteOne();
            res.send(req.project);
        } catch (error) {
            res.status(500).send();
        }
    }
}
