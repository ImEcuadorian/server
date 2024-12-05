import {Request, Response, NextFunction} from 'express';
import Project, {ProjectType} from "../models/Project";

declare global {
    namespace Express {
        interface Request {
            project: ProjectType
        }
    }
}
export const validateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {projectId} = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({message: "Project not found"});
        }
        req.project = project;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).send({error: err.message});
    }
}
