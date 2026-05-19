import { Request, Response } from 'express';
import Customer from '../models/Customer';
import { success, error } from '../utils/response';

export const getCustomers = async (_req: Request, res: Response) => {
  try {
    const customers = await Customer.find().sort('-createdAt');
    return success(res, customers);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.create(req.body);
    return success(res, customer, 'Customer created', 201);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return error(res, 'Customer not found', 404);
    return success(res, customer, 'Updated');
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return error(res, 'Customer not found', 404);
    return success(res, null, 'Deleted');
  } catch (err: any) {
    return error(res, err.message);
  }
};
