import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Server, Plus } from 'lucide-react';
import type { HostingPlan } from '../../types';

export default function HostingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hosting').then(r => setPlans(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'name', label: 'Plan', render: (p: HostingPlan) => <span className="text-white font-medium">{p.name}</span> },
    { key: 'type', label: 'Tipo', render: (p: HostingPlan) => <span className="text-gray-400 capitalize">{p.type}</span> },
    { key: 'status', label: 'Estado', render: (p: HostingPlan) => <StatusBadge status={p.status} /> },
    { key: 'resources', label: 'Recursos', render: (p: HostingPlan) => <span className="text-gray-400">{p.resources.cpu} CPU · {p.resources.ram}MB RAM</span> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Planes de Hosting</h1>
          <p className="text-gray-400 mt-1">Gestiona tus planes de alojamiento web gratuito</p>
        </div>
        <button onClick={() => navigate('/hosting/plans')} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Nuevo plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <Server size={64} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Sin planes activos</h3>
          <p className="text-gray-400 mb-6">Activa un plan de hosting gratuito</p>
          <button onClick={() => navigate('/hosting/plans')} className="btn-primary">Ver planes disponibles</button>
        </div>
      ) : (
        <DataTable columns={columns} data={plans} onRowClick={(p) => navigate(`/hosting/${p._id}`)} />
      )}
    </div>
  );
}
