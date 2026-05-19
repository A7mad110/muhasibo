import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const createToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: 7 * 24 * 60 * 60 });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return error(res, 'البريد الإلكتروني موجود بالفعل / Email already exists', 400);
    const user = await User.create({ name, email, password, role: role || 'accountant' });
    const token = createToken(String(user._id));
    return success(res, { token, user }, 'تم التسجيل / Registered successfully', 201);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, active: true });
    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'بيانات الدخول غير صحيحة / Invalid credentials', 401);
    }
    const token = createToken(String(user._id));
    return success(res, { token, user }, 'تم الدخول / Login successful');
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  return success(res, req.user);
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort('-createdAt');
    return success(res, users);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role, lang, active } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, lang, active },
      { new: true, runValidators: true }
    );
    if (!user) return error(res, 'المستخدم غير موجود / User not found', 404);
    return success(res, user, 'تم التحديث / Updated');
  } catch (err: any) {
    return error(res, err.message);
  }
};
