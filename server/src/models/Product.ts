import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  code: string;
  nameAr: string;
  nameEn: string;
  description: string;
  unit: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  active: boolean;
}

const productSchema = new Schema<IProduct>({
  code: { type: String, required: true, unique: true },
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  description: { type: String, default: '' },
  unit: { type: String, default: 'قطعة' },
  price: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  minQuantity: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', productSchema);
