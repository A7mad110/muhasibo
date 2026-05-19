import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../services/authContext';
import { changeLang } from '../i18n';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('api_url') || 'https://muhasibo.onrender.com/api');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      const msg = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
        ? 'الخادم في وضع السكون، يرجى الانتظار 30-50 ثانية ثم المحاولة مجدداً\nServer is sleeping, please wait 30-50 seconds and try again'
        : (err.response?.data?.message || t('auth.wrongCredentials'));
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">{t('app.name')}</h1>
          <p className="text-gray-500 mt-1">{t('app.tagline')}</p>
        </div>
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={() => changeLang('ar')} className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">العربية</button>
          <button onClick={() => changeLang('en')} className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">English</button>
        </div>
        <details className="mb-4 text-xs text-gray-400">
          <summary className="cursor-pointer">API Settings</summary>
          <div className="mt-2 flex gap-2">
            <input className="input text-xs" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="API URL" />
            <button className="btn-primary text-xs" onClick={() => { localStorage.setItem('api_url', apiUrl); alert('Saved!'); window.location.reload(); }}>Save</button>
          </div>
        </details>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm whitespace-pre-line">{error}</div>}
        {submitting && <div className="bg-blue-50 text-blue-600 p-3 rounded-lg mb-4 text-sm text-center">جاري الاتصال بالخادم... Connecting to server...</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.name')}</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required disabled={submitting} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={submitting} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={submitting} />
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={submitting}>
            {submitting ? '...' : (isRegister ? t('auth.register') : t('auth.loginBtn'))}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-500">
          {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 mr-1 hover:underline" disabled={submitting}>
            {isRegister ? t('auth.login') : t('auth.register')}
          </button>
        </p>
      </div>
    </div>
  );
}
