import { Link } from 'react-router-dom';

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-white mb-8">Política de Privacidad y Protección de Datos</h1>
        <p className="text-gray-400 mb-2">Última actualización: 6 de junio de 2026</p>

        <div className="space-y-6 text-gray-300 leading-relaxed mt-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Responsable del Tratamiento</h2>
            <p>CloudHost es el responsable del tratamiento de sus datos personales. Al usar la Plataforma, usted confía sus datos y nos comprometemos a protegerlos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Datos que Recopilamos</h2>
            <p>Recopilamos la siguiente información cuando utiliza nuestros servicios:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Datos de cuenta:</strong> nombre, correo electrónico (asociado a su código de acceso)</li>
              <li><strong>Datos de uso:</strong> dominios registrados, sitios web creados, configuraciones</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo</li>
              <li><strong>Cookies:</strong> utilizamos cookies esenciales para el funcionamiento de la Plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Finalidad del Tratamiento</h2>
            <p>Sus datos se utilizan para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Proporcionar y mantener los servicios contratados</li>
              <li>Gestionar su cuenta y códigos de acceso</li>
              <li>Mejorar la experiencia de usuario</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Base Legal del Tratamiento</h2>
            <p>El tratamiento de sus datos se basa en:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>La ejecución del contrato de servicios</li>
              <li>Su consentimiento explícito</li>
              <li>El interés legítimo de mejorar nuestros servicios</li>
              <li>Obligaciones legales aplicables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Conservación de Datos</h2>
            <p>Conservamos sus datos mientras su cuenta esté activa. Al eliminar su cuenta, sus datos se eliminan en un plazo máximo de 30 días, salvo que la ley exija un período de conservación mayor.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Sus Derechos (RGPD / LOPDGDD)</h2>
            <p>Usted tiene derecho a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Acceso:</strong> solicitar una copia de sus datos personales</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de sus datos ("derecho al olvido")</li>
              <li><strong>Limitación:</strong> restringir el tratamiento de sus datos</li>
              <li><strong>Portabilidad:</strong> recibir sus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos</li>
            </ul>
            <p className="mt-3">Para ejercer sus derechos, contacte a través de la sección de Soporte.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Seguridad de los Datos</h2>
            <p>Implementamos medidas técnicas y organizativas para proteger sus datos contra accesos no autorizados, pérdida o destrucción. Esto incluye cifrado SSL/TLS, firewalls y controles de acceso.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Transferencias Internacionales</h2>
            <p>Sus datos pueden ser procesados en servidores ubicados en diferentes países. Nos aseguramos de que todas las transferencias cumplan con las garantías adecuadas según el RGPD.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Cookies</h2>
            <p>Utilizamos cookies técnicas necesarias para el funcionamiento de la Plataforma. No utilizamos cookies de rastreo de terceros sin su consentimiento explícito.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Cambios en la Política</h2>
            <p>Nos reservamos el derecho de actualizar esta política. Los cambios significativos serán notificados a través de la Plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contacto</h2>
            <p>Para cualquier consulta sobre privacidad o protección de datos, contacte a través de la sección de Soporte en la Plataforma.</p>
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
