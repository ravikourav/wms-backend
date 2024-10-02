import express from 'express';
import { adminLogin, getAllUsers, assignBadge } from '../controller/adminController.js';
import validateToken from '../middleware/tokenValidationHandler.js';

const router = express.Router();

router.post('/login', adminLogin);

router.use(validateToken('admin'));
router.get('/allUsers' , getAllUsers);
router.put('/assignBadge/:userId', assignBadge);

export default router;