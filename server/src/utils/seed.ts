import Account from '../models/Account';

const defaultAccounts = [
  { code: '1', nameAr: 'الأصول', nameEn: 'Assets', type: 'asset', category: 'root' },
  { code: '1.1', nameAr: 'الأصول المتداولة', nameEn: 'Current Assets', type: 'asset', category: 'current_asset' },
  { code: '1.1.1', nameAr: 'النقدية', nameEn: 'Cash', type: 'asset', category: 'cash' },
  { code: '1.1.2', nameAr: 'البنوك', nameEn: 'Banks', type: 'asset', category: 'bank' },
  { code: '1.1.3', nameAr: 'حسابات العملاء', nameEn: 'Accounts Receivable', type: 'asset', category: 'receivable' },
  { code: '1.1.4', nameAr: 'المخزون', nameEn: 'Inventory', type: 'asset', category: 'inventory' },
  { code: '1.2', nameAr: 'الأصول الثابتة', nameEn: 'Fixed Assets', type: 'asset', category: 'fixed_asset' },
  { code: '1.2.1', nameAr: 'الأثاث والمعدات', nameEn: 'Furniture & Equipment', type: 'asset', category: 'fixed_asset' },
  { code: '2', nameAr: 'الخصوم', nameEn: 'Liabilities', type: 'liability', category: 'root' },
  { code: '2.1', nameAr: 'الخصوم المتداولة', nameEn: 'Current Liabilities', type: 'liability', category: 'current_liability' },
  { code: '2.1.1', nameAr: 'حسابات الموردين', nameEn: 'Accounts Payable', type: 'liability', category: 'payable' },
  { code: '2.1.2', nameAr: 'الرواتب المستحقة', nameEn: 'Accrued Salaries', type: 'liability', category: 'accrued' },
  { code: '2.1.3', nameAr: 'الضرائب المستحقة', nameEn: 'Taxes Payable', type: 'liability', category: 'tax' },
  { code: '3', nameAr: 'حقوق الملكية', nameEn: 'Equity', type: 'equity', category: 'root' },
  { code: '3.1', nameAr: 'رأس المال', nameEn: 'Capital', type: 'equity', category: 'capital' },
  { code: '3.2', nameAr: 'الأرباح المحتجزة', nameEn: 'Retained Earnings', type: 'equity', category: 'retained' },
  { code: '4', nameAr: 'الإيرادات', nameEn: 'Income', type: 'income', category: 'root' },
  { code: '4.1', nameAr: 'إيرادات المبيعات', nameEn: 'Sales Revenue', type: 'income', category: 'sales' },
  { code: '4.2', nameAr: 'إيرادات أخرى', nameEn: 'Other Income', type: 'income', category: 'other' },
  { code: '5', nameAr: 'المصروفات', nameEn: 'Expenses', type: 'expense', category: 'root' },
  { code: '5.1', nameAr: 'الرواتب والأجور', nameEn: 'Salaries & Wages', type: 'expense', category: 'salary' },
  { code: '5.2', nameAr: 'الإيجار', nameEn: 'Rent', type: 'expense', category: 'rent' },
  { code: '5.3', nameAr: 'المصروفات العمومية', nameEn: 'General Expenses', type: 'expense', category: 'general' },
  { code: '5.4', nameAr: 'المصروفات الإدارية', nameEn: 'Administrative Expenses', type: 'expense', category: 'admin' },
];

export async function seedAccounts() {
  const count = await Account.countDocuments();
  if (count > 0) return;
  console.log('Seeding default accounts...');
  const created: Record<string, string> = {};
  for (const acc of defaultAccounts) {
    const parts = acc.code.split('.');
    const parentCode = parts.slice(0, -1).join('.');
    const account = await Account.create({
      ...acc,
      parent: parentCode ? created[parentCode] : null,
    });
    created[acc.code] = String(account._id);
  }
  for (const acc of defaultAccounts) {
    const parts = acc.code.split('.');
    const parentCode = parts.slice(0, -1).join('.');
    if (parentCode && created[parentCode]) {
      await Account.findByIdAndUpdate(created[parentCode], { $push: { children: created[acc.code] } });
    }
  }
  console.log('Default accounts seeded successfully');
}
