import { Response } from 'express';
import JournalEntry from '../models/JournalEntry';
import Account from '../models/Account';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getEntries = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', from, to } = req.query;
    const query: any = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from as string);
      if (to) query.date.$lte = new Date(to as string);
    }
    const total = await JournalEntry.countDocuments(query);
    const entries = await JournalEntry.find(query)
      .populate('lines.account', 'code nameAr nameEn')
      .populate('createdBy', 'name')
      .sort('-date')
      .skip((+page - 1) * +limit)
      .limit(+limit);
    return success(res, {
      entries,
      pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) }
    });
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { date, reference, description, lines } = req.body;
    const totalDebit = lines.reduce((s: number, l: any) => s + (l.debit || 0), 0);
    const totalCredit = lines.reduce((s: number, l: any) => s + (l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return error(res, 'يجب أن يتساوى المدين والدائن / Debits must equal credits', 400);
    }
    const entry = await JournalEntry.create({
      date, reference, description, lines, totalDebit, totalCredit,
      createdBy: req.user!._id,
    });
    for (const line of lines) {
      if (line.debit > 0) {
        await Account.findByIdAndUpdate(line.account, { $inc: { balance: line.debit } });
      }
      if (line.credit > 0) {
        await Account.findByIdAndUpdate(line.account, { $inc: { balance: -line.credit } });
      }
    }
    return success(res, entry, 'تم إنشاء القيد / Entry created', 201);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const deleteEntry = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) return error(res, 'القيد غير موجود / Entry not found', 404);
    for (const line of entry.lines) {
      if (line.debit > 0) {
        await Account.findByIdAndUpdate(line.account, { $inc: { balance: -line.debit } });
      }
      if (line.credit > 0) {
        await Account.findByIdAndUpdate(line.account, { $inc: { balance: line.credit } });
      }
    }
    await JournalEntry.findByIdAndDelete(req.params.id);
    return success(res, null, 'تم الحذف / Deleted');
  } catch (err: any) {
    return error(res, err.message);
  }
};
