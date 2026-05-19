import { Request, Response } from 'express';
import Account from '../models/Account';
import JournalEntry from '../models/JournalEntry';
import { success, error } from '../utils/response';

export const trialBalance = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const query: any = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from as string);
      if (to) query.date.$lte = new Date(to as string);
    }
    const entries = await JournalEntry.find(query).populate('lines.account', 'code nameAr nameEn type');
    const balances: Record<string, { code: string; nameAr: string; nameEn: string; type: string; debit: number; credit: number }> = {};
    for (const entry of entries) {
      for (const line of entry.lines) {
        const acc = line.account as any;
        const key = acc._id.toString();
        if (!balances[key]) {
          balances[key] = { code: acc.code, nameAr: acc.nameAr, nameEn: acc.nameEn, type: acc.type, debit: 0, credit: 0 };
        }
        balances[key].debit += line.debit;
        balances[key].credit += line.credit;
      }
    }
    const report = Object.values(balances).map(b => ({
      ...b,
      balance: b.debit - b.credit,
    })).filter(b => Math.abs(b.balance) > 0.01 || b.debit > 0 || b.credit > 0);
    const totals = report.reduce((s, r) => ({ debit: s.debit + r.debit, credit: s.credit + r.credit }), { debit: 0, credit: 0 });
    return success(res, { report, totals });
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const incomeStatement = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const query: any = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from as string);
      if (to) query.date.$lte = new Date(to as string);
    }
    const entries = await JournalEntry.find(query).populate('lines.account', 'code nameAr nameEn type');
    const totals: Record<string, number> = {};
    for (const entry of entries) {
      for (const line of entry.lines) {
        const acc = line.account as any;
        if (acc.type === 'income' || acc.type === 'expense') {
          const key = acc._id.toString();
          totals[key] = (totals[key] || 0) + (line.credit - line.debit);
        }
      }
    }
    const incomeAccounts = await Account.find({ type: 'income', active: true });
    const expenseAccounts = await Account.find({ type: 'expense', active: true });
    const revenues = incomeAccounts.map(a => ({
      code: a.code, nameAr: a.nameAr, nameEn: a.nameEn,
      amount: totals[a._id.toString()] || 0,
    })).filter(r => Math.abs(r.amount) > 0.01);
    const expenses = expenseAccounts.map(a => ({
      code: a.code, nameAr: a.nameAr, nameEn: a.nameEn,
      amount: Math.abs(totals[a._id.toString()] || 0),
    })).filter(e => e.amount > 0.01);
    const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    return success(res, { revenues, expenses, totalRevenue, totalExpenses, netIncome });
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const balanceSheet = async (_req: Request, res: Response) => {
  try {
    const accounts = await Account.find({ active: true }).sort('code');
    const assets: any[] = [];
    const liabilities: any[] = [];
    const equity: any[] = [];
    for (const acc of accounts) {
      const item = { code: acc.code, nameAr: acc.nameAr, nameEn: acc.nameEn, balance: acc.balance };
      if (acc.type === 'asset') assets.push(item);
      else if (acc.type === 'liability') liabilities.push(item);
      else if (acc.type === 'equity') equity.push(item);
    }
    const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
    const totalEquity = equity.reduce((s, e) => s + e.balance, 0);
    return success(res, { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity });
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const ledger = async (req: Request, res: Response) => {
  try {
    const { accountId, from, to } = req.query;
    const query: any = { 'lines.account': accountId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from as string);
      if (to) query.date.$lte = new Date(to as string);
    }
    const account = await Account.findById(accountId);
    if (!account) return error(res, 'الحساب غير موجود / Account not found', 404);
    const entries = await JournalEntry.find(query)
      .populate('lines.account', 'code nameAr nameEn')
      .sort('date');
    const movements = entries.map(e => {
      const line = e.lines.find((l: any) => l.account?._id?.toString() === accountId);
      return {
        date: e.date, reference: e.reference, description: e.description,
        debit: line?.debit || 0, credit: line?.credit || 0,
      };
    });
    return success(res, { account, movements });
  } catch (err: any) {
    return error(res, err.message);
  }
};
