import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';
import { Product } from '../types';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', nameAr: '', nameEn: '', description: '', unit: 'قطعة', price: 0, cost: 0, quantity: 0, minQuantity: 0 });

  const fetchData = async () => {
    try { const res = await API.get('/products'); setProducts(res.data.data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditId(null); setForm({ code: '', nameAr: '', nameEn: '', description: '', unit: 'قطعة', price: 0, cost: 0, quantity: 0, minQuantity: 0 }); setShowModal(true); };
  const openEdit = (p: Product) => { setEditId(p._id); setForm({ code: p.code, nameAr: p.nameAr, nameEn: p.nameEn, description: p.description, unit: p.unit, price: p.price, cost: p.cost, quantity: p.quantity, minQuantity: p.minQuantity }); setShowModal(true); };

  const handleSave = async () => {
    if (editId) { await API.put(`/products/${editId}`, form); } else { await API.post('/products', form); }
    setShowModal(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/products/${id}`); fetchData();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('products.title')}</h1>
        <button onClick={openAdd} className="btn-primary">{t('products.add')}</button>
      </div>

      {loading ? <p className="text-gray-400">{t('common.loading')}</p> : products.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('common.noData')}</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b">
                <th className="table-header">{t('products.code')}</th>
                <th className="table-header">{t('products.nameAr')}</th>
                <th className="table-header">{t('products.price')}</th>
                <th className="table-header">{t('products.cost')}</th>
                <th className="table-header">{t('products.qty')}</th>
                <th className="table-header">{t('common.actions')}</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">{p.code}</td>
                    <td className="table-cell font-medium">{p.nameAr}</td>
                    <td className="table-cell text-green-600">{p.price.toLocaleString()}</td>
                    <td className="table-cell text-gray-500">{p.cost.toLocaleString()}</td>
                    <td className="table-cell">
                      <span className={p.quantity <= p.minQuantity ? 'text-red-600 font-bold' : ''}>{p.quantity}</span>
                      <span className="text-xs text-gray-400 mr-1">{p.unit}</span>
                    </td>
                    <td className="table-cell">
                      <button onClick={() => openEdit(p)} className="text-blue-600 mr-2">{t('common.edit')}</button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-600">{t('common.delete')}</button>
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
            <h2 className="text-lg font-bold mb-4">{editId ? 'Edit' : 'Add'} {t('products.title')}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">{t('products.code')}</label>
                <input className="input" placeholder={t('products.code')} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('products.nameAr')}</label>
                <input className="input" placeholder={t('products.nameAr')} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('products.nameEn')}</label>
                <input className="input" placeholder={t('products.nameEn')} value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('products.price')}</label>
                  <input className="input" type="number" placeholder={t('products.price')} value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('products.cost')}</label>
                  <input className="input" type="number" placeholder={t('products.cost')} value={form.cost} onChange={(e) => setForm({ ...form, cost: +e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('products.qty')}</label>
                  <input className="input" type="number" placeholder={t('products.qty')} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('products.minQuantity')}</label>
                  <input className="input" type="number" placeholder={t('products.minQuantity')} value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: +e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('products.unit')}</label>
                <input className="input" placeholder={t('products.unit')} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
                <textarea className="input" rows={2} placeholder={t('common.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
