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
  Star,
  Zap,
  Shield,
  Bell,
  Coins,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import JsonLd from "../components/SEO/JsonLd";
import { buildHomeSchema } from "../components/SEO/schemas/seoSchemas";
import { ROUTES } from "../config/seo";
import PwaInstallButton from "../components/PWA/PwaInstallButton";
import HeroSection from "../components/Home/HeroSection";

type HomeService = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  active: boolean;
  path: string;
  stats: string;
  comingSoon?: boolean;
  featured?: boolean;
  badge?: string;
};

const Home: React.FC = () => {
  const services: HomeService[] = [
    {
      icon: ShoppingBag,
      title: "Tienda",
      description:
        "Catálogo de productos locales. Navega sin cuenta y paga con Mercado Pago.",
      gradient: "from-indigo-500 to-violet-600",
      active: true,
      path: ROUTES.tienda,
      stats: "Catálogo abierto",
      featured: true,
      badge: "Principal",
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
      icon: Briefcase,
      title: "Empleos",
      description:
        "Encuentra oportunidades laborales en Chever y zona bananera. Publica vacantes si eres empresa.",
      gradient: "from-violet-500 to-indigo-600",
      active: true,
      path: ROUTES.empleos,
      stats: "100+ empleos activos",
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
        "Casas, apartamentos, locales y terrenos en venta y arriendo en Chever.",
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

  return (
    <div className="bg-white dark:bg-gray-950 transition-colors duration-300">
      <JsonLd data={buildHomeSchema()} />
      <HeroSection />

      {/* Services */}
      <div className="page-section bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="text-center mb-16 md:mb-20">
            <span className="badge text-xs uppercase tracking-widest mb-4">Servicios</span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Nuestros Servicios
            </h2>
            <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Chever conecta a la comunidad con múltiples servicios en una sola plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className={`group relative card-static hover-lift flex flex-col h-full
                  ${service.featured
                    ? "border-2 border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.12)]"
                    : service.active
                      ? "hover:border-violet-300 dark:hover:border-violet-700"
                      : "opacity-75"}`}
              >
                {service.badge && (
                  <div className="absolute top-5 right-5">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {service.badge}
                    </span>
                  </div>
                )}
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
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-6 leading-relaxed flex-1">
                  {service.description}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 leading-tight min-w-0">
                    {service.stats}
                  </span>
                  {service.active ? (
                    <Link
                      to={service.path}
                      className="inline-flex items-center text-sm font-bold text-gray-900 dark:text-white hover:text-emerald-500 dark:hover:text-emerald-400 shrink-0 transition-colors group/link"
                    >
                      Explorar
                      <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-gray-400 inline-flex items-center shrink-0">
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
                ¿Por qué elegir Chever?
              </h2>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                Nuestra plataforma está diseñada pensando en las necesidades de la comunidad de
                Chever, ofreciendo una experiencia unificada para todos los servicios.
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
                        <p className="text-white font-bold">Chever</p>
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

      {/* Planes / créditos */}
      <div className="page-section bg-gray-50 dark:bg-gray-950">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="badge text-xs uppercase tracking-widest mb-4">Créditos</span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Planes de pago flexibles
            </h2>
            <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
              Los créditos Chever te permiten publicar empleos, inmuebles, eventos y torneos.
              Elige el paquete que se ajuste a tu necesidad — desde pruebas rápidas hasta patrocinios —
              y paga de forma segura con Mercado Pago.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {[
              {
                title: 'Publica sin fricción',
                text: 'Usa créditos para empleos, propiedades y torneos cuando lo necesites.',
              },
              {
                title: 'Ahorra con paquetes',
                text: 'Planes desde lo básico hasta Diamante, con descuentos por volumen.',
              },
              {
                title: 'Pago seguro',
                text: 'Checkout con Mercado Pago y acreditación automática en tu cuenta.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card-static text-center hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={ROUTES.creditos} className="btn-primary px-10 py-4 text-lg">
              Ver planes
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to={ROUTES.creditos}
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-violet-700 dark:text-violet-300 border-2 border-violet-300 dark:border-violet-700 rounded-3xl hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all"
            >
              <Coins className="mr-2 w-5 h-5" />
              Obtener créditos
            </Link>
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
              Únete a la comunidad de Chever y descubre todas las oportunidades que tenemos para ti.
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
              <PwaInstallButton variant="cta" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
