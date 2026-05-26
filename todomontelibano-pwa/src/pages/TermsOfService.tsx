import React from 'react';
import { BookOpen, FileText, Trophy, ShieldAlert, AlertCircle, HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/5 rounded-full -mr-8 -mt-8" />
          <div className="absolute left-10 bottom-0 w-24 h-24 bg-blue-500/5 rounded-full -ml-8 -mb-8" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="p-4 bg-green-50 rounded-2xl shrink-0">
              <BookOpen className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                Términos de Servicio
              </h1>
              <p className="text-gray-500 text-lg mt-2">
                Condiciones y normas de uso del Portal de Empleo y Deportes de Montelíbano.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                Última actualización: 20 de Mayo, 2026
              </p>
            </div>
          </div>
        </div>

        {/* Sections Container */}
        <div className="space-y-6">
          
          {/* Sección 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              1. Aceptación de los Términos
            </h2>
            <div className="text-gray-600 space-y-3 leading-relaxed">
              <p>
                Al acceder y utilizar este portal multi-tenant, aceptas cumplir con los presentes Términos de Servicio, así como con todas las leyes y regulaciones vigentes en Colombia y en la administración de Montelíbano. Si no estás de acuerdo con alguna de estas condiciones, debes abstenerte de utilizar nuestros servicios.
              </p>
            </div>
          </div>

          {/* Sección 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-green-600" />
              2. Registro y Cuentas de Usuario
            </h2>
            <div className="text-gray-600 space-y-3 leading-relaxed">
              <p>
                Para acceder a ciertas funciones (como publicar ofertas de trabajo o registrar equipos deportivos), el usuario debe registrarse y mantener una cuenta activa:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
                <li>Te comprometes a suministrar información verídica, exacta y actualizada (nombre, cédula, perfiles profesionales y afiliaciones deportivas).</li>
                <li>El portal distingue entre perfiles de personas (candidatos/jugadores) y empresas/organizadores (managers), otorgando los accesos y permisos correspondientes según el rol verificado.</li>
              </ul>
            </div>
          </div>

          {/* Sección 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-green-600" />
              3. Normas de Uso de los Módulos
            </h2>
            <div className="text-gray-600 space-y-4 leading-relaxed">
              
              <div>
                <h3 className="font-bold text-gray-800 mb-1">A. Módulo de Empleo</h3>
                <p>
                  Las empresas y empleadores autorizados se comprometen a publicar ofertas de trabajo reales, lícitas y con información clara respecto a las condiciones. Los candidatos declaran que la experiencia y habilidades registradas en su currículum son veraces.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-1">B. Módulo de Deportes y Torneos</h3>
                <p>
                  La inscripción de equipos, jugadores y estadísticas debe realizarse de acuerdo con las normativas internas del torneo local y el espíritu del juego limpio (fair play). Los organizadores (managers) tienen los permisos para programar y editar eventos y actas de partidos.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-800 mb-1">C. Módulo de Publicidad y Banners</h3>
                <p>
                  Las imágenes de patrocinio deben contar con los derechos comerciales y no infringir ninguna norma ética o comunitaria. Todos los banners se configuran con una fecha de caducidad estricta (por defecto 30 días si no se especifica). Una vez cumplida dicha fecha, el sistema elimina físicamente el banner de la base de datos de manera automática.
                </p>
              </div>

            </div>
          </div>

          {/* Sección 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-green-600" />
              4. Limitación de Responsabilidad
            </h2>
            <div className="text-gray-600 space-y-3 leading-relaxed">
              <p>
                Este portal opera como una herramienta tecnológica para la comunidad de Montelíbano. Por lo tanto:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>No somos responsables de las decisiones de contratación final de las empresas, ni de las condiciones acordadas en los contratos de trabajo derivados del uso del sitio.</li>
                <li>No nos hacemos responsables de las disputas, lesiones, problemas organizacionales o decisiones técnicas dentro del desarrollo de los torneos deportivos locales.</li>
                <li>El portal no garantiza la disponibilidad ininterrumpida de la PWA ni se responsabiliza de posibles fallas técnicas fuera de su control directo.</li>
              </ul>
            </div>
          </div>

          {/* Sección 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-green-600" />
              5. Modificaciones de los Términos
            </h2>
            <div className="text-gray-600 space-y-3 leading-relaxed">
              <p>
                Nos reservamos el derecho de modificar estos Términos de Servicio en cualquier momento. La fecha de última actualización al principio del documento reflejará los cambios más recientes. El uso continuado del portal después de cualquier modificación constituye la aceptación de los nuevos términos.
              </p>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>© 2026 Portal Multi-tenant de Montelíbano. Todos los derechos reservados.</p>
        </div>

      </div>
    </div>
  );
};

export default TermsOfService;
