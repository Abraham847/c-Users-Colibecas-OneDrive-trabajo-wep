import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Cpu, Check, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Plan } from '../../types';

export default function VPSPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hosting/plans', { params: { type: 'vps' } }).then(r => setPlans(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      await api.post('/hosting/subscribe', { planId, interval: 'monthly' });
      toast.success('VPS contratado exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al contratar VPS');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full mb-4">
          <Cpu size={16} className="text-primary-400" />
          <span className="text-sm text-gray-300">Cloud VPS Gratis</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Servidores VPS Cloud</h1>
        <p className="text-gray-400 mt-2">Recursos dedicados sin costo</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="card-hover">
            <div className="text-center mb-6">
              <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Cpu size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-3">
                <span className="text-4xl font-bold text-green-400">Gratis</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(plan.resources).filter(([k]) => !['websites', 'databases', 'emails', 'subdomains'].includes(k)).map(([key, value]) => (
                <div key={key} className="text-center p-2 bg-white/5 rounded-xl">
                  <p className="text-white font-bold">{(value / (key === 'storage' || key === 'bandwidth' ? 1073741824 : 1)).toFixed(0)}{key === 'storage' || key === 'bandwidth' ? 'GB' : key === 'ram' ? 'MB' : ''}</p>
                  <p className="text-xs text-gray-500 capitalize">{key}</p>
                </div>
              ))}
            </div>
            <ul className="space-y-2 mb-8">
              {Object.entries(plan.features).map(([key, value]) => (
                <li key={key} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-green-400 flex-shrink-0" /> {key}
                </li>
              ))}
            </ul>
            <button onClick={() => handleSubscribe(plan._id)} className="btn-primary w-full flex items-center justify-center gap-2">
              Activar gratis <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
