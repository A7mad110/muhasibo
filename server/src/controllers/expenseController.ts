import { Response } from 'express';
import Expense from '../models/Expense';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getExpenses = async (_req: AuthRequest, res: Response) => {
  try {
    const expenses = await Expense.find().populate('createdBy', 'name').sort('-date');
    return success(res, expenses);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.create({ ...req.body, createdBy: req.user!._id });
    return success(res, expense, 'Expense created', 201);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return error(res, 'Expense not found', 404);
    return success(res, null, 'Deleted');
  } catch (err: any) {
    return error(res, err.message);
  }
};
