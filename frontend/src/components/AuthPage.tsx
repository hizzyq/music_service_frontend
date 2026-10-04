import React, { useState } from 'react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { Terminal, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Terminal Header Bar */}
        <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono text-zinc-400">auth@cd-music:~$</span>
          <div className="w-12" />
        </div>

        <div className="p-8">
          {/* Брендинг cd ~/music/ */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Terminal className="w-6 h-6" />
            </div>
            <div className="font-mono text-xl font-bold text-emerald-400 tracking-tight flex items-center gap-1">
              <span className="text-zinc-500">$</span>
              <span>cd ~/music/</span>
              <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-0.5" />
            </div>
            <p className="text-xs text-zinc-400 mt-2 font-mono">
              {isLogin ? '$ sudo auth --user-session' : '$ sudo adduser --new-account'}
            </p>
          </div>

          {/* Вывод ошибки */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 ml-1">
                user@email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@test.com"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 ml-1">
                password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5 ml-1">
                  confirm_password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-semibold py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isLogin ? '$ ./login.sh' : '$ ./register.sh'}</span>
            </button>
          </form>

          {/* Переключатель Вход / Регистрация */}
          <div className="mt-6 text-center text-xs font-mono text-zinc-500">
            {isLogin ? 'switch to register:' : 'already registered:'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-medium ml-1 transition-colors underline-offset-4 hover:underline cursor-pointer"
            >
              {isLogin ? 'create account' : 'log in'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};