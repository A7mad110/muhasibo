import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  date: Date;
  category: string;
  amount: number;
  description: string;
  paidTo: string;
  receipt: string;
  createdBy: mongoose.Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>({
  date: { type: Date, required: true, default: Date.now },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  paidTo: { type: String, default: '' },
  receipt: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', expenseSchema);
