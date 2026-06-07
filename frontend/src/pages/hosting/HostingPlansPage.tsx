import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Check, ArrowRight, Server, Cpu, HardDrive, Wifi } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Plan } from '../../types';

export default function HostingPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hosting/plans', { params: { type: 'shared' } }).then(r => setPlans(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: string) => {
    try {
      await api.post('/hosting/subscribe', { planId, interval: 'monthly' });
      toast.success('Plan contratado exitosamente');
      navigate('/hosting');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al contratar plan');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Hosting Gratuito</h1>
        <p className="text-gray-400 mt-2">Alojamiento web sin costo, siempre</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className={`relative card-hover ${plan.popular ? 'border-primary-500/50 ring-1 ring-primary-500/20' : ''}`}>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-3">
                <span className="text-4xl font-bold text-green-400">Gratis</span>
              </div>
            </div>
            <div className="flex justify-around mb-6 text-center text-sm">
              <div><Cpu size={18} className="text-primary-400 mx-auto mb-1" /><p className="text-gray-400">{plan.resources.cpu} CPU</p></div>
              <div><Server size={18} className="text-primary-400 mx-auto mb-1" /><p className="text-gray-400">{plan.resources.ram}MB RAM</p></div>
              <div><HardDrive size={18} className="text-primary-400 mx-auto mb-1" /><p className="text-gray-400">{plan.resources.storage / 1073741824}GB</p></div>
              <div><Wifi size={18} className="text-primary-400 mx-auto mb-1" /><p className="text-gray-400">{plan.resources.bandwidth / 1073741824}GB</p></div>
            </div>
            <ul className="space-y-2 mb-8">
              {Object.entries(plan.features).map(([key, value]) => (
                <li key={key} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check size={16} className="text-green-400 flex-shrink-0" /> {key}: {typeof value === 'boolean' ? (value ? 'Incluido' : 'No incluido') : value}
                </li>
              ))}
            </ul>
            <button onClick={() => handleSubscribe(plan._id)} className="w-full py-3 rounded-xl font-semibold text-center transition-all gradient-bg text-white">
              Activar gratis <ArrowRight size={16} className="inline ml-1" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
