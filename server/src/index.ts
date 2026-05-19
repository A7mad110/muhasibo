import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { localeMiddleware } from './middleware/locale';
import { seedAccounts } from './utils/seed';
import authRoutes from './routes/auth';
import accountRoutes from './routes/accounts';
import journalRoutes from './routes/journal';
import reportRoutes from './routes/reports';
import invoiceRoutes from './routes/invoices';
import customerRoutes from './routes/customers';
import vendorRoutes from './routes/vendors';
import productRoutes from './routes/products';
import expenseRoutes from './routes/expenses';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(localeMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Muhasibo API is running' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('MongoDB connected');
    await seedAccounts();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB error:', err));

export default app;
