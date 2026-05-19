export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'accountant' | 'viewer';
  lang: 'ar' | 'en';
  active: boolean;
}

export interface Account {
  _id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  category: string;
  parent: { _id: string; nameAr: string; nameEn: string; code: string } | null;
  children: string[];
  balance: number;
  active: boolean;
}

export interface JournalEntry {
  _id: string;
  date: string;
  reference: string;
  description: string;
  lines: LineItem[];
  totalDebit: number;
  totalCredit: number;
  createdBy: { _id: string; name: string };
  approved: boolean;
}

export interface LineItem {
  account: { _id: string; code: string; nameAr: string; nameEn: string };
  debit: number;
  credit: number;
  description: string;
}

export interface Invoice {
  _id: string;
  number: string;
  type: 'sales' | 'purchase';
  date: string;
  dueDate: string;
  customer?: { _id: string; name: string };
  vendor?: { _id: string; name: string };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paid: number;
  status: 'draft' | 'confirmed' | 'paid' | 'cancelled';
  notes: string;
}

export interface InvoiceItem {
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  balance: number;
  active: boolean;
}

export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  balance: number;
  active: boolean;
}

export interface Product {
  _id: string;
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

export interface Expense {
  _id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  paidTo: string;
  receipt: string;
  createdBy: { _id: string; name: string };
}
