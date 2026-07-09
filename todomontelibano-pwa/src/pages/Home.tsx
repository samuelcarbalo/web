import React from "react";
import { Link } from "react-router-dom";
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
  Bell,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import JsonLd from "../components/SEO/JsonLd";
import { buildHomeSchema } from "../components/SEO/schemas/seoSchemas";
import { ROUTES } from "../config/seo";

const Home: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const services = [
    {
      icon: Briefcase,
      title: "Empleos",
      description:
        "Encuentra oportunidades laborales en CordobaTech y zona bananera. Publica vacantes si eres empresa.",
      gradient: "from-violet-500 to-indigo-600",
      active: true,
      path: ROUTES.empleos,
      stats: "100+ empleos activos",
    },
    {
      icon: Trophy,
      title: "Deportes",
      description:
        "Ligas de fútbol, softbol y otros deportes. Organiza torneos o encuentra equipos.",
      gradient: "from-emerald-500 to-teal-600",
      active: true,
      path: ROUTES.deportes,
      stats: "Ligas activas",
    },
    {
      icon: Calendar,
      title: "Eventos publicitarios",
      description:
        "Ferias, conciertos y activaciones de marca. Publica tu evento y amplía su alcance con publicidad.",
      gradient: "from-fuchsia-500 to-violet-600",
      active: true,
      path: ROUTES.eventos,
      stats: "Agenda local",
    },
    {
      icon: House,
      title: "Bienes Raíces",
      description:
        "Casas, apartamentos, locales y terrenos en venta y arriendo en CordobaTech.",
      gradient: "from-orange-500 to-rose-600",
      active: true,
      comingSoon: false,
      path: ROUTES.bienesRaices,
      stats: "Propiedades",
    },
  ];

  const features = [
    { icon: Users, text: "Multi-tenant: Una plataforma, múltiples organizaciones" },
    { icon: Shield, text: "Autenticación segura con roles diferenciados" },
    { icon: Zap, text: "Planes de suscripción flexibles" },
    { icon: Bell, text: "Notificaciones en tiempo real" },
    { icon: Star, text: "Diseño responsive y PWA" },
    { icon: CheckCircle2, text: "Optimizado para velocidad" },
  ];

  const stats = [
    { icon: Users, value: "500+", label: "Usuarios activos" },
    { icon: Building2, value: "50+", label: "Empresas" },
    { icon: Briefcase, value: "100+", label: "Empleos activos" },
    { icon: Star, value: "4.8", label: "Calificación" },
  ];

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      <JsonLd data={buildHomeSchema()} />
      {/* Hero */}
      <div className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative page-container pt-24 pb-20 sm:pt-28 sm:pb-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-5 py-2.5 rounded-full glass mb-10">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2.5 animate-pulse" />
              <span className="text-sm font-bold text-white/90">
                Plataforma activa en CordobaTech
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
              Todo lo que necesitas
              <span className="block text-gradient mt-3">en un solo lugar</span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-violet-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
              La plataforma integral de todo el Departamento de Córdoba. Encuentra empleos, eventos,
              deportes y bienes raíces en la palma de tu mano.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary px-10 py-4 text-lg">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              ) : (
                <Link to="/register" className="btn-primary px-10 py-4 text-lg">
                  Comenzar gratis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              )}
              <Link
                to={ROUTES.deportes}
                className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white border-2 border-white/30 rounded-3xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02] hover:shadow-2xl"
              >
                <Trophy className="mr-2 w-5 h-5" />
                Ir a deportes
              </Link>
              <Link
                to={ROUTES.empleos}
                className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white border-2 border-white/30 rounded-3xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02] hover:shadow-2xl"
              >
                <Briefcase className="mr-2 w-5 h-5" />
                Ver empleos
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center group">
                  <div className="flex items-center text-violet-300 mb-2 group-hover:scale-[1.02] transition-transform duration-300">
                    <stat.icon className="w-5 h-5 mr-2" />
                    <span className="text-3xl font-extrabold text-white">{stat.value}</span>
                  </div>
                  <span className="text-sm font-medium text-violet-200/70">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-gray-50 dark:fill-gray-950"
            />
          </svg>
        </div>
      </div>

      {/* Services */}
      <div className="page-section bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="text-center mb-16 md:mb-20">
            <span className="badge text-xs uppercase tracking-widest mb-4">Servicios</span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Nuestros Servicios
            </h2>
            <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              CordobaTech conecta a la comunidad con múltiples servicios en una sola plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className={`group relative card-static hover-lift
                  ${service.active ? "hover:border-violet-300 dark:hover:border-violet-700" : "opacity-75"}`}
              >
                {service.comingSoon && (
                  <div className="absolute top-5 right-5">
                    <span className="badge">Pronto</span>
                  </div>
                )}

                <div
                  className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-3xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl`}
                >
                  <service.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                    {service.stats}
                  </span>
                  {service.active ? (
                    <Link
                      to={service.path}
                      className="flex items-center text-sm font-bold text-gray-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors group/link"
                    >
                      Explorar
                      <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-gray-400 flex items-center">
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

      {/* Features */}
      <div className="page-section bg-white dark:bg-gray-900/50">
        <div className="page-container">
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
            <div>
              <span className="badge text-xs uppercase tracking-widest">Características</span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
                ¿Por qué elegir CordobaTech?
              </h2>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                Nuestra plataforma está diseñada pensando en las necesidades de la comunidad de
                CordobaTech, ofreciendo una experiencia unificada para todos los servicios.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start p-4 rounded-3xl hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="w-11 h-11 rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 flex items-center justify-center flex-shrink-0 mr-4">
                      <feature.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-bold leading-snug pt-2">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Link to="/register" className="btn-primary">
                  Crear cuenta gratuita
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="mt-12 lg:mt-0 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-violet-900 to-indigo-950 aspect-[4/3]">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">T</span>
                      </div>
                      <div>
                        <p className="text-white font-bold">CordobaTech</p>
                        <p className="text-violet-200/70 text-xs font-medium">App Móvil</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2.5 bg-white/20 rounded-full w-3/4" />
                      <div className="h-2.5 bg-white/20 rounded-full w-1/2" />
                      <div className="h-2.5 bg-white/20 rounded-full w-5/6" />
                    </div>
                    <div className="mt-6 flex gap-3">
                      <div className="h-10 bg-violet-500/50 rounded-3xl flex-1" />
                      <div className="h-10 bg-white/10 rounded-3xl flex-1" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-violet-400/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative page-container py-20 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
              ¿Listo para comenzar?
            </h2>
            <p className="text-violet-100 text-lg font-medium mb-10">
              Únete a la comunidad de CordobaTech y descubre todas las oportunidades que tenemos para ti.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-10 py-4 bg-white text-violet-700 rounded-3xl font-bold hover:bg-violet-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-lg"
              >
                Registrarse gratis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                to={ROUTES.deportes}
                className="inline-flex items-center justify-center px-10 py-4 text-white font-bold border-2 border-white/30 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                <Trophy className="mr-2 w-4 h-4" />
                Ir a deportes
              </Link>
              <Link
                to={ROUTES.empleos}
                className="inline-flex items-center justify-center px-10 py-4 text-white font-bold border-2 border-white/30 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
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
