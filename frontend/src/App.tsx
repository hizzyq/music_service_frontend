import { useAuthStore } from './store/useAuthStore';
import { AuthPage } from './components/AuthPage';
import { LogOut, ShieldCheck, User } from 'lucide-react';

export default function App() {
  const { token, userId, role, isAdmin, logout } = useAuthStore();

  // Если токена нет — показываем экран авторизации
  if (!token) {
    return <AuthPage />;
  }

  // Если токен есть — временный дашборд для проверки
  return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🎉 Авторизация успешна!
          </h2>

          <div className="p-4 bg-zinc-950 rounded-xl space-y-2 text-sm text-zinc-300 border border-zinc-800/80">
            <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <User className="w-4 h-4" /> User ID:
            </span>
              <span className="font-mono font-semibold">{userId ?? 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Роль:
            </span>
              <span className={`font-semibold uppercase text-xs px-2 py-0.5 rounded ${
                  isAdmin ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
              {role || 'listener'}
            </span>
            </div>
          </div>

          <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Выйти из аккаунта
          </button>
        </div>
      </div>
  );
}