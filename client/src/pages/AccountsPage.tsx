import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';
import { Account } from '../types';

const accountTypes = ['asset', 'liability', 'equity', 'income', 'expense'];

export default function AccountsPage() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [form, setForm] = useState({ code: '', nameAr: '', nameEn: '', type: 'asset', parent: '' });
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const res = await API.get('/accounts');
      setAccounts(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const openAdd = () => {
    setEditAccount(null);
    setForm({ code: '', nameAr: '', nameEn: '', type: 'asset', parent: '' });
    setShowModal(true);
  };

  const openEdit = (acc: Account) => {
    setEditAccount(acc);
    setForm({ code: acc.code, nameAr: acc.nameAr, nameEn: acc.nameEn, type: acc.type, parent: acc.parent?._id || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editAccount) {
      await API.put(`/accounts/${editAccount._id}`, form);
    } else {
      await API.post('/accounts', form);
    }
    setShowModal(false);
    fetchAccounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('accounts.deleteConfirm'))) return;
    await API.delete(`/accounts/${id}`);
    fetchAccounts();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = { asset: 'text-blue-600', liability: 'text-orange-600', equity: 'text-green-600', income: 'text-purple-600', expense: 'text-red-600' };
    return colors[type] || '';
  };

  const rootAccounts = accounts.filter(a => !a.parent);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('accounts.title')}</h1>
        <button onClick={openAdd} className="btn-primary">{t('accounts.add')}</button>
      </div>

      {loading ? <p className="text-gray-400">{t('common.loading')}</p> : accounts.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('common.noData')}</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="table-header">{t('accounts.code')}</th>
                  <th className="table-header">{t('accounts.nameAr')}</th>
                  <th className="table-header">{t('accounts.nameEn')}</th>
                  <th className="table-header">{t('accounts.type')}</th>
                  <th className="table-header">{t('accounts.parent')}</th>
                  <th className="table-header">{t('accounts.balance')}</th>
                  <th className="table-header">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rootAccounts.map((acc) => (
                  <AccountRow key={acc._id} account={acc} accounts={accounts} onEdit={openEdit} onDelete={handleDelete} getTypeColor={getTypeColor} t={t} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editAccount ? t('accounts.edit') : t('accounts.add')}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('accounts.code')}</label>
                  <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('accounts.type')}</label>
                  <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {accountTypes.map((type) => <option key={type} value={type}>{t(`accounts.${type}`)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('accounts.nameAr')}</label>
                <input className="input" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('accounts.nameEn')}</label>
                <input className="input" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('accounts.parent')}</label>
                <select className="input" value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })}>
                  <option value="">--</option>
                  {accounts.map((a) => <option key={a._id} value={a._id}>{a.code} - {a.nameAr}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="btn-secondary">{t('common.cancel')}</button>
              <button onClick={handleSave} className="btn-primary">{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountRow({ account, accounts, onEdit, onDelete, getTypeColor, t }: any) {
  const children = accounts.filter((a: Account) => a.parent?._id === account._id);
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="table-cell font-mono text-xs">{account.code}</td>
        <td className="table-cell font-medium">{account.nameAr}</td>
        <td className="table-cell text-gray-600">{account.nameEn}</td>
        <td className={`table-cell ${getTypeColor(account.type)}`}>{t(`accounts.${account.type}`)}</td>
        <td className="table-cell text-gray-500">{account.parent?.nameAr || '-'}</td>
        <td className="table-cell font-medium">{account.balance.toLocaleString()}</td>
        <td className="table-cell">
          <button onClick={() => onEdit(account)} className="text-blue-600 hover:text-blue-800 mr-2">{t('common.edit')}</button>
          <button onClick={() => onDelete(account._id)} className="text-red-600 hover:text-red-800">{t('common.delete')}</button>
        </td>
      </tr>
      {children.map((child: Account) => (
        <AccountRow key={child._id} account={child} accounts={accounts} onEdit={onEdit} onDelete={onDelete} getTypeColor={getTypeColor} t={t} />
      ))}
    </>
  );
}
