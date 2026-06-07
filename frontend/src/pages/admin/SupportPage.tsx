import { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import { HelpCircle, Plus, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatRelativeTime } from '../../utils/format';
import type { SupportTicket } from '../../types';

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [form, setForm] = useState({ subject: '', category: 'technical', message: '' });
  const [reply, setReply] = useState('');

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/support');
      setTickets(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async () => {
    try {
      await api.post('/support', form);
      toast.success('Ticket creado');
      setShowModal(false);
      setForm({ subject: '', category: 'technical', message: '' });
      fetchTickets();
    } catch { toast.error('Error al crear ticket'); }
  };

  const handleReply = async (ticketId: string) => {
    if (!reply.trim()) return;
    try {
      await api.post(`/support/${ticketId}/messages`, { message: reply });
      toast.success('Respuesta enviada');
      setReply('');
      fetchTickets();
    } catch { toast.error('Error al enviar'); }
  };

  const handleClose = async (ticketId: string) => {
    try {
      await api.put(`/support/${ticketId}/close`, { rating: 5 });
      toast.success('Ticket cerrado');
      setSelectedTicket(null);
      fetchTickets();
    } catch { toast.error('Error al cerrar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Soporte Técnico</h1>
          <p className="text-gray-400 mt-1">Gestiona tus tickets de soporte</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Nuevo ticket
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500" /></div>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-12">
          <HelpCircle size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Sin tickets de soporte</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Crear ticket</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="card-hover cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/10"><MessageSquare size={18} className="text-primary-400" /></div>
                  <div>
                    <p className="text-white font-medium">{ticket.subject}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={ticket.status} size="sm" />
                      <span className="text-xs text-gray-500 capitalize">{ticket.category}</span>
                      <span className="text-xs text-gray-500">{formatRelativeTime(ticket.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{ticket.messages?.length || 0} mensajes</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo ticket de soporte">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Asunto</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" placeholder="Describe tu problema" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Categoría</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              <option value="technical">Técnico</option>
              <option value="billing">Facturación</option>
              <option value="domain">Dominios</option>
              <option value="hosting">Hosting</option>
              <option value="security">Seguridad</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Mensaje</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field min-h-[120px]" placeholder="Describe tu problema en detalle" />
          </div>
          <button onClick={handleCreate} className="btn-primary w-full">Enviar ticket</button>
        </div>
      </Modal>

      {selectedTicket && (
        <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={selectedTicket.subject} size="lg">
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedTicket.messages?.map((msg, i) => (
              <div key={i} className={`p-4 rounded-xl ${msg.senderRole === 'user' ? 'bg-primary-500/10 ml-8' : msg.senderRole === 'ai' ? 'bg-green-500/5' : 'glass mr-8'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-400 capitalize">{msg.senderRole === 'user' ? 'Tú' : msg.senderRole === 'ai' ? 'AI Asistente' : 'Soporte'}</span>
                  <span className="text-xs text-gray-600">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.message}</p>
              </div>
            ))}

            {selectedTicket.status !== 'closed' && (
              <div className="space-y-3 pt-3 border-t border-white/5">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} className="input-field min-h-[80px]" placeholder="Escribe tu respuesta..." />
                <div className="flex gap-2">
                  <button onClick={() => handleReply(selectedTicket._id)} className="btn-primary text-sm">Enviar respuesta</button>
                  <button onClick={() => handleClose(selectedTicket._id)} className="btn-secondary text-sm">Cerrar ticket</button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
