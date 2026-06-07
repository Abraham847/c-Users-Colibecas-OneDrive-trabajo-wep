import { useState } from 'react';
import { CheckCircle, ExternalLink, Copy, ArrowRight, Shield, Globe, CreditCard, Server, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const steps = [
  {
    id: 'stripe',
    title: 'Stripe - Pagos',
    icon: CreditCard,
    color: 'from-purple-500 to-indigo-500',
    description: 'Cuenta de Stripe para recibir pagos reales',
    url: 'https://dashboard.stripe.com/register',
    fields: [
      { key: 'STRIPE_SECRET_KEY', label: 'Secret Key', placeholder: 'sk_live_...', secret: true },
      { key: 'STRIPE_PUBLISHABLE_KEY', label: 'Publishable Key', placeholder: 'pk_live_...' },
      { key: 'STRIPE_WEBHOOK_SECRET', label: 'Webhook Secret', placeholder: 'whsec_...' },
    ],
    instructions: [
      'Crea una cuenta en stripe.com',
      'Ve a Developers → API Keys',
      'Copia la Secret Key y Publishable Key',
      'En Webhooks, crea un endpoint apuntando a tu-dominio.com/api/webhooks/stripe',
      'Selecciona los eventos: checkout.session.completed, invoice.paid, customer.subscription.updated',
    ],
  },
  {
    id: 'hetzner',
    title: 'Hetzner Cloud - VPS',
    icon: Server,
    color: 'from-red-500 to-orange-500',
    description: 'API de Hetzner para crear servidores VPS reales',
    url: 'https://console.hetzner.cloud/',
    fields: [
      { key: 'HETZNER_API_TOKEN', label: 'API Token', placeholder: 'xxxxxxxxxxxxxxx', secret: true },
    ],
    instructions: [
      'Crea una cuenta en hetzner.cloud',
      'Ve a Security → API Tokens',
      'Crea un token con permisos de Read & Write',
      'Copia el token y pégalo aquí',
    ],
  },
  {
    id: 'namecheap',
    title: 'Namecheap - Dominios',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    description: 'API de Namecheap para registrar dominios reales',
    url: 'https://www.namecheap.com/myaccount/access/',
    fields: [
      { key: 'NAMECHEAP_API_USER', label: 'API User', placeholder: 'Tu usuario de Namecheap' },
      { key: 'NAMECHEAP_API_KEY', label: 'API Key', placeholder: 'Tu API key' },
      { key: 'NAMECHEAP_CLIENT_IP', label: 'IP Autorizada', placeholder: 'Tu IP pública' },
    ],
    instructions: [
      'Crea una cuenta en namecheap.com',
      'Ve a Profile → Tools → API Access',
      'Habilita el acceso API',
      'Agrega tu IP pública a la whitelist',
      'Copia tu API User y API Key',
    ],
  },
];

export default function SetupPage() {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedStep, setExpandedStep] = useState<string | null>('stripe');

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(`process.env.${key}=`);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración del Sistema</h1>
        <p className="text-gray-400 mt-1">Configura las APIs para que todo funcione de verdad</p>
      </div>

      {/* Warning */}
      <div className="card bg-yellow-500/5 border-yellow-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-yellow-400 mt-0.5" />
          <div>
            <h3 className="text-white font-semibold">Configuración necesaria</h3>
            <p className="text-sm text-gray-400 mt-1">
              Para que la plataforma funcione con servicios reales (pagos, VPS, dominios),
              necesitas crear cuentas en estos proveedores y configurar sus API keys en el archivo <code className="text-primary-400">.env</code> del backend.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isExpanded = expandedStep === step.id;
          const isCompleted = completedSteps.has(step.id);

          return (
            <div key={step.id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                    <step.icon size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{step.title}</h3>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isCompleted && <CheckCircle size={20} className="text-green-400" />}
                  <ArrowRight size={18} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                  {/* Instructions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Pasos:</h4>
                    <ol className="space-y-1.5">
                      {step.instructions.map((instruction, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="text-primary-400 font-bold">{i + 1}.</span>
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* API Link */}
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm"
                  >
                    Abrir panel de {step.title.split(' - ')[0]} <ExternalLink size={14} />
                  </a>

                  {/* Fields */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-300">API Keys:</h4>
                    {step.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                        <div className="flex gap-2">
                          <input
                            type={field.secret ? 'password' : 'text'}
                            className="input-field flex-1 font-mono text-sm"
                            placeholder={field.placeholder}
                            readOnly
                          />
                          <button
                            onClick={() => handleCopyKey(field.key)}
                            className="btn-secondary text-sm px-3 flex items-center gap-1"
                          >
                            <Copy size={14} /> Copiar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Env file example */}
                  <div className="bg-dark-700 rounded-xl p-4">
                    <h4 className="text-xs text-gray-500 mb-2">Agrega en tu archivo .env del backend:</h4>
                    <code className="text-xs text-green-400 block whitespace-pre-wrap">
{step.fields.map(f => `${f.key}=tu_valor_aqui`).join('\n')}
                    </code>
                  </div>

                  <button
                    onClick={() => {
                      setCompletedSteps(prev => new Set(prev).add(step.id));
                      toast.success(`${step.title} marcado como configurado`);
                    }}
                    className="btn-primary text-sm"
                  >
                    {isCompleted ? '✓ Configurado' : 'Marcar como configurado'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-3">Después de configurar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/5 rounded-xl">
            <CreditCard size={20} className="text-purple-400 mb-2" />
            <h4 className="text-white text-sm font-medium">Pagos reales</h4>
            <p className="text-xs text-gray-500 mt-1">Los usuarios pagan con tarjeta o PayPal</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <Server size={20} className="text-red-400 mb-2" />
            <h4 className="text-white text-sm font-medium">VPS automáticos</h4>
            <p className="text-xs text-gray-500 mt-1">Se crean servidores reales en Hetzner</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl">
            <Globe size={20} className="text-blue-400 mb-2" />
            <h4 className="text-white text-sm font-medium">Dominios reales</h4>
            <p className="text-xs text-gray-500 mt-1">Registro y gestión vía Namecheap</p>
          </div>
        </div>
      </div>

      {/* Restart instruction */}
      <div className="card bg-primary-500/5 border-primary-500/20">
        <p className="text-sm text-gray-300">
          Después de configurar las API keys, <strong className="text-white">reinicia el backend</strong> para que los cambios tomen efecto.
        </p>
      </div>
    </div>
  );
}
