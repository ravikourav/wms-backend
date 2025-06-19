import express from "express";
import validateToken from '../middleware/tokenValidationHandler.js';
import { makeReport } from "../controller/report.Controller.js";

const router = express.Router();

router.use(validateToken(['user' , 'admin']));
router.post('/create', makeReport);

export default router;