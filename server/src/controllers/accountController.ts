import { Request, Response } from 'express';
import Account from '../models/Account';
import { success, error } from '../utils/response';

export const getAccounts = async (_req: Request, res: Response) => {
  try {
    const accounts = await Account.find().populate('parent', 'nameAr nameEn code').sort('code');
    return success(res, accounts);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { code, nameAr, nameEn, type, parent } = req.body;
    const exists = await Account.findOne({ code });
    if (exists) return error(res, 'رمز الحساب موجود / Code exists', 400);
    const account = await Account.create({ code, nameAr, nameEn, type, parent });
    if (parent) {
      await Account.findByIdAndUpdate(parent, { $push: { children: account._id } });
    }
    return success(res, account, 'تم إنشاء الحساب / Account created', 201);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!account) return error(res, 'الحساب غير موجود / Account not found', 404);
    return success(res, account, 'تم التحديث / Updated');
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return error(res, 'الحساب غير موجود / Account not found', 404);
    if (account.children.length > 0) return error(res, 'لا يمكن حذف حساب له أبناء / Has children', 400);
    if (account.parent) {
      await Account.findByIdAndUpdate(account.parent, { $pull: { children: account._id } });
    }
    await Account.findByIdAndDelete(req.params.id);
    return success(res, null, 'تم الحذف / Deleted');
  } catch (err: any) {
    return error(res, err.message);
  }
};
