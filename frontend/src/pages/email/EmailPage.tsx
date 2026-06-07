import { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { Mail, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatBytes } from '../../utils/format';

interface EmailAccount {
  _id: string;
  email: string;
  name: string;
  quota: number;
  used: number;
  status: string;
}

export default function EmailPage() {
  const [emails, setEmails] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '', quota: 1073741824 });

  const fetchEmails = async () => {
    try {
      const { data } = await api.get('/emails');
      setEmails(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEmails(); }, []);

  const handleCreate = async () => {
    try {
      await api.post('/emails', form);
      toast.success('Correo creado exitosamente');
      setShowModal(false);
      setForm({ email: '', password: '', name: '', quota: 1073741824 });
      fetchEmails();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear correo');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/emails/${id}`);
      toast.success('Correo eliminado');
      fetchEmails();
    } catch { toast.error('Error al eliminar'); }
  };

  const columns = [
    { key: 'email', label: 'Correo', render: (e: EmailAccount) => <span className="text-white font-medium">{e.email}</span> },
    { key: 'name', label: 'Nombre', render: (e: EmailAccount) => <span className="text-gray-400">{e.name}</span> },
    { key: 'quota', label: 'Almacenamiento', render: (e: EmailAccount) => <span className="text-gray-400">{formatBytes(e.used)} / {formatBytes(e.quota)}</span> },
    { key: 'status', label: 'Estado', render: (e: EmailAccount) => <StatusBadge status={e.status} /> },
    { key: 'actions', label: 'Acciones', render: (e: EmailAccount) => (
      <button onClick={() => handleDelete(e._id)} className="text-red-400 hover:text-red-300 text-sm">Eliminar</button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Correos Empresariales</h1>
          <p className="text-gray-400 mt-1">Gestiona tus cuentas de correo profesional</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Crear correo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500" /></div>
      ) : emails.length === 0 ? (
        <div className="card text-center py-12">
          <Mail size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hay cuentas de correo</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Crear primera cuenta</button>
        </div>
      ) : (
        <DataTable columns={columns} data={emails} />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Crear cuenta de correo">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Correo electrónico</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="tu@dominio.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Nombre</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Tu nombre" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Contraseña</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Contraseña segura" />
          </div>
          <button onClick={handleCreate} className="btn-primary w-full">Crear cuenta</button>
        </div>
      </Modal>
    </div>
  );
}
