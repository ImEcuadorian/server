import {Router} from "express";
import {AuthController} from "../controllers/AuthController";
import {body, param} from "express-validator";
import {handleInputErros} from "../middleware/validation";
import {authenticate} from "../middleware/auth";


const router = Router();

router.post("/create-account",
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().isEmail().withMessage("Email is not valid"),
    body("password").notEmpty().isLength({min: 8}).withMessage("Password must be at least 6 characters long"),
    body("password_confirmation").notEmpty().custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    }),
    handleInputErros,
    AuthController.createAccount
);

router.post("/confirm-accountt",
    body("toke").notEmpty().withMessage("Token is required"),
    handleInputErros,
    AuthController.confirmAccount
);

router.post("/login",
    body("email").notEmpty().isEmail().withMessage("Email is not valid"),
    body("password").notEmpty().withMessage("Password is required"),
    handleInputErros,
    AuthController.login
);
router.post("/request-code",
    body("email").notEmpty().isEmail().withMessage("Email is not valid"),
    handleInputErros,
    AuthController.requestConfirmationCode
)

router.post("/forgot-password",
    body("email").notEmpty().isEmail().withMessage("Email is not valid"),
    handleInputErros,
    AuthController.forgotPassword
);

router.post("/validate-token",
    body("token").notEmpty().withMessage("Token is required"),
    handleInputErros,
    AuthController.validateToken
);

router.post("/reset-password/:token",
    param("token").isNumeric().notEmpty().withMessage("Token is required"),
    body("password").notEmpty().isLength({min: 8}).withMessage("Password must be at least 6 characters long"),
    body("password_confirmation").notEmpty().custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    }),
    handleInputErros,
    handleInputErros,
    AuthController.resetPassword
);

router.get("/user",
    authenticate,
    AuthController.getUser
);

router.put("/profile",
    authenticate,
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().isEmail().withMessage("Email is not valid"),
    handleInputErros,
    AuthController.updateProfile
);

router.post("/update-password",
    authenticate,
    body("current_password").notEmpty().withMessage("Current password is required"),
    body("password").notEmpty().isLength({min: 8}).withMessage("Password must be at least 6 characters long"),
    body("password_confirmation").notEmpty().custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }
        return true;
    }),
    handleInputErros,
    AuthController.changePassword
);

router.post("/check-password",
    authenticate,
    body("password").notEmpty().withMessage("Password is required"),
    handleInputErros,
    AuthController.checkPassword
);

export default router;
