import { Router } from 'express';
import { register, login, getMe, getUsers, updateUser } from '../controllers/authController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);

export default router;
