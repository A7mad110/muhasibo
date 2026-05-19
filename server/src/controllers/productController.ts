import { Request, Response } from 'express';
import Product from '../models/Product';
import { success, error } from '../utils/response';

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort('-createdAt');
    return success(res, products);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    return success(res, product, 'Product created', 201);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return error(res, 'Product not found', 404);
    return success(res, product, 'Updated');
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return error(res, 'Product not found', 404);
    return success(res, null, 'Deleted');
  } catch (err: any) {
    return error(res, err.message);
  }
};
