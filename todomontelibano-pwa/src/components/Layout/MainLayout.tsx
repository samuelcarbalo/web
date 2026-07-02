import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  User,
  Menu,
  X,
  LogOut,
  Trophy,
  House,
  MessageSquare,
} from "lucide-react";
import NotificationPanel from "../Notifications/NotificationPanel";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { useUnreadCount } from "../../hooks/useChat";
import UnreadBadge from "../Chat/UnreadBadge";
import ThemeToggle from "../UI/ThemeToggle";
import RouteSeo from "../SEO/RouteSeo";
import CreditBalanceBadge from "../Credits/CreditBalanceBadge";
import { ROUTES } from "../../config/seo";

const MainLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isServicesOpen, setIsServicesOpen] = React.useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();
  const { data: unreadData } = useUnreadCount(isAuthenticated);
  const unreadCount = unreadData?.unread_count ?? 0;

  const services = [
    {
      name: "Deportes",
      icon: Trophy,
      path: ROUTES.deportes,
      active: true,
      description: "Fútbol, Softbol y más",
      comingSoon: false,
    },
    {
      name: "Empleos",
      icon: Briefcase,
      path: ROUTES.empleos,
      active: true,
      description: "Encuentra tu próximo trabajo",
    },
    {
      name: "Eventos publicitarios",
      icon: Calendar,
      path: ROUTES.eventos,
      active: true,
      description: "Ferias, conciertos y activaciones de marca",
      comingSoon: false,
    },
    {
      name: "Bienes Raíces",
      icon: House,
      path: ROUTES.bienesRaices,
      active: true,
      description: "Propiedades en venta y alquiler",
      comingSoon: false,
    },
  ];

  const isActive = (path: string) => {
    if (path === ROUTES.home) return location.pathname === ROUTES.home;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <RouteSeo />
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <header className="pwa-header" role="banner">
        <div className="page-container">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-500/30 transition-transform duration-300 group-hover:scale-[1.02]">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  CordobaTech
                </h1>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Tu plataforma todo en uno
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8" aria-label="Navegación principal">
              <Link
                to="/"
                className={`nav-link ${isActive(ROUTES.home) ? "nav-link-active" : ""}`}
              >
                Inicio
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="nav-link flex items-center gap-1"
                  aria-expanded={isServicesOpen}
                  aria-haspopup="true"
                  aria-controls="services-menu"
                >
                  Servicios
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isServicesOpen && (
                  <div id="services-menu" className="absolute top-full left-0 mt-3 w-80 glass rounded-3xl py-3 z-50 animate-in fade-in slide-in-from-top-2" role="menu">
                    {services.map((service) => (
                      <Link
                        key={service.name}
                        to={service.active ? service.path : "#"}
                        onClick={(e) => {
                          if (!service.active) e.preventDefault();
                          setIsServicesOpen(false);
                        }}
                        className={`flex items-start px-5 py-4 mx-2 rounded-3xl transition-all duration-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:scale-[1.01] ${!service.active ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        <div
                          className={`p-2.5 rounded-3xl ${service.active ? "bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/50 dark:to-indigo-900/50 text-violet-600 dark:text-violet-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400"}`}
                        >
                          <service.icon className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center">
                            {service.name}
                            {service.comingSoon && (
                              <span className="ml-2 badge text-[10px]">Pronto</span>
                            )}
                          </p>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                            {service.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <ThemeToggle />

              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <CreditBalanceBadge />
                  <Link
                    to="/messages"
                    className="relative p-2.5 rounded-3xl text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                    title="Mensajes"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5">
                        <UnreadBadge count={unreadCount} />
                      </span>
                    )}
                  </Link>
                  <NotificationPanel enabled={isAuthenticated} />
                  <div className="relative group">
                    <button className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/60 dark:to-indigo-900/60 rounded-3xl flex items-center justify-center">
                        <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                        {user?.first_name}
                      </span>
                    </button>

                    <div className="absolute right-0 top-full w-52 pt-3 hidden group-hover:block">
                      <div className="glass rounded-3xl py-2 overflow-hidden">
                        <Link to="/profile" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                          Mi Perfil
                        </Link>
                        <Link to="/creditos" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                          Comprar créditos
                        </Link>
                        <Link to="/dashboard" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                          Dashboard
                        </Link>
                        <Link to="/messages" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                          Mensajes
                        </Link>
                        {user?.role === "manager" && (
                          <Link to="/real-estate/my_listings" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                            Mis Propiedades
                          </Link>
                        )}
                        {user?.role === "manager" && (
                          <Link to="/jobs/offers/" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                            Gestionar Empleos
                          </Link>
                        )}
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={logout}
                          className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="nav-link">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn-primary text-sm px-5 py-2.5">
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                className="p-2.5 rounded-3xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200/60 dark:border-gray-800/60 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/"
                className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Servicios
                </p>
                {services.map((service) => (
                  <Link
                    key={service.name}
                    to={service.active ? service.path : "#"}
                    onClick={(e) => {
                      if (!service.active) e.preventDefault();
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center py-3 font-bold ${service.active ? "text-gray-700 dark:text-gray-200" : "text-gray-400"}`}
                  >
                    <service.icon className="w-5 h-5 mr-3" />
                    {service.name}
                    {service.comingSoon && (
                      <span className="ml-auto badge text-[10px]">Pronto</span>
                    )}
                  </Link>
                ))}
              </div>

              {isAuthenticated ? (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                  {user?.role === "manager" && (
                    <div className="px-4 py-3 text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-3xl flex items-center gap-1.5 mb-3">
                      🪙 {user.credits !== undefined ? user.credits : 0} Créditos disponibles
                    </div>
                  )}
                  <Link to="/profile" className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200" onClick={() => setIsMenuOpen(false)}>
                    Mi Perfil
                  </Link>
                  <Link to="/dashboard" className="block py-3 text-base font-bold text-gray-700 dark:text-gray-200" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-left py-3 text-base font-bold text-red-600 dark:text-red-400"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
                  <Link to="/login" className="block py-3 text-base font-bold text-violet-600 dark:text-violet-400" onClick={() => setIsMenuOpen(false)}>
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn-primary w-full text-center" onClick={() => setIsMenuOpen(false)}>
                    Crear Cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-gray-900/80 border-t border-gray-200/80 dark:border-gray-800/80 mt-auto transition-colors duration-300" role="contentinfo">
        <div className="page-container py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">CordobaTech</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-md">
                La plataforma integral para CordobaTech. Encuentra empleos, eventos, deportes y bienes raíces en un solo lugar.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
                Servicios
              </h3>
              <ul className="space-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><Link to={ROUTES.deportes} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded">Deportes</Link></li>
                <li><Link to={ROUTES.empleos} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded">Empleos</Link></li>
                <li><Link to={ROUTES.eventos} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Eventos</Link></li>
                <li><Link to={ROUTES.bienesRaices} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded">Bienes Raíces</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
                Legal
              </h3>
              <ul className="space-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><Link to="/privacy" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Términos</Link></li>
                <li><Link to="/contact" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Contacto</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-500">
            © 2024 CordobaTech. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
