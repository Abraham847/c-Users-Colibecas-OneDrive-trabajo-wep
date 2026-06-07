import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ResourceBar from '../../components/ui/ResourceBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { Server, ArrowLeft, ExternalLink, Terminal, Database, RefreshCw } from 'lucide-react';
import type { HostingPlan } from '../../types';

export default function HostingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<HostingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/hosting/${id}`).then(r => setPlan(r.data.data)).catch(() => navigate('/hosting')).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;
  if (!plan) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/hosting')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={18} /> Volver a hosting
      </button>

      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-500/10"><Server size={28} className="text-primary-400" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">{plan.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={plan.status} />
                <span className="text-sm text-gray-400 capitalize">{plan.type}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-bold text-lg">Gratis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Uso de Recursos</h3>
          <div className="space-y-5">
            <ResourceBar label="CPU" used={plan.resourceUsage.cpu} total={plan.resources.cpu} unit="cores" />
            <ResourceBar label="RAM" used={plan.resourceUsage.ram} total={plan.resources.ram} unit="MB" />
            <ResourceBar label="Almacenamiento" used={plan.resourceUsage.storage} total={plan.resources.storage} />
            <ResourceBar label="Ancho de Banda" used={plan.resourceUsage.bandwidth} total={plan.resources.bandwidth} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Servidor</h3>
          {plan.server ? (
            <dl className="space-y-3">
              <div className="flex justify-between"><dt className="text-gray-400">IP</dt><dd className="text-white font-mono text-sm">{plan.server.ip}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Hostname</dt><dd className="text-white">{plan.server.hostname}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-400">Sistema</dt><dd className="text-white">{plan.server.os}</dd></div>
            </dl>
          ) : (
            <p className="text-gray-400">Servidor en preparación...</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">SSL / HTTPS</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Estado</span>
            <StatusBadge status={plan.ssl.status} />
          </div>
          <button onClick={() => api.post(`/ssl/hosting/${plan._id}`).then(() => { window.location.reload(); })} className="btn-primary w-full">
            Activar SSL
          </button>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all">
              <Terminal size={20} className="text-primary-400 mb-2" />
              <p className="text-white text-sm font-medium">Terminal Web</p>
              <p className="text-gray-500 text-xs">Acceso SSH</p>
            </button>
            <button onClick={() => navigate(`/files`)} className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all">
              <Database size={20} className="text-primary-400 mb-2" />
              <p className="text-white text-sm font-medium">Archivos</p>
              <p className="text-gray-500 text-xs">Gestión de archivos</p>
            </button>
            <button className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all">
              <RefreshCw size={20} className="text-primary-400 mb-2" />
              <p className="text-white text-sm font-medium">Respaldos</p>
              <p className="text-gray-500 text-xs">Gestiona backups</p>
            </button>
            <button className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all">
              <ExternalLink size={20} className="text-primary-400 mb-2" />
              <p className="text-white text-sm font-medium">phpMyAdmin</p>
              <p className="text-gray-500 text-xs">Base de datos</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
