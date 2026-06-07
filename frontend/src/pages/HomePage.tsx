import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Globe, Server, Bot, Shield, Cpu, Cloud, Sparkles, ArrowRight, Check, Zap } from 'lucide-react';

const features = [
  { icon: Globe, title: 'Registro de Dominios', description: '.com, .net, .org, .io y más extensiones' },
  { icon: Server, title: 'Hosting Compartido', description: 'Alojamiento rápido y seguro — gratis' },
  { icon: Cpu, title: 'VPS Cloud', description: 'Servidores dedicados sin costo' },
  { icon: Bot, title: 'AI Website Builder', description: 'Crea sitios web con IA en segundos' },
  { icon: Shield, title: 'Seguridad Avanzada', description: 'SSL, DDoS, firewall y monitoreo 24/7' },
  { icon: Cloud, title: 'Cloud Computing', description: 'Infraestructura escalable y redundante' },
];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) navigate('/dashboard');

  return (
    <div className="min-h-screen bg-dark-500">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">CH</span></div>
            <span className="text-white font-bold text-xl">CloudHost</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Iniciar sesión</Link>
            <Link to="/login" className="btn-primary text-sm !py-2">Comenzar gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8">
            <Sparkles size={16} className="text-primary-400" />
            <span className="text-sm text-gray-300">100% gratis, siempre</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tu plataforma <span className="gradient-text">todo-en-uno</span><br />
            completamente gratis
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Dominios, hosting, VPS, AI builder, despliegues y más — todo gratis, sin tarjeta de crédito.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login" className="btn-primary text-lg !px-8 !py-4">
              Comenzar ahora <ArrowRight size={18} className="inline ml-1" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Check size={14} className="text-green-400" /> SSL Gratis</span>
            <span className="flex items-center gap-1"><Check size={14} className="text-green-400" /> 99.9% Uptime</span>
            <span className="flex items-center gap-1"><Check size={14} className="text-green-400" /> Soporte 24/7</span>
            <span className="flex items-center gap-1"><Check size={14} className="text-green-400" /> Sin tarjeta</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Todo lo que necesitas en un solo lugar</h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Infraestructura profesional para proyectos de cualquier tamaño</p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-hover group">
                <div className="p-3 rounded-xl bg-primary-500/10 w-fit mb-4 group-hover:scale-110 transition-transform"><f.icon size={24} className="text-primary-400" /></div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center card-hover !p-12">
          <Bot size={48} className="text-primary-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Crea tu sitio web con IA</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">Describe tu proyecto y nuestra IA generará un sitio web completo, listo para publicar.</p>
          <Link to="/login" className="btn-primary text-lg !px-8 !py-4">
            <Zap size={18} className="inline mr-1" /> Generar mi sitio
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>&copy; 2024 CloudHost. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <Link to="/terms" className="hover:text-gray-300">Términos</Link>
            <Link to="/privacy" className="hover:text-gray-300">Privacidad</Link>
            <Link to="/login" className="hover:text-gray-300">Soporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
