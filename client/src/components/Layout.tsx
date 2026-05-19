import { useState, useMemo } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../services/authContext';
import { changeLang } from '../i18n';

const baseNavItems = [
  { path: '/', label: 'nav.dashboard', icon: '📊' },
  { path: '/accounts', label: 'nav.accounts', icon: '📋' },
  { path: '/journal', label: 'nav.journal', icon: '📝' },
  { path: '/invoices', label: 'nav.invoices', icon: '🧾' },
  { path: '/customers', label: 'nav.customers', icon: '👥' },
  { path: '/vendors', label: 'nav.vendors', icon: '🏭' },
  { path: '/products', label: 'nav.products', icon: '📦' },
  { path: '/expenses', label: 'nav.expenses', icon: '💸' },
  { path: '/trial-balance', label: 'nav.trialBalance', icon: '⚖️' },
  { path: '/income-statement', label: 'nav.incomeStatement', icon: '📈' },
  { path: '/balance-sheet', label: 'nav.balanceSheet', icon: '📉' },
];

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [...baseNavItems, { path: '/users', label: 'nav.users', icon: '👤' as const }];
    }
    return baseNavItems;
  }, [user]);

  return (
    <div className="min-h-screen flex">
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 transform transition-transform duration-200 ease-in-out overflow-y-auto`}>
        <div className="p-4 border-b border-gray-200">
          <Link to="/" className="text-xl font-bold text-blue-600">{t('app.name')}</Link>
          <p className="text-xs text-gray-500 mt-1">{user?.name} ({t(`users.${user?.role}`)})</p>
        </div>
        <nav className="p-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{t(item.label)}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => changeLang('ar')} className={`px-2 py-1 text-xs rounded ${user?.lang === 'ar' || !user ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>AR</button>
            <button onClick={() => changeLang('en')} className={`px-2 py-1 text-xs rounded ${user?.lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>EN</button>
          </div>
          <button onClick={logout} className="w-full text-right text-sm text-red-600 hover:text-red-800 px-3 py-2">{t('nav.logout')}</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 text-2xl">☰</button>
        </header>
        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
