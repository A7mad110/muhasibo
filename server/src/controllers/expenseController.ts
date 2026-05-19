import { Response } from 'express';
import Expense from '../models/Expense';
import JournalEntry from '../models/JournalEntry';
import Account from '../models/Account';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getExpenses = async (_req: AuthRequest, res: Response) => {
  try {
    const expenses = await Expense.find()
      .populate('createdBy', 'name')
      .populate('account', 'code nameAr nameEn')
      .populate('paymentAccount', 'code nameAr nameEn')
      .sort('-date');
    return success(res, expenses);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { date, category, amount, description, paidTo, account, paymentAccount } = req.body;
    if (!account || !paymentAccount) {
      return error(res, 'يجب اختيار حساب المصروف وحساب الدفع / Select expense and payment accounts', 400);
    }
    const dateObj = new Date(date);
    const expenseDesc = description || category;
    const ref = `EXP-${Date.now()}`;
    const lines = [
      { account, debit: amount, credit: 0, description: expenseDesc },
      { account: paymentAccount, debit: 0, credit: amount, description: expenseDesc },
    ];
    const entry = await JournalEntry.create({
      date: dateObj, reference: ref, description: `مصروف: ${expenseDesc} / Expense: ${expenseDesc}`,
      lines, totalDebit: amount, totalCredit: amount, createdBy: req.user!._id,
    });
    for (const line of lines) {
      if (line.debit > 0) await Account.findByIdAndUpdate(line.account, { $inc: { balance: line.debit } });
      if (line.credit > 0) await Account.findByIdAndUpdate(line.account, { $inc: { balance: -line.credit } });
    }
    const expense = await Expense.create({
      date: dateObj, category, amount, description, paidTo,
      account, paymentAccount, entryId: entry._id, createdBy: req.user!._id,
    });
    return success(res, expense, 'تم إضافة المصروف / Expense created', 201);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return error(res, 'Expense not found', 404);
    if (expense.entryId) {
      const entry = await JournalEntry.findById(expense.entryId);
      if (entry) {
        for (const line of entry.lines) {
          if (line.debit > 0) await Account.findByIdAndUpdate(line.account, { $inc: { balance: -line.debit } });
          if (line.credit > 0) await Account.findByIdAndUpdate(line.account, { $inc: { balance: line.credit } });
        }
        await JournalEntry.findByIdAndDelete(expense.entryId);
      }
    }
    await Expense.findByIdAndDelete(req.params.id);
    return success(res, null, 'تم الحذف / Deleted');
  } catch (err: any) {
    return error(res, err.message);
  }
};
