import { Request, Response } from 'express';
import Vendor from '../models/Vendor';
import { success, error } from '../utils/response';

export const getVendors = async (_req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find().sort('-createdAt');
    return success(res, vendors);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.create(req.body);
    return success(res, vendor, 'Vendor created', 201);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) return error(res, 'Vendor not found', 404);
    return success(res, vendor, 'Updated');
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return error(res, 'Vendor not found', 404);
    return success(res, null, 'Deleted');
  } catch (err: any) {
    return error(res, err.message);
  }
};
