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
  Star,
  Zap,
  Shield,
  Bell
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
      hoverColor: 'hover:bg-blue-600',
      active: true,
      path: '/jobs',
      stats: '100+ empleos activos'
    },
    {
      icon: Trophy,
      title: 'Deportes',
      description: 'Ligas de fútbol, softbol y otros deportes. Organiza torneos o encuentra equipos.',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      active: true,
      path: '/sports',
      stats: 'Ligas activas'
    },
    {
      icon: Calendar,
      title: 'Eventos',
      description: 'Descubre eventos sociales, culturales y de networking en la región.',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
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
      hoverColor: 'hover:bg-orange-600',
      active: false,
      comingSoon: true,
      path: '#',
      stats: 'Próximamente'
    },
  ];

  const features = [
    { icon: Users, text: 'Multi-tenant: Una plataforma, múltiples organizaciones' },
    { icon: Shield, text: 'Autenticación segura con roles diferenciados' },
    { icon: Zap, text: 'Planes de suscripción flexibles' },
    { icon: Bell, text: 'Notificaciones en tiempo real' },
    { icon: Star, text: 'Diseño responsive y PWA' },
    { icon: CheckCircle2, text: 'Optimizado para velocidad' },
  ];

  const stats = [
    { icon: Users, value: '500+', label: 'Usuarios activos' },
    { icon: Building2, value: '50+', label: 'Empresas' },
    { icon: Briefcase, value: '100+', label: 'Empleos activos' },
    { icon: Star, value: '4.8', label: 'Calificación' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
              <span className="text-sm font-medium text-white/90">Plataforma activa en Montelibano</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              Todo lo que necesitas
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-400 mt-2">
                en un solo lugar
              </span>
            </h1>
            
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
              La plataforma integral de Montelibano. Encuentra empleos, eventos, 
              deportes y bienes raíces en la palma de tu mano.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all hover:scale-105 shadow-lg shadow-primary-600/25"
                >
                  Ir al Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all hover:scale-105 shadow-lg shadow-primary-600/25"
                  >
                    Comenzar gratis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link 
                    to="/sports" 
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
                  >
                    <Trophy className="mr-2 w-5 h-5" />
                    Ir a deportes
                  </Link>
                  <Link 
                    to="/jobs" 
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
                  >
                    <Briefcase className="mr-2 w-5 h-5" />
                    Ver empleos
                  </Link>
                </>
              )}
            </div>
            
            {/* Stats en Hero */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center group">
                  <div className="flex items-center text-primary-400 mb-2 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-5 h-5 mr-2" />
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-sm text-gray-400">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold tracking-wide uppercase text-sm">Servicios</span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Nuestros Servicios</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              TodoMontelibano conecta a la comunidad con múltiples servicios en una sola plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div 
                key={service.title}
                className={`group relative bg-white rounded-2xl shadow-sm border-2 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                  ${service.active ? 'border-transparent hover:border-primary-200' : 'border-gray-200 opacity-75'}`}
              >
                {service.comingSoon && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                      Pronto
                    </span>
                  </div>
                )}
                
                <div className={`w-14 h-14 ${service.color} ${service.hoverColor} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.description}</p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-primary-600">{service.stats}</span>
                  {service.active ? (
                    <Link 
                      to={service.path}
                      className="flex items-center text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors group/link"
                    >
                      Explorar
                      <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Próximamente
                    </span>
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
              <span className="text-primary-600 font-semibold tracking-wide uppercase text-sm">Características</span>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
                ¿Por qué elegir TodoMontelibano?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Nuestra plataforma está diseñada pensando en las necesidades de la comunidad de Montelibano, 
                ofreciendo una experiencia unificada para todos los servicios.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mr-3">
                      <feature.icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-tight pt-2">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all hover:shadow-lg hover:shadow-primary-600/25"
                >
                  Crear cuenta gratuita
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 aspect-[4/3]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">T</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">TodoMontelibano</p>
                        <p className="text-gray-400 text-xs">App Móvil</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-white/20 rounded-full w-3/4" />
                      <div className="h-2 bg-white/20 rounded-full w-1/2" />
                      <div className="h-2 bg-white/20 rounded-full w-5/6" />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <div className="h-8 bg-primary-500/50 rounded-lg flex-1" />
                      <div className="h-8 bg-white/10 rounded-lg flex-1" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-100 rounded-full blur-2xl opacity-60" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-100 rounded-full blur-2xl opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - AHORA CON AMBOS BOTONES ACTIVOS */}
      <div className="relative bg-primary-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
              Únete a la comunidad de TodoMontelibano y descubre todas las oportunidades que tenemos para ti.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 rounded-xl font-medium hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
              >
                Registrarse gratis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link 
                to="/sports" 
                className="inline-flex items-center justify-center px-8 py-3 text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
              >
                <Trophy className="mr-2 w-4 h-4" />
                Ir a deportes
              </Link>
              <Link 
                to="/jobs" 
                className="inline-flex items-center justify-center px-8 py-3 text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
              >
                <Briefcase className="mr-2 w-4 h-4" />
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