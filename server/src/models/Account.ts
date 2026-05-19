import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  code: string;
  nameAr: string;
  nameEn: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  category: string;
  parent: mongoose.Types.ObjectId | null;
  children: mongoose.Types.ObjectId[];
  balance: number;
  active: boolean;
}

const accountSchema = new Schema<IAccount>({
  code: { type: String, required: true, unique: true },
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  type: { type: String, enum: ['asset', 'liability', 'equity', 'income', 'expense'], required: true },
  category: { type: String, default: '' },
  parent: { type: Schema.Types.ObjectId, ref: 'Account', default: null },
  children: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
  balance: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IAccount>('Account', accountSchema);
