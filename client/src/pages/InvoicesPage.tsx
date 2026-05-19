import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';
import { Invoice, Customer, Vendor, Product } from '../types';
import { useAuth } from '../services/authContext';

export default function InvoicesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState<any>({
    number: '', type: 'sales', date: new Date().toISOString().split('T')[0],
    dueDate: '', customer: '', vendor: '', items: [{ product: '', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0, tax: 0, discount: 0, total: 0, paid: 0, status: 'draft', notes: '',
  });

  const fetchData = async () => {
    try {
      const [iRes, cRes, vRes, pRes] = await Promise.all([
        API.get('/invoices'), API.get('/customers'), API.get('/vendors'), API.get('/products'),
      ]);
      setInvoices(iRes.data.data.invoices || []);
      setCustomers(cRes.data.data || []);
      setVendors(vRes.data.data || []);
      setProducts(pRes.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const canEdit = user?.role === 'admin' || user?.role === 'accountant';

  const openAdd = () => {
    setEditId(null);
    setForm({ number: `INV-${Date.now()}`, type: 'sales', date: new Date().toISOString().split('T')[0], dueDate: '', customer: '', vendor: '', items: [{ product: '', description: '', quantity: 1, unitPrice: 0, total: 0 }], subtotal: 0, tax: 0, discount: 0, total: 0, paid: 0, status: 'draft', notes: '' });
    setShowModal(true);
  };

  const openEdit = (inv: Invoice) => {
    setEditId(inv._id);
    setForm({
      number: inv.number, type: inv.type, date: new Date(inv.date).toISOString().split('T')[0],
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      customer: inv.customer?._id || '', vendor: inv.vendor?._id || '',
      items: inv.items.map(i => ({ product: typeof i.product === 'object' ? i.product._id : i.product, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total })),
      subtotal: inv.subtotal, tax: inv.tax, discount: inv.discount, total: inv.total,
      paid: inv.paid, status: inv.status, notes: inv.notes || '',
    });
    setShowModal(true);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { product: '', description: '', quantity: 1, unitPrice: 0, total: 0 }] });

  const updateItem = (i: number, field: string, value: any) => {
    const items = [...form.items];
    items[i][field] = value;
    if (field === 'quantity' || field === 'unitPrice' || field === 'product') {
      items[i].total = items[i].quantity * items[i].unitPrice;
    }
    const subtotal = items.reduce((s: any, it: any) => s + (+it.total || 0), 0);
    const total = subtotal + (+form.tax || 0) - (+form.discount || 0);
    setForm({ ...form, items, subtotal, total });
  };

  const handleSave = async () => {
    if (editId) {
      await API.put(`/invoices/${editId}`, form);
    } else {
      await API.post('/invoices', form);
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await API.delete(`/invoices/${id}`);
    fetchData();
  };

  const statusColors: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', confirmed: 'bg-blue-100 text-blue-600', paid: 'bg-green-100 text-green-600', cancelled: 'bg-red-100 text-red-600' };
  const filteredInvoices = filter === 'all' ? invoices : invoices.filter((inv) => inv.type === filter);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('invoices.title')}</h1>
        {canEdit && <button onClick={openAdd} className="btn-primary">{t('invoices.add')}</button>}
      </div>
      <div className="flex gap-2 mb-4">
        {['all', 'sales', 'purchase'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-sm ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>{t(`invoices.${f}`)}</button>
        ))}
      </div>

      {loading ? <p className="text-gray-400">{t('common.loading')}</p> : filteredInvoices.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('common.noData')}</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="table-header">{t('invoices.number')}</th>
                  <th className="table-header">{t('invoices.date')}</th>
                  <th className="table-header">{t('invoices.customer')}/{t('invoices.vendor')}</th>
                  <th className="table-header">{t('invoices.total')}</th>
                  <th className="table-header">{t('invoices.paid')}</th>
                  <th className="table-header">{t('invoices.status')}</th>
                  <th className="table-header">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{inv.number}</td>
                    <td className="table-cell text-sm text-gray-500">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="table-cell">{inv.customer?.name || inv.vendor?.name || '-'}</td>
                    <td className="table-cell font-medium">{inv.total.toLocaleString()}</td>
                    <td className="table-cell">{inv.paid.toLocaleString()}</td>
                    <td className="table-cell"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inv.status]}`}>{t(`invoices.${inv.status}`)}</span></td>
                    <td className="table-cell">
                      {canEdit && <button onClick={() => openEdit(inv)} className="text-blue-600 mr-2">{t('common.edit')}</button>}
                      {user?.role === 'admin' && <button onClick={() => handleDelete(inv._id)} className="text-red-600">{t('common.delete')}</button>}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editId ? t('common.edit') : t('invoices.add')} {t('invoices.title')}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('invoices.number')}</label>
                  <input className="input text-sm" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('invoices.date')}</label>
                  <input type="date" className="input text-sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('invoices.dueDate')}</label>
                  <input type="date" className="input text-sm" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('invoices.status')}</label>
                  <select className="input text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="sales">{t('invoices.sales')}</option>
                    <option value="purchase">{t('invoices.purchases')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {form.type === 'sales' ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('invoices.customer')}</label>
                    <select className="input text-sm" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value, vendor: '' })}>
                      <option value="">--</option>
                      {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('invoices.vendor')}</label>
                    <select className="input text-sm" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value, customer: '' })}>
                      <option value="">--</option>
                      {vendors.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="border rounded-lg p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-2">{t('invoices.product')}</th>
                      <th className="text-right py-2">{t('invoices.qty')}</th>
                      <th className="text-right py-2">{t('invoices.price')}</th>
                      <th className="text-right py-2">{t('invoices.total')}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="py-1">
                          <select className="input text-xs" value={item.product} onChange={(e) => {
                            const p = products.find(pr => pr._id === e.target.value);
                            updateItem(i, 'product', e.target.value);
                            if (p) { updateItem(i, 'description', p.nameAr); updateItem(i, 'unitPrice', p.price); }
                          }}>
                            <option value="">--</option>
                            {products.map((p) => <option key={p._id} value={p._id}>{p.nameAr}</option>)}
                          </select>
                        </td>
                        <td className="py-1"><input type="number" className="input text-xs w-20" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', +e.target.value)} /></td>
                        <td className="py-1"><input type="number" className="input text-xs w-24" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', +e.target.value)} /></td>
                        <td className="py-1 font-medium">{item.total.toLocaleString()}</td>
                        <td className="py-1"><button onClick={() => { if (form.items.length > 1) setForm({ ...form, items: form.items.filter((_: any, idx: number) => idx !== i) }); }} className="text-red-500 text-xs">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={addItem} className="text-blue-600 text-sm mt-2">{t('invoices.addItem')}</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('invoices.subtotal')}</label>
                  <input className="input text-sm" value={form.subtotal} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('invoices.tax')}</label>
                  <input type="number" className="input text-sm" value={form.tax} onChange={(e) => {
                    const tax = +e.target.value;
                    setForm({ ...form, tax, total: form.subtotal + tax - form.discount });
                  }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('invoices.discount')}</label>
                  <input type="number" className="input text-sm" value={form.discount} onChange={(e) => {
                    const discount = +e.target.value;
                    setForm({ ...form, discount, total: form.subtotal + form.tax - discount });
                  }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('invoices.total')}</label>
                <input className="input text-lg font-bold" value={form.total.toLocaleString()} readOnly />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">{t('invoices.paid')}</label>
                  <input type="number" className="input text-sm" value={form.paid} onChange={(e) => setForm({ ...form, paid: +e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('invoices.status')}</label>
                  <select className="input text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="draft">{t('invoices.draft')}</option>
                    <option value="confirmed">{t('invoices.confirmed')}</option>
                    <option value="paid">{t('invoices.paidStatus')}</option>
                    <option value="cancelled">{t('invoices.cancelled')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('common.description')}</label>
                <textarea className="input text-sm" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
