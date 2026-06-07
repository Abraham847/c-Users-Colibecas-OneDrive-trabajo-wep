import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';
import {
  LayoutDashboard, Globe, Server, Cpu, Bot, Folder, Activity, Mail,
  Settings, HelpCircle, ChevronLeft, ChevronRight, LogOut, Shield, PanelTop
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Panel', path: '/dashboard' },
  { icon: Globe, label: 'Dominios', path: '/domains' },
  { icon: Server, label: 'Hosting', path: '/hosting' },
  { icon: Cpu, label: 'VPS Cloud', path: '/vps' },
  { icon: Bot, label: 'AI Builder', path: '/ai-builder' },
  { icon: Folder, label: 'Archivos', path: '/files' },
  { icon: Activity, label: 'DNS', path: '/dns' },
  { icon: Mail, label: 'Correos', path: '/email' },
  { icon: PanelTop, label: 'Despliegues', path: '/deployments' },
];

const bottomItems = [
  { icon: Settings, label: 'Ajustes', path: '/settings' },
  { icon: HelpCircle, label: 'Soporte', path: '/support' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar} />
      )}
      <aside className={cn(
        'fixed left-0 top-0 h-full bg-dark-600 border-r border-white/5 z-50 transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full md:translate-x-0'
      )}>
      <div className={cn('flex items-center h-16 px-4 border-b border-white/5', sidebarOpen ? 'justify-between' : 'justify-center')}>
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CH</span>
            </div>
            <span className="text-white font-bold text-lg">CloudHost</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              isActive ? 'gradient-bg text-white shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5',
              !sidebarOpen && 'justify-center px-2'
            )}
            title={!sidebarOpen ? item.label : undefined}
          >
            <item.icon size={20} />
            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}

        {user && (user.role === 'admin' || user.role === 'superadmin') && (
          <NavLink
            to="/admin"
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              isActive ? 'gradient-bg text-white shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5',
              !sidebarOpen && 'justify-center px-2'
            )}
            title={!sidebarOpen ? 'Admin' : undefined}
          >
            <Shield size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Admin</span>}
          </NavLink>
        )}

        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              isActive ? 'gradient-bg text-white shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5',
              !sidebarOpen && 'justify-center px-2'
            )}
            title={!sidebarOpen ? item.label : undefined}
          >
            <item.icon size={20} />
            {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={cn('border-t border-white/5 p-3', !sidebarOpen && 'flex justify-center')}>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all w-full py-2.5',
            sidebarOpen ? 'px-3' : 'justify-center'
          )}
          title={!sidebarOpen ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="text-sm font-medium">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
