import { useState } from 'react';
import api from '../../services/api';
import { Search, Check, X, Globe, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface DomainResult {
  domain: string;
  available: boolean;
  tld: string;
}

export default function DomainSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DomainResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const { data } = await api.get('/domains/search', { params: { domain: query } });
      setResults(data.data || []);
      setSearched(true);
    } catch {
      toast.error('Error al buscar dominios');
    } finally {
      setSearching(false);
    }
  };

  const handleRegister = async (domain: string) => {
    setRegistering(domain);
    try {
      await api.post('/domains/register', { domain, period: 1 });
      toast.success(`${domain} registrado exitosamente`);
      setResults(prev => prev.map(r => r.domain === domain ? { ...r, available: false } : r));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al registrar');
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Buscar Dominios</h1>
        <p className="text-gray-400 mt-1">Encuentra el dominio perfecto para tu proyecto</p>
      </div>

      <form onSubmit={handleSearch} className="card">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field !pl-12 !py-4 text-lg"
              placeholder="Ingresa un dominio (ej: miproyecto)"
            />
          </div>
          <button type="submit" disabled={searching} className="btn-primary flex items-center gap-2">
            {searching ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
            Buscar
          </button>
        </div>
      </form>

      {searched && results.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-400">No se encontraron resultados</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r) => (
            <div key={r.domain} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${r.available ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {r.available ? <Check size={20} className="text-green-400" /> : <X size={20} className="text-red-400" />}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">{r.domain}</p>
                  <p className="text-sm text-gray-400">
                    {r.available ? 'Disponible' : 'No disponible'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {r.available && (
                  <button
                    onClick={() => handleRegister(r.domain)}
                    disabled={registering === r.domain}
                    className="btn-primary flex items-center gap-2"
                  >
                    {registering === r.domain ? <Loader className="animate-spin" size={16} /> : <Globe size={16} />}
                    Registrar gratis
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
