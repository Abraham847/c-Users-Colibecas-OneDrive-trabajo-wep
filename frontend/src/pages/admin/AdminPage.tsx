import { useEffect, useState } from 'react';
import api from '../../services/api';
import StatsCard from '../../components/ui/StatsCard';
import DataTable from '../../components/ui/DataTable';
import { Users, Server, Globe, TrendingUp } from 'lucide-react';
import { formatDate } from '../../utils/format';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard').then(r => setStats(r.data.data)),
      api.get('/admin/users', { params: { limit: 10 } }).then(r => setUsers(r.data.data || [])),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;

  const userColumns = [
    { key: 'name', label: 'Nombre', render: (u: any) => <span className="text-white font-medium">{u.name}</span> },
    { key: 'email', label: 'Email', render: (u: any) => <span className="text-gray-400">{u.email}</span> },
    { key: 'role', label: 'Rol', render: (u: any) => <span className="capitalize">{u.role}</span> },
    { key: 'plan', label: 'Plan', render: (u: any) => <span className="capitalize">{u.plan || 'Free'}</span> },
    { key: 'createdAt', label: 'Registro', render: (u: any) => <span className="text-gray-400">{formatDate(u.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
        <p className="text-gray-400 mt-1">Gestión completa de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard icon={Users} label="Usuarios" value={stats?.stats?.users || 0} color="bg-blue-500/10" />
        <StatsCard icon={Server} label="Planes Activos" value={stats?.stats?.plans || 0} color="bg-purple-500/10" />
        <StatsCard icon={Globe} label="Dominios Activos" value={stats?.stats?.domains || 0} color="bg-orange-500/10" />
        <StatsCard icon={TrendingUp} label="Tickets Abiertos" value={stats?.stats?.tickets || 0} color="bg-red-500/10" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Usuarios Recientes</h3>
        <DataTable columns={userColumns} data={users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => api.get('/admin/users')} className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all">
              <Users size={20} className="text-primary-400 mb-2" />
              <p className="text-white text-sm font-medium">Usuarios</p>
            </button>
            <button onClick={() => api.get('/admin/plans')} className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all">
              <Server size={20} className="text-primary-400 mb-2" />
              <p className="text-white text-sm font-medium">Planes</p>
            </button>
            <button className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all">
              <Globe size={20} className="text-primary-400 mb-2" />
              <p className="text-white text-sm font-medium">Sistema</p>
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-sm text-gray-300">Nuevo usuario registrado</p>
              <span className="text-xs text-gray-600 ml-auto">hace 2m</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <p className="text-sm text-gray-300">Ticket de soporte abierto</p>
              <span className="text-xs text-gray-600 ml-auto">hace 1h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
