import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Calendar, 
  Trophy, 
  House, 
  ArrowRight, 
  CheckCircle2,
  Users,
  Building2,
  Star
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const services = [
    {
      icon: Briefcase,
      title: 'Empleos',
      description: 'Encuentra oportunidades laborales en Montelibano y zona bananera. Publica vacantes si eres empresa.',
      color: 'bg-blue-500',
      active: true,
      path: '/jobs',
      stats: '100+ empleos activos'
    },
    {
      icon: Calendar,
      title: 'Eventos',
      description: 'Descubre eventos sociales, culturales y de networking en la región.',
      color: 'bg-purple-500',
      active: false,
      comingSoon: true,
      path: '#',
      stats: 'Próximamente'
    },
    {
      icon: Trophy,
      title: 'Deportes',
      description: 'Ligas de fútbol, softbol y otros deportes. Organiza torneos o encuentra equipos.',
      color: 'bg-green-500',
      active: false,
      comingSoon: true,
      path: '#',
      stats: 'Próximamente'
    },
    {
      icon: House,
      title: 'Bienes Raíces',
      description: 'Casas, apartamentos, locales y terrenos en venta y arriendo en Montelibano.',
      color: 'bg-orange-500',
      active: false,
      comingSoon: true,
      path: '#',
      stats: 'Próximamente'
    },
  ];

  const features = [
    'Multi-tenant: Una plataforma, múltiples organizaciones',
    'Autenticación segura con roles diferenciados',
    'Planes de suscripción flexibles',
    'Notificaciones en tiempo real',
    'Diseño responsive y PWA',
    'Optimizado para velocidad',
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
              Todo lo que necesitas
              <span className="block text-primary-600">en un solo lugar</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              La plataforma integral de Montelibano. Encuentra empleos, eventos, 
              deportes y bienes raíces en la palma de tu mano.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 flex items-center">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center">
                    Comenzar gratis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link to="/jobs" className="btn-secondary text-lg px-8 py-4">
                    Ver empleos
                  </Link>
                </>
              )}
            </div>
            
            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center text-primary-600 mb-2">
                  <Users className="w-6 h-6 mr-2" />
                  <span className="text-3xl font-bold">500+</span>
                </div>
                <span className="text-sm text-gray-600">Usuarios activos</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center text-primary-600 mb-2">
                  <Building2 className="w-6 h-6 mr-2" />
                  <span className="text-3xl font-bold">50+</span>
                </div>
                <span className="text-sm text-gray-600">Empresas</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center text-primary-600 mb-2">
                  <Briefcase className="w-6 h-6 mr-2" />
                  <span className="text-3xl font-bold">100+</span>
                </div>
                <span className="text-sm text-gray-600">Empleos activos</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center text-primary-600 mb-2">
                  <Star className="w-6 h-6 mr-2" />
                  <span className="text-3xl font-bold">4.8</span>
                </div>
                <span className="text-sm text-gray-600">Calificación</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Nuestros Servicios</h2>
            <p className="mt-4 text-lg text-gray-600">
              TodoMontelibano conecta a la comunidad con múltiples servicios en una sola plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div 
                key={service.title}
                className={`relative bg-white rounded-2xl shadow-sm border-2 p-6 transition-all hover:shadow-lg
                  ${service.active ? 'border-transparent hover:border-primary-200' : 'border-gray-200 opacity-75'}`}
              >
                {service.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      Pronto
                    </span>
                  </div>
                )}
                
                <div className={`w-14 h-14 ${service.color} rounded-xl flex items-center justify-center mb-4`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-medium text-primary-600">{service.stats}</span>
                  {service.active ? (
                    <Link 
                      to={service.path}
                      className="flex items-center text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      Explorar
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">Próximamente</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir TodoMontelibano?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nuestra plataforma está diseñada pensando en las necesidades de la comunidad de Montelibano, 
                ofreciendo una experiencia unificada para todos los servicios.
              </p>
              
              <ul className="space-y-4">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Link to="/register" className="btn-primary inline-flex items-center">
                  Crear cuenta gratuita
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 aspect-[4/3]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <span className="text-4xl font-bold">T</span>
                    </div>
                    <p className="text-lg font-medium">TodoMontelibano App</p>
                    <p className="text-sm text-gray-300 mt-2">Disponible para iOS y Android</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Únete a la comunidad de TodoMontelibano y descubre todas las oportunidades que tenemos para ti.
            </p>
            <div className="flex justify-center gap-4">
              <Link 
                to="/register" 
                // Cambiado a bg-blue-600 y text-white
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Registrarse gratis
              </Link>
              <Link 
                to="/jobs" 
                // Cambiado a bg-blue-600 y text-white
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors border border-blue-400"
              >
                Ver empleos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;