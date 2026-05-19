import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';
import { Expense } from '../types';

export default function ExpensesPage() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: '', amount: 0, description: '', paidTo: '' });

  const fetchData = async () => {
    try { const res = await API.get('/expenses'); setExpenses(res.data.data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    await API.post('/expenses', form);
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/expenses/${id}`);
    fetchData();
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('expenses.title')}</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">{t('expenses.add')}</button>
      </div>

      {loading ? <p className="text-gray-400">{t('common.loading')}</p> : expenses.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('common.noData')}</div>
      ) : (
        <>
          <div className="card mb-4 bg-blue-50 border-blue-200">
            <p className="text-lg font-bold">{t('common.total')}: {total.toLocaleString()}</p>
          </div>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b">
                  <th className="table-header">{t('expenses.date')}</th>
                  <th className="table-header">{t('expenses.category')}</th>
                  <th className="table-header">{t('expenses.description')}</th>
                  <th className="table-header">{t('expenses.paidTo')}</th>
                  <th className="table-header">{t('expenses.amount')}</th>
                  <th className="table-header">{t('common.actions')}</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {expenses.map((e) => (
                    <tr key={e._id} className="hover:bg-gray-50">
                      <td className="table-cell text-sm text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="table-cell">{e.category}</td>
                      <td className="table-cell text-gray-500">{e.description || '-'}</td>
                      <td className="table-cell text-gray-500">{e.paidTo || '-'}</td>
                      <td className="table-cell font-medium text-red-600">{e.amount.toLocaleString()}</td>
                      <td className="table-cell">
                        <button onClick={() => handleDelete(e._id)} className="text-red-600">{t('common.delete')}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{t('expenses.add')}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t('expenses.date')}</label>
                <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <input className="input" placeholder={t('expenses.category')} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className="input" type="number" placeholder={t('expenses.amount')} value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} />
              <input className="input" placeholder={t('expenses.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input className="input" placeholder={t('expenses.paidTo')} value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} />
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
