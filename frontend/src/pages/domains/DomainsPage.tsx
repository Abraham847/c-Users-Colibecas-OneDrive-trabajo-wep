import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Globe, Plus, Search } from 'lucide-react';
import { formatDate } from '../../utils/format';
import type { Domain } from '../../types';

export default function DomainsPage() {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/domains').then(r => setDomains(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'domain', label: 'Dominio', render: (d: Domain) => <span className="text-white font-medium">{d.domain}</span> },
    { key: 'status', label: 'Estado', render: (d: Domain) => <StatusBadge status={d.status} /> },
    { key: 'ssl', label: 'SSL', render: (d: Domain) => <StatusBadge status={d.ssl.status} size="sm" /> },
    { key: 'expiryDate', label: 'Expira', render: (d: Domain) => <span className="text-gray-400">{d.expiryDate ? formatDate(d.expiryDate) : '-'}</span> },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Dominios</h1>
          <p className="text-gray-400 mt-1">Gestiona todos tus dominios registrados (máx. 20)</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/domains/search')} className="btn-secondary text-sm flex items-center gap-2">
            <Search size={16} /> Buscar dominio
          </button>
          <button onClick={() => navigate('/domains/search')} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} /> Registrar nuevo
          </button>
        </div>
      </div>

      {domains.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <Globe size={64} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Sin dominios registrados</h3>
          <p className="text-gray-400 mb-6">Registra tu primer dominio para empezar</p>
          <button onClick={() => navigate('/domains/search')} className="btn-primary flex items-center gap-2">
            <Search size={16} /> Buscar dominio
          </button>
        </div>
      ) : (
        <DataTable columns={columns} data={domains} onRowClick={(d) => navigate(`/domains/${d._id}`)} />
      )}
    </div>
  );
}
