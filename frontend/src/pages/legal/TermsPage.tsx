import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-500">
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">CH</span></div>
            <span className="text-white font-bold text-xl">CloudHost</span>
          </Link>
          <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Iniciar sesión</Link>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Términos de Uso</h1>
        <p className="text-gray-400 mb-2">Última actualización: 6 de junio de 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed mt-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y usar CloudHost ("la Plataforma"), usted acepta estar sujeto a estos Términos de Uso. Si no está de acuerdo, no use la Plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Descripción del Servicio</h2>
            <p>CloudHost ofrece servicios de hosting, registro de dominios, VPS, AI Website Builder y herramientas cloud de forma completamente gratuita. La Plataforma se proporciona "tal cual" y puede ser modificada en cualquier momento.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cuentas de Usuario</h2>
            <p>Para acceder a los servicios, debe crear una cuenta mediante un código de acceso. Usted es responsable de mantener la confidencialidad de su código y de todas las actividades que ocurran bajo su cuenta.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Máximo 20 dominios por usuario</li>
              <li>Uso aceptable: no está permitido usar el servicio para actividades ilegales</li>
              <li>Nos reservamos el derecho de suspender cuentas que violen estos términos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Uso Aceptable</h2>
            <p>Usted acepta no usar la Plataforma para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Actividades ilegales o fraudulentas</li>
              <li>Distribuir malware, spam o contenido dañino</li>
              <li>Infringir derechos de propiedad intelectual</li>
              <li>Sobrecargar o interrumpir los servidores</li>
              <li>Almacenar o distribuir contenido ilegal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Propiedad Intelectual</h2>
            <p>Todo el contenido generado por la IA en CloudHost pertenece al usuario que lo creó. La Plataforma y su código subyacente son propiedad de CloudHost.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Limitación de Responsabilidad</h2>
            <p>CloudHost no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de usar la Plataforma. Los servicios se proporcionan sin garantía de ningún tipo.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados en la Plataforma. El uso continuado después de los cambios constituye la aceptación de los nuevos términos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contacto</h2>
            <p>Para preguntas sobre estos términos, puede contactarnos a través de la sección de Soporte en la Plataforma.</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>&copy; 2026 CloudHost. Todos los derechos reservados.</span>
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
