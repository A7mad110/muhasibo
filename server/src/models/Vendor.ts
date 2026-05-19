import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  balance: number;
  active: boolean;
}

const vendorSchema = new Schema<IVendor>({
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  taxId: { type: String, default: '' },
  balance: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IVendor>('Vendor', vendorSchema);
