import {Request, Response} from 'express';
import User from "../models/User";
import Project from "../models/Project";

export class TeamController {
    static findMemberByEmail = async (res: Response, req: Request) => {
        const {email} = req.body;

        const user = await User.findOne({email}).select("-password");

        if (!user) {
            return res.status(404).send({
                error: "User not found"
            });
        }

    }
    static addMemberToProject = async (res: Response, req: Request) => {
        const {id} = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send({
                error: "User not found"
            });
        }

        req.project.team.push(user.id);

        if (req.project.team.some((userId) => userId.toString() === user.id.toString())) {
            return res.status(409).send({
                error: "User already in project"
            });
        }

        await req.project.save();

        res.status(201).send("User added to project");
    }

    static removeMemberToProject = async (res: Response, req: Request) => {
        const {id} = req.body;

        if(!req.project.team.some(teamMember => teamMember.toString() === id.toString())) {
            return res.status(404).send({
                error: "User not found in project"
            });
        }

        req.project.team = req.project.team.filter((userId) => userId.toString() !== id);

        await req.project.save();

        res.status(200).send("User removed from project");
    }

    static getProjectTeam = async (res: Response, req: Request) => {
        const team = await Project.findById(req.project.id.toString()).populate({
            path: "team",
            select: "-password"
        });

        res.send(team);
    }

    static removeMemberById = async (res: Response, req: Request) => {
        const {userId} = req.params

        if(!req.project.team.some(teamMember => teamMember.toString() === userId.toString())) {
            return res.status(404).send({
                error: "User not found in project"
            });
        }

        req.project.team = req.project.team.filter((team) => team.toString() !== userId);

        await req.project.save();

        res.status(200).send("User removed from project");
    }
}
