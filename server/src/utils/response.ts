import { Response } from 'express';

export const success = (res: Response, data: any, message = 'Success', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

export const error = (res: Response, message = 'Error', status = 500, errors?: any) => {
  return res.status(status).json({ success: false, message, errors });
};

export const paginated = (res: Response, data: any[], total: number, page: number, limit: number) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};
