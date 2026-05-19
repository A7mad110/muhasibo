import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';
import { JournalEntry, Account } from '../types';
import { useAuth } from '../services/authContext';

export default function JournalPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], reference: '', description: '', lines: [{ account: '', debit: 0, credit: 0, description: '' } as any] });

  const fetchData = async () => {
    try {
      const [eRes, aRes] = await Promise.all([API.get('/journal'), API.get('/accounts')]);
      setEntries(eRes.data.data.entries || []);
      setAccounts(aRes.data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const canEdit = user?.role === 'admin' || user?.role === 'accountant';

  const addLine = () => setForm({ ...form, lines: [...form.lines, { account: '', debit: 0, credit: 0, description: '' }] });

  const updateLine = (i: number, field: string, value: any) => {
    const lines = [...form.lines];
    (lines as any)[i][field] = value;
    setForm({ ...form, lines });
  };

  const removeLine = (i: number) => {
    if (form.lines.length === 1) return;
    setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });
  };

  const handleSave = async () => {
    const totalDebit = form.lines.reduce((s: number, l: any) => s + (+l.debit || 0), 0);
    const totalCredit = form.lines.reduce((s: number, l: any) => s + (+l.credit || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert(t('journal.mustBalance'));
      return;
    }
    await API.post('/journal', form);
    setShowModal(false);
    fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('journal.title')}</h1>
        {canEdit && <button onClick={() => { setForm({ date: new Date().toISOString().split('T')[0], reference: '', description: '', lines: [{ account: '', debit: 0, credit: 0, description: '' }] }); setShowModal(true); } } className="btn-primary">{t('journal.add')}</button>}
      </div>

      {loading ? <p className="text-gray-400">{t('common.loading')}</p> : entries.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('common.noData')}</div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry._id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-bold text-blue-600">{entry.reference}</span>
                  <span className="text-gray-500 text-sm mr-3">{new Date(entry.date).toLocaleDateString()}</span>
                </div>
                <span className="text-sm text-gray-500">{entry.createdBy?.name}</span>
              </div>
              <p className="text-sm mb-3">{entry.description}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-2">{t('accounts.title')}</th>
                    <th className="text-right py-2">{t('journal.debit')}</th>
                    <th className="text-right py-2">{t('journal.credit')}</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map((line, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2">{line.account?.nameAr}</td>
                      <td className="py-2 text-green-600 font-medium">{line.debit > 0 ? line.debit.toLocaleString() : ''}</td>
                      <td className="py-2 text-red-600 font-medium">{line.credit > 0 ? line.credit.toLocaleString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td className="py-2">{t('journal.totalDebit')}</td>
                    <td className="py-2 text-green-600">{entry.totalDebit.toLocaleString()}</td>
                    <td className="py-2 text-red-600">{entry.totalCredit.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{t('journal.add')}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('journal.date')}</label>
                  <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('journal.reference')}</label>
                  <input className="input" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('journal.description')}</label>
                <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="border rounded-lg p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2">{t('accounts.title')}</th>
                      <th className="text-right py-2">{t('journal.debit')}</th>
                      <th className="text-right py-2">{t('journal.credit')}</th>
                      <th className="text-right py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.lines.map((line, i) => (
                      <tr key={i}>
                        <td className="py-1">
                          <select className="input text-xs" value={line.account} onChange={(e) => updateLine(i, 'account', e.target.value)}>
                            <option value="">--</option>
                            {accounts.map((a) => <option key={a._id} value={a._id}>{a.code} - {a.nameAr}</option>)}
                          </select>
                        </td>
                        <td className="py-1">
                          <input type="number" className="input text-xs" value={line.debit} onChange={(e) => updateLine(i, 'debit', +e.target.value)} />
                        </td>
                        <td className="py-1">
                          <input type="number" className="input text-xs" value={line.credit} onChange={(e) => updateLine(i, 'credit', +e.target.value)} />
                        </td>
                        <td className="py-1">
                          <button onClick={() => removeLine(i)} className="text-red-500 text-xs">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={addLine} className="text-blue-600 text-sm mt-2">{t('journal.addLine')}</button>
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
