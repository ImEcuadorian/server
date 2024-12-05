import {Router} from "express";
import {ProjectController} from "../controllers/ProjectController";
import {body, param} from "express-validator";
import {handleInputErros} from "../middleware/validation";
import {TaskController} from "../controllers/TaskController";
import {validateProject} from "../middleware/project";
import {hasAuthorization, taskBeLongToProject, validateTask} from "../middleware/task";
import {authenticate} from "../middleware/auth";
import {TeamController} from "../controllers/TeamController";
import {NoteController} from "../controllers/NoteController";


const router = Router();

router.use(authenticate);

router.post("/",
    body("projectName", "The project's name must not be empty").notEmpty().isString().isLength({min: 3}),
    body("clientName", "The client's name must not be empty").notEmpty().isString().isLength({min: 3}),
    body("description", "The project's description must not be empty").notEmpty().isString().isLength({min: 3}),
    handleInputErros,
    ProjectController.createProject
);

router.get("/",
    ProjectController.getAllProjects);

router.get("/:id",
    param("id", "The project's id must be a valid id").isMongoId(),
    handleInputErros,
    ProjectController.getProjectById
);

router.param("projectId", validateProject);

router.put("/:projectId",
    param("projectId", "The project's id must be a valid id").isMongoId(),
    body("projectName", "The project's name must not be empty").notEmpty().isString().isLength({min: 3}),
    body("clientName", "The client's name must not be empty").notEmpty().isString().isLength({min: 3}),
    body("description", "The project's description must not be empty").notEmpty().isString().isLength({min: 3}),
    handleInputErros,
    hasAuthorization,
    ProjectController.updateProject
);

router.delete("/:projectId",
    param("projectId", "The project's id must be a valid id").isMongoId(),
    handleInputErros,
    hasAuthorization,
    ProjectController.deleteProject
);

router.post("/:projectId/task",
    param("projectId", "The project's id must be a valid id").isMongoId(),
    body("name", "The task's name must not be empty").notEmpty().isString().isLength({min: 3}),
    body("description", "The task's description must not be empty").notEmpty().isString().isLength({min: 3}),
    TaskController.createTask
);

router.get("/:projectId/tasks",
    TaskController.getAllTasksByProjectId
);

router.param("taskId", validateTask);
router.param("taskId", taskBeLongToProject);


router.get("/:projectId/task/:taskId",
    param("projectId", "The task's id must be a valid id").isMongoId(),
    param("taskId", "The task's id must be a valid id").isMongoId(),
    handleInputErros,
    TaskController.getTaskById
);

router.put("/:projectId/task/:taskId",
    hasAuthorization,
    body("name", "The task's name must not be empty").notEmpty().isString().isLength({min: 3}),
    body("description", "The task's description must not be empty").notEmpty().isString().isLength({min: 3}),
    handleInputErros,
    TaskController.updateTask
);

router.delete("/:projectId/task/:taskId",
    hasAuthorization,
    handleInputErros,
    TaskController.deleteTask
);

router.post("/:projectId/task/:taskId/status",
    hasAuthorization,
    body("status", "The state cannot be empty").notEmpty(),
    handleInputErros,
    TaskController.updateTaskStatus
);

router.post("/:projectId/team/find",
    body("email", "The email must be a valid email").isEmail().toLowerCase(),
    handleInputErros,
    TeamController.findMemberByEmail
);

router.post("/:projectId/team",
    body("id", "The member's id must be a valid id").isMongoId(),
    handleInputErros,
    TeamController.addMemberToProject
);

router.delete("/:projectId/team",
    body("id", "The member's id must be a valid id").isMongoId(),
    handleInputErros,
    TeamController.removeMemberToProject
);

router.get("/:projectId/team",
    handleInputErros,
    TeamController.getProjectTeam
);

router.delete("/:projectId/team/:id",
    param("id", "The member's id must be a valid id").isMongoId(),
    handleInputErros,
    TeamController.removeMemberById
);


router.post("/:projectId/task/:taskId/notes",
    body("content", "The content must not be empty").notEmpty().isString().isLength({min: 3}),
    handleInputErros,
    NoteController.createNote
)

router.get("/:projectId/task/:taskId/notes",
    NoteController.getTaskNotes
);

router.delete("/:projectId/task/:taskId/notes/:noteId",
    param("noteId", "The note's id must be a valid id").isMongoId(),
    handleInputErros,
    NoteController.deleteNote
);

export default router;
