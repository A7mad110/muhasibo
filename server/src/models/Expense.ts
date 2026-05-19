import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  date: Date;
  category: string;
  amount: number;
  description: string;
  paidTo: string;
  receipt: string;
  account: mongoose.Types.ObjectId;
  paymentAccount: mongoose.Types.ObjectId;
  entryId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const expenseSchema = new Schema<IExpense>({
  date: { type: Date, required: true, default: Date.now },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: '' },
  paidTo: { type: String, default: '' },
  receipt: { type: String, default: '' },
  account: { type: Schema.Types.ObjectId, ref: 'Account' },
  paymentAccount: { type: Schema.Types.ObjectId, ref: 'Account' },
  entryId: { type: Schema.Types.ObjectId, ref: 'JournalEntry' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IExpense>('Expense', expenseSchema);
