import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import { Globe, ArrowLeft, RefreshCw, Shield, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/format';
import type { Domain } from '../../types';

export default function DomainDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/domains/${id}`).then(r => setDomain(r.data.data)).catch(() => navigate('/domains')).finally(() => setLoading(false));
  }, [id, navigate]);

  const toggleAction = async (action: string, successMsg: string) => {
    try {
      const { data } = await api.put(`/domains/${id}/${action}`);
      if (data.success) {
        setDomain(data.data);
        toast.success(successMsg);
      }
    } catch { toast.error('Error al actualizar'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;
  if (!domain) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/domains')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={18} /> Volver a dominios
      </button>

      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-500/10"><Globe size={28} className="text-primary-400" /></div>
            <div>
              <h1 className="text-2xl font-bold text-white">{domain.domain}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={domain.status} />
                <span className="text-sm text-gray-400">Registrado el {formatDate(domain.createdAt)}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={domain.ssl.status === 'issued' ? 'active' : 'inactive'} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Información del Dominio</h3>
          <dl className="space-y-3">
            <div className="flex justify-between"><dt className="text-gray-400">Dominio</dt><dd className="text-white">{domain.domain}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Extensión</dt><dd className="text-white">{domain.tld}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Registro</dt><dd className="text-white">{formatDate(domain.createdAt)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Expira</dt><dd className="text-white">{domain.expiryDate ? formatDate(domain.expiryDate) : '-'}</dd></div>
          </dl>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Servidores DNS</h3>
          <div className="space-y-2">
            {domain.nameservers.map((ns, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-xl"><code className="text-sm text-gray-300">{ns}</code></div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Protección Whois</span>
              <button onClick={() => toggleAction('privacy', 'Privacidad actualizada')} className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${domain.privacy ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                <Shield size={14} /> {domain.privacy ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">DNSSEC</span>
              <button className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${domain.dnssec ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                <Eye size={14} /> {domain.dnssec ? 'Activo' : 'Inactivo'}
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">SSL / HTTPS</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Estado SSL</span>
            <StatusBadge status={domain.ssl.status} />
          </div>
          <button onClick={() => toggleAction('ssl/request', 'SSL solicitado')} className="btn-primary w-full flex items-center justify-center gap-2">
            <Shield size={16} /> Solicitar SSL
          </button>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate(`/dns/${domain.domain}`)} className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all">
              <Globe size={20} className="text-primary-400 mb-2" />
              <p className="text-white text-sm font-medium">Gestionar DNS</p>
              <p className="text-gray-500 text-xs">Configura registros</p>
            </button>
            <button onClick={() => navigate(`/email`)} className="p-4 bg-white/5 rounded-xl text-left hover:bg-white/10 transition-all">
              <Shield size={20} className="text-primary-400 mb-2" />
              <p className="text-white text-sm font-medium">Correos</p>
              <p className="text-gray-500 text-xs">Crea cuentas de correo</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
