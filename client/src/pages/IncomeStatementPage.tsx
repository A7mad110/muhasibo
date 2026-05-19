import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';

export default function IncomeStatementPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ from: '', to: '' });

  const generate = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dates.from) params.from = dates.from;
      if (dates.to) params.to = dates.to;
      const res = await API.get('/reports/income-statement', { params });
      setData(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('reports.incomeStatement')}</h1>
      <div className="card mb-6">
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.from')}</label>
            <input type="date" className="input" value={dates.from} onChange={(e) => setDates({ ...dates, from: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.to')}</label>
            <input type="date" className="input" value={dates.to} onChange={(e) => setDates({ ...dates, to: e.target.value })} />
          </div>
          <button onClick={generate} className="btn-primary" disabled={loading}>{loading ? t('common.loading') : t('reports.generate')}</button>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-semibold mb-4 text-green-600">{t('reports.revenue')}</h2>
            {data.revenues.map((r: any, i: number) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                <span>{r.nameAr}</span>
                <span className="font-medium">{r.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 font-bold text-green-700 mt-2">
              <span>{t('reports.revenue')}</span>
              <span>{data.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-4 text-red-600">{t('reports.expenses')}</h2>
            {data.expenses.map((e: any, i: number) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                <span>{e.nameAr}</span>
                <span className="font-medium">{e.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 font-bold text-red-700 mt-2">
              <span>{t('reports.expenses')}</span>
              <span>{data.totalExpenses.toLocaleString()}</span>
            </div>
          </div>
          <div className="card lg:col-span-2">
            <div className={`flex justify-between py-3 text-xl font-bold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span>{t('reports.netIncome')}</span>
              <span>{Math.abs(data.netIncome).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
