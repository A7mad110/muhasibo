import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoiceItem {
  product: mongoose.Types.ObjectId;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  number: string;
  type: 'sales' | 'purchase';
  date: Date;
  dueDate: Date;
  customer?: mongoose.Types.ObjectId;
  vendor?: mongoose.Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  status: 'draft' | 'confirmed' | 'paid' | 'cancelled';
  notes: string;
  createdBy: mongoose.Types.ObjectId;
}

const invoiceSchema = new Schema<IInvoice>({
  number: { type: String, required: true, unique: true },
  type: { type: String, enum: ['sales', 'purchase'], required: true },
  date: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
  vendor: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  }],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'confirmed', 'paid', 'cancelled'], default: 'draft' },
  notes: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);
