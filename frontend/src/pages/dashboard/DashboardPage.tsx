import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import StatsCard from '../../components/ui/StatsCard';
import ResourceBar from '../../components/ui/ResourceBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { Globe, Server, Activity, ArrowRight, Bot, Plus } from 'lucide-react';
import type { Domain, HostingPlan } from '../../types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ domains: 0, hosting: 0 });
  const [domains, setDomains] = useState<Domain[]>([]);
  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/domains').then(r => { setStats(s => ({ ...s, domains: r.data.data?.length || 0 })); setDomains(r.data.data || []); }),
      api.get('/hosting').then(r => { setStats(s => ({ ...s, hosting: r.data.data?.length || 0 })); setPlans(r.data.data || []); }),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bienvenido, {user?.name}</h1>
          <p className="text-gray-400 mt-1">Panel de control de CloudHost</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/domains/search')} className="btn-secondary text-sm flex items-center gap-2">
            <Plus size={16} /> Registrar dominio
          </button>
          <button onClick={() => navigate('/ai-builder')} className="btn-primary text-sm flex items-center gap-2">
            <Bot size={16} /> Crear con IA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard icon={Globe} label="Dominios" value={stats.domains} color="bg-blue-500/10" />
        <StatsCard icon={Server} label="Planes de Hosting" value={stats.hosting} color="bg-purple-500/10" />
      </div>

      {user && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recursos del Plan {user.plan}</h3>
          <div className="space-y-4">
            <ResourceBar label="Almacenamiento" used={user.storage.used} total={user.storage.total} />
            <ResourceBar label="Ancho de Banda" used={0} total={10737418240} />
            <ResourceBar label="CPUs" used={0} total={2} unit="cores" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Dominios Recientes</h3>
            <button onClick={() => navigate('/domains')} className="text-primary-400 text-sm flex items-center gap-1 hover:text-primary-300">
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          {domains.length === 0 ? (
            <div className="text-center py-8">
              <Globe size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No tienes dominios registrados</p>
              <button onClick={() => navigate('/domains/search')} className="btn-primary text-sm mt-3">Buscar dominio</button>
            </div>
          ) : (
            <div className="space-y-3">
              {domains.slice(0, 5).map((d) => (
                <div key={d._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate(`/domains/${d._id}`)}>
                  <div>
                    <p className="text-white font-medium">{d.domain}</p>
                    <p className="text-xs text-gray-500">Expira: {new Date(d.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Planes de Hosting</h3>
            <button onClick={() => navigate('/hosting')} className="text-primary-400 text-sm flex items-center gap-1 hover:text-primary-300">
              Ver todos <ArrowRight size={14} />
            </button>
          </div>
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <Server size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Sin planes de hosting</p>
              <button onClick={() => navigate('/hosting/plans')} className="btn-primary text-sm mt-3">Ver planes</button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate(`/hosting/${p._id}`)}>
                  <div>
                    <p className="text-white font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.resources.cpu} CPU · {p.resources.ram}MB RAM</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Actividad Reciente</h3>
        </div>
        <div className="flex items-center gap-3 py-3">
          <Activity size={16} className="text-green-400" />
          <p className="text-sm text-gray-300">Todo funciona correctamente — sin costos</p>
        </div>
      </div>
    </div>
  );
}
