import { Request, Response, NextFunction } from 'express';
import i18next from '../utils/i18n';

export const localeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const lang = req.headers['accept-language']?.startsWith('ar') ? 'ar' : 'en';
  req.lang = lang;
  i18next.changeLanguage(lang);
  next();
};

declare global {
  namespace Express {
    interface Request {
      lang: string;
    }
  }
}
