import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';

export default function TrialBalancePage() {
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
      const res = await API.get('/reports/trial-balance', { params });
      setData(res.data.data);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('reports.trialBalance')}</h1>
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
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="table-header">{t('reports.account')}</th>
                  <th className="table-header">{t('reports.debit')}</th>
                  <th className="table-header">{t('reports.credit')}</th>
                  <th className="table-header">{t('reports.balance')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.report.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="table-cell">{r.nameAr} <span className="text-xs text-gray-400">({r.code})</span></td>
                    <td className="table-cell text-green-600">{r.debit.toLocaleString()}</td>
                    <td className="table-cell text-red-600">{r.credit.toLocaleString()}</td>
                    <td className={`table-cell font-medium ${r.balance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(r.balance).toLocaleString()} {r.balance > 0 ? t('journal.debit') : t('journal.credit')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td className="table-cell">{t('common.total')}</td>
                  <td className="table-cell text-green-600">{data.totals.debit.toLocaleString()}</td>
                  <td className="table-cell text-red-600">{data.totals.credit.toLocaleString()}</td>
                  <td className="table-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
