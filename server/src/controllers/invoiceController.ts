import { Response } from 'express';
import Invoice from '../models/Invoice';
import { success, error } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, page = '1', limit = '50' } = req.query;
    const query: any = {};
    if (type) query.type = type;
    if (status) query.status = status;
    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('customer', 'name')
      .populate('vendor', 'name')
      .populate('createdBy', 'name')
      .sort('-date')
      .skip((+page - 1) * +limit)
      .limit(+limit);
    return success(res, { invoices, pagination: { total, page: +page, limit: +limit, pages: Math.ceil(total / +limit) } });
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, createdBy: req.user!._id };
    const invoice = await Invoice.create(data);
    return success(res, invoice, 'Invoice created', 201);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!invoice) return error(res, 'Invoice not found', 404);
    return success(res, invoice, 'Updated');
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return error(res, 'Invoice not found', 404);
    return success(res, null, 'Deleted');
  } catch (err: any) {
    return error(res, err.message);
  }
};
