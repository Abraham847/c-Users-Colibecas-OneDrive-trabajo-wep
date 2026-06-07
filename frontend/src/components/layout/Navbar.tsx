import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Bot, Bell, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function Navbar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar dominios, sitios, ayuda..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/ai-chat')}
          className="flex items-center gap-2 px-4 py-2 gradient-bg rounded-xl text-white text-sm font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          <Bot size={16} />
          <span>AI Asistente</span>
        </button>

        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Bell size={20} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">3</span>
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.plan} Plan</p>
          </div>
          <div className="w-9 h-9 gradient-bg rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
