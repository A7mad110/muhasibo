import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';
import { Vendor } from '../types';

export default function VendorsPage() {
  const { t } = useTranslation();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', taxId: '' });

  const fetchData = async () => {
    try { const res = await API.get('/vendors'); setVendors(res.data.data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditId(null); setForm({ name: '', phone: '', email: '', address: '', taxId: '' }); setShowModal(true); };
  const openEdit = (v: Vendor) => { setEditId(v._id); setForm({ name: v.name, phone: v.phone, email: v.email, address: v.address, taxId: v.taxId }); setShowModal(true); };

  const handleSave = async () => {
    if (editId) { await API.put(`/vendors/${editId}`, form); } else { await API.post('/vendors', form); }
    setShowModal(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/vendors/${id}`); fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('vendors.title')}</h1>
        <button onClick={openAdd} className="btn-primary">{t('vendors.add')}</button>
      </div>

      {loading ? <p className="text-gray-400">{t('common.loading')}</p> : vendors.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('common.noData')}</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b">
                <th className="table-header">{t('vendors.name')}</th>
                <th className="table-header">{t('vendors.phone')}</th>
                <th className="table-header">{t('vendors.email')}</th>
                <th className="table-header">{t('vendors.balance')}</th>
                <th className="table-header">{t('common.actions')}</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{v.name}</td>
                    <td className="table-cell text-gray-500">{v.phone || '-'}</td>
                    <td className="table-cell text-gray-500">{v.email || '-'}</td>
                    <td className="table-cell">{v.balance.toLocaleString()}</td>
                    <td className="table-cell">
                      <button onClick={() => openEdit(v)} className="text-blue-600 mr-2">{t('common.edit')}</button>
                      <button onClick={() => handleDelete(v._id)} className="text-red-600">{t('common.delete')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editId ? t('vendors.edit') : t('vendors.add')}</h2>
            <div className="space-y-3">
              <input className="input" placeholder={t('vendors.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder={t('vendors.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="input" placeholder={t('vendors.email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input" placeholder={t('vendors.address')} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input className="input" placeholder="Tax ID" value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} />
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
