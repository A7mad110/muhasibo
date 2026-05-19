import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';
import { User } from '../types';

export default function UsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'accountant', lang: 'ar', active: true });

  const fetchData = async () => {
    try { const res = await API.get('/auth/users'); setUsers(res.data.data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditId(null); setForm({ name: '', email: '', password: '', role: 'accountant', lang: 'ar', active: true }); setShowModal(true); };
  const openEdit = (u: User) => { setEditId(u._id); setForm({ name: u.name, email: u.email, password: '', role: u.role, lang: u.lang, active: u.active }); setShowModal(true); };

  const handleSave = async () => {
    if (editId) {
      const { password, ...data } = form;
      await API.put(`/auth/users/${editId}`, password ? { ...data, password } : data);
    } else {
      await API.post('/auth/register', form);
    }
    setShowModal(false); fetchData();
  };

  const roleColors: Record<string, string> = { admin: 'bg-purple-100 text-purple-700', accountant: 'bg-blue-100 text-blue-700', viewer: 'bg-gray-100 text-gray-700' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('users.title')}</h1>
        <button onClick={openAdd} className="btn-primary">{t('users.add')}</button>
      </div>

      {loading ? <p className="text-gray-400">{t('common.loading')}</p> : users.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">{t('common.noData')}</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b">
                <th className="table-header">{t('users.name')}</th>
                <th className="table-header">{t('users.email')}</th>
                <th className="table-header">{t('users.role')}</th>
                <th className="table-header">{t('common.status')}</th>
                <th className="table-header">{t('common.actions')}</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{u.name}</td>
                    <td className="table-cell text-gray-500">{u.email}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{t(`users.${u.role}`)}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button onClick={() => openEdit(u)} className="text-blue-600">{t('common.edit')}</button>
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
            <h2 className="text-lg font-bold mb-4">{editId ? t('users.edit') : t('users.add')}</h2>
            <div className="space-y-3">
              <input className="input" placeholder={t('users.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder={t('users.email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">{t('users.admin')}</option>
                <option value="accountant">{t('users.accountant')}</option>
                <option value="viewer">{t('users.viewer')}</option>
              </select>
              <select className="input" value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })}>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                <span className="text-sm">{t('common.active')}</span>
              </label>
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
