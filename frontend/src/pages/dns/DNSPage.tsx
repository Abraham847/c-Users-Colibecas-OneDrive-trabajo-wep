import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import { Activity, Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { DNSRecord } from '../../types';

export default function DNSPage() {
  const { domain: paramDomain } = useParams();
  const [domain, setDomain] = useState(paramDomain || '');
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DNSRecord | null>(null);
  const [form, setForm] = useState({ type: 'A', name: '', value: '', ttl: 3600, priority: 0 });

  const recordTypes = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'];

  const fetchRecords = async () => {
    if (!domain) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/dns/${domain}`);
      setRecords(data.data?.records || []);
    } catch { toast.error('Error al cargar registros DNS'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (domain) fetchRecords(); }, [domain]);

  const handleSave = async () => {
    try {
      const payload = { ...form };
      if (editing) {
        await api.put(`/dns/${domain}/records/${editing._id}`, payload);
        toast.success('Registro actualizado');
      } else {
        await api.post(`/dns/${domain}/records`, payload);
        toast.success('Registro creado');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ type: 'A', name: '', value: '', ttl: 3600, priority: 0 });
      fetchRecords();
    } catch { toast.error('Error al guardar registro'); }
  };

  const handleDelete = async (recordId: string) => {
    try {
      await api.delete(`/dns/${domain}/records/${recordId}`);
      toast.success('Registro eliminado');
      fetchRecords();
    } catch { toast.error('Error al eliminar registro'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">DNS Zone Editor</h1>
          <p className="text-gray-400 mt-1">Gestiona los registros DNS de tus dominios</p>
        </div>
        <div className="flex gap-3">
          <input value={domain} onChange={(e) => setDomain(e.target.value)} className="input-field !w-60" placeholder="ejemplo.com" />
          <button onClick={() => { setEditing(null); setForm({ type: 'A', name: '', value: '', ttl: 3600, priority: 0 }); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} /> Agregar registro
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500" /></div>
      ) : records.length === 0 ? (
        <div className="card text-center py-12"><Activity size={48} className="text-gray-600 mx-auto mb-3" /><p className="text-gray-400">Sin registros DNS. Agrega tu primer registro.</p></div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">Tipo</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">Nombre</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">Valor</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">TTL</th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase px-4 py-3">Prioridad</th>
                <th className="text-right text-xs font-medium text-gray-400 uppercase px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 text-xs font-bold">{r.type}</span></td>
                  <td className="px-4 py-3 text-white text-sm">{r.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm font-mono">{r.value}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{r.ttl}s</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{r.priority || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(r); setForm({ type: r.type, name: r.name, value: r.value, ttl: r.ttl, priority: r.priority || 0 }); setShowModal(true); }} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar registro' : 'Nuevo registro'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Tipo</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              {recordTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Nombre</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="@, www, mail, etc." />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Valor</label>
            <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="input-field" placeholder="Dirección IP, dominio destino, etc." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">TTL (segundos)</label>
              <input type="number" value={form.ttl} onChange={(e) => setForm({ ...form, ttl: parseInt(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Prioridad</label>
              <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) })} className="input-field" />
            </div>
          </div>
          <button onClick={handleSave} className="btn-primary w-full">{editing ? 'Actualizar' : 'Crear'} registro</button>
        </div>
      </Modal>
    </div>
  );
}
