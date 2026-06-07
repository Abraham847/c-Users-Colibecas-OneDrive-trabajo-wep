import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Rocket, ExternalLink, Trash2, RefreshCw, Folder, Globe, Eye, Copy, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/format';

interface Deployment {
  _id: string;
  name: string;
  slug: string;
  sourceDir: string;
  url: string;
  publicUrl: string;
  status: string;
  customDomain?: string;
  ssl: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface FolderItem {
  name: string;
  path: string;
  type: string;
}

interface TldOption {
  tld: string;
  description: string;
}

export default function DeploymentsPage() {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [sourceDir, setSourceDir] = useState('');
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  // Domain selection state
  const [domainName, setDomainName] = useState('');
  const [selectedTld, setSelectedTld] = useState('.com');
  const [tlds, setTlds] = useState<TldOption[]>([]);

  // Target selection
  const [deployTarget, setDeployTarget] = useState<'local' | 'github'>('github');

  const fetchDeployments = async () => {
    try {
      const { data } = await api.get('/deployments');
      setDeployments(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const fetchFolders = async () => {
    try {
      const { data } = await api.get('/files/list', { params: { dir: '' } });
      const dirs = (data.data || []).filter((f: FolderItem) => f.type === 'directory');
      setFolders(dirs);
    } catch { /* ignore */ }
  };

  const fetchTlds = async () => {
    try {
      const { data } = await api.get('/domains/tlds');
      setTlds(data.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchDeployments(); fetchTlds(); }, []);

  const handleDeploy = async () => {
    if (!projectName.trim() || !sourceDir.trim()) {
      toast.error('Nombre y directorio requeridos');
      return;
    }
    setDeploying(true);
    try {
      const body: any = { name: projectName, sourceDir, target: deployTarget };
      if (domainName.trim()) {
        body.domain = domainName.trim().toLowerCase();
        if (deployTarget === 'local') {
          body.tld = selectedTld;
        } else if (deployTarget === 'github') {
          body.tld = 'duckdns';
        }
      }
      const { data } = await api.post('/deployments', body);
      if (data.success) {
        toast.success('Proyecto desplegado exitosamente');
        setShowDeployModal(false);
        setProjectName('');
        setSourceDir('');
        setDomainName('');
        fetchDeployments();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al desplegar');
    } finally {
      setDeploying(false);
    }
  };

  const handleRedeploy = async (id: string) => {
    try {
      await api.post(`/deployments/${id}/redeploy`);
      toast.success('Redesplegado exitosamente');
      fetchDeployments();
    } catch { toast.error('Error al redesplegar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este despliegue?')) return;
    try {
      await api.delete(`/deployments/${id}`);
      toast.success('Despliegue eliminado');
      fetchDeployments();
    } catch { toast.error('Error al eliminar'); }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada');
  };

  const handleSetDomain = async () => {
    if (!customDomain.trim()) return;
    try {
      await api.put(`/deployments/${selectedId}/domain`, { domain: customDomain });
      toast.success('Dominio personalizado configurado');
      setShowDomainModal(false);
      setCustomDomain('');
      fetchDeployments();
    } catch { toast.error('Error al configurar dominio'); }
  };

  const openDeployModal = () => {
    fetchFolders();
    setProjectName('');
    setSourceDir('');
    setDomainName('');
    setSelectedTld('.com');
    setDeployTarget('github');
    setShowDeployModal(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mis Despliegues</h1>
          <p className="text-gray-400 mt-1">Publica y gestiona tus sitios web en vivo</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/files')} className="btn-secondary text-sm flex items-center gap-2">
            <Folder size={16} /> Administrador de Archivos
          </button>
          <button onClick={openDeployModal} className="btn-primary text-sm flex items-center gap-2">
            <Rocket size={16} /> Desplegar proyecto
          </button>
        </div>
      </div>

      {deployments.length === 0 ? (
        <div className="card text-center py-16">
          <Rocket size={64} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Sin despliegues</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">Sube tus archivos al administrador de archivos y despliega tu proyecto web para que sea accesible en internet</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => navigate('/files')} className="btn-secondary flex items-center gap-2">
              <Folder size={16} /> Subir archivos
            </button>
            <button onClick={openDeployModal} className="btn-primary flex items-center gap-2">
              <Rocket size={16} /> Desplegar ahora
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {deployments.map((dep) => (
            <div key={dep._id} className="card-hover">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <Globe size={22} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{dep.name}</h3>
                      <StatusBadge status={dep.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 font-mono truncate max-w-xs">{dep.publicUrl}</span>
                      <button onClick={() => handleCopyUrl(dep.publicUrl)} className="text-gray-500 hover:text-white">
                        <Copy size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>Creado: {formatDate(dep.createdAt)}</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {dep.views} visitas</span>
                      {dep.customDomain && <span className="text-primary-400">{dep.customDomain}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a href={dep.publicUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm flex items-center gap-1">
                    <ExternalLink size={14} /> Ver sitio
                  </a>
                  <button onClick={() => handleRedeploy(dep._id)} className="btn-secondary text-sm flex items-center gap-1" title="Redesplegar">
                    <RefreshCw size={14} />
                  </button>
                  <button onClick={() => { setSelectedId(dep._id); setShowDomainModal(true); }} className="btn-secondary text-sm flex items-center gap-1" title="Dominio personalizado">
                    <Globe size={14} />
                  </button>
                  <button onClick={() => handleDelete(dep._id)} className="text-gray-400 hover:text-red-400 p-2 rounded hover:bg-red-500/10" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deploy Modal */}
      <Modal isOpen={showDeployModal} onClose={() => setShowDeployModal(false)} title="Desplegar proyecto web" size="lg">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre del proyecto</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="input-field"
              placeholder="Mi sitio web"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Destino de publicación</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDeployTarget('local')}
                className={`flex-1 p-3 rounded-xl text-sm text-center transition-all ${
                  deployTarget === 'local'
                    ? 'bg-primary-500/20 border border-primary-500/50 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Rocket size={18} className="mx-auto mb-1" />
                Local (localhost)
              </button>
              <button
                onClick={() => setDeployTarget('github')}
                className={`flex-1 p-3 rounded-xl text-sm text-center transition-all ${
                  deployTarget === 'github'
                    ? 'bg-primary-500/20 border border-primary-500/50 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] mx-auto mb-1">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub Pages
              </button>
            </div>
            {deployTarget === 'github' && (
              <p className="text-xs text-gray-500 mt-1.5">
                El proyecto se publicará en <code className="text-primary-400">https://tu-usuario.github.io/{projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}</code>
              </p>
            )}
            {deployTarget === 'github' && (
              <div className="mt-3 p-3 bg-white/5 rounded-xl">
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Dominio gratis con DuckDNS <span className="text-gray-500">(opcional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Registrá un subdominio <code className="text-primary-400">.duckdns.org</code> gratis</p>
                <div className="flex gap-2">
                  <input
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value.replace(/[^a-z0-9-]/gi, ''))}
                    className="input-field flex-1"
                    placeholder="miproyecto"
                  />
                  <div className="flex items-center px-3 bg-white/10 rounded-xl text-white font-mono text-sm whitespace-nowrap">
                    .duckdns.org
                  </div>
                </div>
                {domainName.trim() && (
                  <div className="mt-2 text-xs text-gray-400">
                    Tu sitio: <span className="text-primary-400 font-semibold">{domainName.toLowerCase()}.duckdns.org</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Directorio fuente (carpeta del proyecto)</label>
            <p className="text-xs text-gray-500 mb-2">Selecciona la carpeta que contiene tu sitio web (index.html, etc.)</p>

            {folders.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {folders.map((folder) => (
                  <button
                    key={folder.path}
                    onClick={() => setSourceDir(folder.path)}
                    className={`p-3 rounded-xl text-left text-sm transition-all ${
                      sourceDir === folder.path
                        ? 'bg-primary-500/20 border border-primary-500/50 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Folder size={16} className={sourceDir === folder.path ? 'text-primary-400' : 'text-gray-500'} />
                    <p className="mt-1 font-medium truncate">{folder.name}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white/5 rounded-xl">
                <Folder size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm mb-2">No hay carpetas. Sube archivos primero.</p>
                <button onClick={() => { setShowDeployModal(false); navigate('/files'); }} className="btn-secondary text-sm">
                  Ir al Administrador de Archivos
                </button>
              </div>
            )}

            <input
              value={sourceDir}
              onChange={(e) => setSourceDir(e.target.value)}
              className="input-field mt-2"
              placeholder="O escribe la ruta manualmente (ej: mi-proyecto)"
            />
          </div>

          {deployTarget === 'local' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Dominio personalizado <span className="text-gray-500">(opcional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Elige un nombre y extensión para tu sitio.</p>

            <div className="flex gap-2 mb-3">
              <input
                value={domainName}
                onChange={(e) => setDomainName(e.target.value.replace(/[^a-z0-9-]/gi, ''))}
                className="input-field flex-1"
                placeholder="miproyecto"
              />
              <div className="flex items-center px-3 bg-white/10 rounded-xl text-white font-mono text-sm whitespace-nowrap">
                {selectedTld}
              </div>
            </div>

            {domainName.trim() && (
              <div className="mb-3 px-3 py-2 bg-primary-500/10 border border-primary-500/20 rounded-lg text-sm">
                <span className="text-gray-400">Tu dominio será: </span>
                <span className="text-white font-semibold">{domainName.toLowerCase()}{selectedTld}</span>
              </div>
            )}

            {tlds.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Extensiones disponibles:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
                  {tlds.map((tld) => (
                    <button
                      key={tld.tld}
                      onClick={() => setSelectedTld(tld.tld)}
                      className={`p-2 rounded-lg text-xs text-center transition-all ${
                        selectedTld === tld.tld
                          ? 'bg-primary-500/20 border border-primary-500/50 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-mono">{tld.tld}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="text-sm font-medium text-white mb-2">Requisitos del proyecto:</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>Tu carpeta debe contener un archivo <code className="text-primary-400">index.html</code></li>
              <li>Puedes incluir CSS, JS, imágenes y otros archivos</li>
              <li>Después de desplegar, tu sitio estará disponible en una URL pública</li>
            </ul>
          </div>

          <button
            onClick={handleDeploy}
            disabled={deploying || !projectName.trim() || !sourceDir.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {deploying ? (
              <><RefreshCw size={16} className="animate-spin" /> Desplegando...</>
            ) : (
              <><Rocket size={16} /> Desplegar proyecto</>
            )}
          </button>
        </div>
      </Modal>

      {/* Domain Modal */}
      <Modal isOpen={showDomainModal} onClose={() => setShowDomainModal(false)} title="Dominio personalizado">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Dominio personalizado</label>
            <input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} className="input-field" placeholder="midominio.com" />
          </div>
          <button onClick={handleSetDomain} className="btn-primary w-full">Configurar dominio</button>
        </div>
      </Modal>
    </div>
  );
}
