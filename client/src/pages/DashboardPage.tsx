import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../services/api';
import { useAuth } from '../services/authContext';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({ accounts: 0, entries: 0, invoices: 0, customers: 0 });
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      API.get('/accounts').then(r => r.data.data),
      API.get('/journal?limit=5').then(r => r.data.data),
      API.get('/invoices').then(r => r.data.data),
      API.get('/customers').then(r => r.data.data),
      API.get('/reports/income-statement').then(r => r.data.data),
    ]).then(([accounts, journal, invoices, customers, income]) => {
      setStats({
        accounts: accounts?.length || 0,
        entries: journal?.pagination?.total || 0,
        invoices: invoices?.pagination?.total || 0,
        customers: customers?.length || 0,
      });
      setRecentEntries(journal?.entries?.slice(0, 5) || []);
      if (income) {
        setChartData([
          { name: t('reports.revenue'), amount: income.totalRevenue || 0 },
          { name: t('reports.expenses'), amount: income.totalExpenses || 0 },
          { name: t('reports.netIncome'), amount: income.netIncome || 0 },
        ]);
      }
    }).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{t('dashboard.welcome')}, {user?.name}</h1>
      <p className="text-gray-500 mb-6">{t('app.tagline')}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('dashboard.totalAccounts'), value: stats.accounts, color: 'bg-blue-500', link: '/accounts' },
          { label: t('dashboard.totalEntries'), value: stats.entries, color: 'bg-green-500', link: '/journal' },
          { label: t('dashboard.totalInvoices'), value: stats.invoices, color: 'bg-purple-500', link: '/invoices' },
          { label: t('dashboard.totalCustomers'), value: stats.customers, color: 'bg-amber-500', link: '/customers' },
        ].map((card, i) => (
          <Link key={i} to={card.link} className="card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-white text-lg mb-3`}>
              {['📋', '📝', '🧾', '👥'][i]}
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">{t('dashboard.incomeVsExpenses')}</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">{t('common.noData')}</p>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold mb-4">{t('dashboard.recentEntries')}</h2>
          {recentEntries.length > 0 ? (
            <div className="space-y-3">
              {recentEntries.map((e: any) => (
                <div key={e._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{e.reference}</p>
                    <p className="text-xs text-gray-500">{e.description?.substring(0, 40)}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()}</p>
                    <p className="text-sm font-medium">{e.totalDebit.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10">{t('common.noData')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
