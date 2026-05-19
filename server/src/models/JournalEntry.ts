import mongoose, { Schema, Document } from 'mongoose';

export interface ILineItem {
  account: mongoose.Types.ObjectId;
  debit: number;
  credit: number;
  description: string;
}

export interface IJournalEntry extends Document {
  date: Date;
  reference: string;
  description: string;
  lines: ILineItem[];
  totalDebit: number;
  totalCredit: number;
  createdBy: mongoose.Types.ObjectId;
  approved: boolean;
}

const journalEntrySchema = new Schema<IJournalEntry>({
  date: { type: Date, required: true, default: Date.now },
  reference: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  lines: [{
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    description: { type: String, default: '' },
  }],
  totalDebit: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IJournalEntry>('JournalEntry', journalEntrySchema);
