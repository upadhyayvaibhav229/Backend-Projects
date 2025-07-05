import {Router} from "express"
import { loginUser, logout, registerUser } from "../Controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";


const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', verifyJWT,logout);


export default router
