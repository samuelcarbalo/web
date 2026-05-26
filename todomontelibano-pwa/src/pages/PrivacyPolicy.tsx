import React from 'react';
import { Shield, Eye, Lock, Database, UserCheck, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
              <Shield className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                Política de Privacidad
              </h1>
              <p className="text-gray-500 text-lg mt-2">
                Tu privacidad y seguridad son fundamentales para nosotros en la plataforma de Montelíbano.
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
              <Database className="w-6 h-6 text-green-600" />
              1. Información que Recopilamos
            </h2>
            <div className="text-gray-600 space-y-3 leading-relaxed">
              <p>
                Recopilamos información para proporcionar mejores servicios a todos nuestros usuarios. Esto incluye:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-gray-800">Datos del Perfil:</strong> Nombre completo, dirección de correo electrónico, número de teléfono, foto de perfil y tipo de usuario (Persona o Empresa).
                </li>
                <li>
                  <strong className="text-gray-800">Sección de Empleo:</strong> Hojas de vida, historial de experiencia laboral, habilidades e información complementaria que decidas subir para postularte a vacantes.
                </li>
                <li>
                  <strong className="text-gray-800">Sección de Deportes:</strong> Apodos deportivos, cédula (para registro oficial en ligas locales), fecha de nacimiento, estadísticas de juego (goles, tarjetas, partidos jugados) y afiliación a equipos.
                </li>
              </ul>
            </div>
          </div>

          {/* Sección 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-green-600" />
              2. Cómo Utilizamos la Información
            </h2>
            <div className="text-gray-600 space-y-3 leading-relaxed">
              <p>
                Utilizamos los datos recopilados únicamente para los siguientes fines asociados a la aplicación:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Facilitar la postulación a ofertas de trabajo locales, enviando tu perfil directamente a las empresas contratantes.</li>
                <li>Gestionar y organizar los torneos deportivos locales, incluyendo la creación de plantillas de equipos, programación de partidos y estadísticas públicas.</li>
                <li>Monitorear el rendimiento de los banners publicitarios de patrocinadores locales (registrando clicks e impresiones totales de forma agregada sin asociarlos a tu identidad personal).</li>
                <li>Mejorar continuamente las funciones de la aplicación y la experiencia de usuario.</li>
              </ul>
            </div>
          </div>

          {/* Sección 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-green-600" />
              3. Compartición y Divulgación de Datos
            </h2>
            <div className="text-gray-600 space-y-3 leading-relaxed">
              <p>
                No vendemos ni comercializamos tus datos personales. Tu información solo se comparte en las siguientes condiciones explícitas de la aplicación:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong className="text-gray-800">Con Empresas Contratantes:</strong> Al postularte a un empleo, la empresa que publicó la oferta tendrá acceso a tu información de contacto y currículum.
                </li>
                <li>
                  <strong className="text-gray-800">Información Deportiva Pública:</strong> Por la naturaleza de las competiciones locales, los nombres de jugadores, sus estadísticas, lineups y resultados de partidos son accesibles de forma pública para la comunidad que sigue la liga.
                </li>
              </ul>
            </div>
          </div>

          {/* Sección 4 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-green-600" />
              4. Seguridad y Retención de Datos
            </h2>
            <div className="text-gray-600 space-y-3 leading-relaxed">
              <p>
                Implementamos medidas de seguridad técnicas para proteger tus datos contra acceso no autorizado, alteración o pérdida.
              </p>
              <p>
                Los datos se conservan mientras tu cuenta esté activa. Los anuncios publicitarios (banners) tienen una vigencia máxima programada en la base de datos (por defecto 30 días) y se eliminan del sistema de forma automática al expirar su fecha de caducidad.
              </p>
            </div>
          </div>

          {/* Sección 5 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-green-600" />
              5. Contacto y Derechos ARCO
            </h2>
            <div className="text-gray-600 space-y-3 leading-relaxed">
              <p>
                Tienes derecho a acceder, rectificar, limitar o solicitar la eliminación total de tus datos personales en cualquier momento.
              </p>
              <p>
                Si tienes preguntas sobre esta política o deseas solicitar la baja definitiva de tu cuenta y datos personales, por favor contáctanos a través del correo de administración del portal de Montelíbano o el módulo de soporte de la alcaldía.
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

export default PrivacyPolicy;
