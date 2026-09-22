import React, { useState } from 'react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { Music2, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && password !== passwordConfirmation) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await authApi.login(email, password);
      } else {
        data = await authApi.register(email, password, passwordConfirmation);
      }

      if (data?.token) {
        setToken(data.token);
      }
    } catch (err: any) {
      const serverMessage = err.response?.data?.error || err.response?.data?.errors?.join(', ');
      setError(serverMessage || 'Не удалось выполнить запрос. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md bg-zinc-900/70 border border-zinc-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
        
        {/* Логотип */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Music2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            {isLogin ? 'С возвращением' : 'Создать аккаунт'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {isLogin ? 'Войдите для доступа к вашей музыке' : 'Зарегистрируйтесь для прослушивания'}
          </p>
        </div>

        {/* Вывод ошибки */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 ml-1">
                Подтверждение пароля
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-semibold py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLogin ? 'Войти' : 'Зарегистрироваться'}</span>
          </button>
        </form>

        {/* Переключатель Вход / Регистрация */}
        <div className="mt-6 text-center text-xs text-zinc-400">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-emerald-400 hover:text-emerald-300 font-medium ml-1 transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>

      </div>
    </div>
  );
};