import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../services/api';

export default function BalanceSheetPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/reports/balance-sheet').then((res) => setData(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">{t('common.loading')}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('reports.balanceSheet')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4 text-blue-600">{t('reports.totalAssets')}</h2>
          {(data?.assets || []).map((a: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b border-gray-100 text-sm">
              <span>{a.nameAr}</span>
              <span className="font-medium">{a.balance.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 font-bold text-blue-700 mt-2">
            <span>{t('reports.totalAssets')}</span>
            <span>{data?.totalAssets?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4 text-orange-600">{t('reports.totalLiabilities')}</h2>
          {(data?.liabilities || []).map((l: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b border-gray-100 text-sm">
              <span>{l.nameAr}</span>
              <span className="font-medium">{l.balance.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 font-bold text-orange-700 mt-2">
            <span>{t('reports.totalLiabilities')}</span>
            <span>{data?.totalLiabilities?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4 text-green-600">{t('reports.totalEquity')}</h2>
          {(data?.equity || []).map((e: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b border-gray-100 text-sm">
              <span>{e.nameAr}</span>
              <span className="font-medium">{e.balance.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 font-bold text-green-700 mt-2">
            <span>{t('reports.totalEquity')}</span>
            <span>{data?.totalEquity?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
