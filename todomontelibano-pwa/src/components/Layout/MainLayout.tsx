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
  ShoppingBag,
} from "lucide-react";
import NotificationPanel from "../Notifications/NotificationPanel";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/useAuth";
import { useUnreadCount } from "../../hooks/useChat";
import { useNotificationSocket } from "../../hooks/useNotificationSocket";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import UnreadBadge from "../Chat/UnreadBadge";
import ThemeToggle from "../UI/ThemeToggle";
import RouteSeo from "../SEO/RouteSeo";
import CreditBalanceBadge from "../Credits/CreditBalanceBadge";
import BuyCreditsButton from "../Credits/BuyCreditsButton";
import { hasValidSessionHint } from '../../lib/session';
import { ROUTES } from "../../config/seo";
import { BRAND_DISPLAY_NAME, BRAND_TAGLINE } from "../../config/brand";
import BrandLogo from "../Brand/BrandLogo";
import { canManageContent } from "../../hooks/usePermissions";
import PwaInstallBanner from "../PWA/PwaInstallBanner";
import SportsSubscriptionRequiredModal from "../Sports/SportsSubscriptionRequiredModal";
import StoreSubNavbar from "../Shop/StoreSubNavbar";
import MobileNavMenu, { type MobileNavService } from "./MobileNavMenu";

const MOBILE_SERVICES: MobileNavService[] = [
  {
    name: "Tienda",
    icon: ShoppingBag,
    path: ROUTES.tienda,
    active: true,
    description: "Catálogo y compras con Mercado Pago",
    comingSoon: false,
  },
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
    comingSoon: false,
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

const canFineHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const MainLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isServicesOpen, setIsServicesOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const sessionActive = isAuthenticated && hasValidSessionHint();
  const logout = useLogout();
  const { data: unreadData } = useUnreadCount(sessionActive);
  const unreadCount = unreadData?.unread_count ?? 0;
  useNotificationSocket(sessionActive);

  const headerRef = React.useRef<HTMLElement>(null);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const servicesRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const closeMobileMenu = React.useCallback(() => setIsMenuOpen(false), []);
  const closeServices = React.useCallback(() => setIsServicesOpen(false), []);
  const closeUserMenu = React.useCallback(() => setIsUserMenuOpen(false), []);

  React.useEffect(() => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (!isMenuOpen) {
      root.classList.remove("mobile-nav-open");
      return;
    }
    root.classList.add("mobile-nav-open");
    return () => root.classList.remove("mobile-nav-open");
  }, [isMenuOpen]);

  React.useEffect(() => {
    if (!isMenuOpen && !isServicesOpen && !isUserMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsMenuOpen(false);
      setIsServicesOpen(false);
      setIsUserMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen, isServicesOpen, isUserMenuOpen]);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (mq.matches) setIsMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useOnClickOutside([headerRef, mobileMenuRef], closeMobileMenu, isMenuOpen);
  useOnClickOutside(servicesRef, closeServices, isServicesOpen);
  useOnClickOutside(userMenuRef, closeUserMenu, isUserMenuOpen);

  const services = MOBILE_SERVICES;

  const isActive = (path: string) => {
    if (path === ROUTES.home) return location.pathname === ROUTES.home;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
      <RouteSeo />
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>
      <header ref={headerRef} className="pwa-header print:hidden" role="banner">
        <div className="page-container">
          <div className="flex justify-between items-center h-[4.5rem] md:h-20 py-1.5">
            <Link
              to="/"
              className="flex items-center gap-2.5 sm:gap-3 group min-w-0 shrink"
              aria-label={`${BRAND_DISPLAY_NAME} — inicio`}
            >
              <BrandLogo
                linkToHome={false}
                variant="oficial"
                className="h-12 sm:h-14 md:h-14 w-auto max-w-[min(52vw,220px)] sm:max-w-[240px] transition-all duration-300 group-hover:scale-[1.02]"
              />
              <div className="hidden lg:block min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {BRAND_TAGLINE}
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-3 lg:gap-6 xl:gap-8" aria-label="Navegación principal">
              <Link
                to="/"
                className={`nav-link ${isActive(ROUTES.home) ? "nav-link-active" : ""}`}
              >
                Inicio
              </Link>

              <div
                className="relative"
                ref={servicesRef}
                onMouseEnter={() => {
                  if (canFineHover()) {
                    setIsUserMenuOpen(false);
                    setIsServicesOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  if (canFineHover()) setIsServicesOpen(false);
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    // En desktop el hover ya abre; el clic no debe cerrar el menú.
                    if (canFineHover()) {
                      setIsServicesOpen(true);
                      return;
                    }
                    setIsServicesOpen((open) => !open);
                  }}
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
                  <div
                    id="services-menu"
                    className="absolute top-full left-0 mt-2 w-80 glass rounded-3xl py-3 z-[70] shadow-2xl animate-in fade-in slide-in-from-top-2"
                    role="menu"
                  >
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

              <Link
                to={ROUTES.tiendaCarrito}
                className="relative p-2.5 rounded-3xl text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                title="Carrito"
              >
                <ShoppingBag className="w-5 h-5" />
              </Link>

              {sessionActive ? (
                <div className="flex items-center gap-2 lg:gap-3">
                  <CreditBalanceBadge className="hidden lg:inline-flex whitespace-nowrap" />
                  <CreditBalanceBadge showLabel={false} className="lg:hidden" />
                  <BuyCreditsButton compact label="Comprar créditos" />
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
                  <NotificationPanel enabled={sessionActive} />
                  <div
                    className="relative"
                    ref={userMenuRef}
                    onMouseEnter={() => {
                      if (canFineHover()) {
                        setIsServicesOpen(false);
                        setIsUserMenuOpen(true);
                      }
                    }}
                    onMouseLeave={() => {
                      if (canFineHover()) setIsUserMenuOpen(false);
                    }}
                  >
                    <button
                      type="button"
                      className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-3xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="true"
                      aria-controls="user-menu"
                      onClick={() => {
                        setIsServicesOpen(false);
                        if (canFineHover()) {
                          setIsUserMenuOpen(true);
                          return;
                        }
                        setIsUserMenuOpen((open) => !open);
                      }}
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/60 dark:to-indigo-900/60 rounded-3xl flex items-center justify-center">
                        <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="hidden lg:inline text-sm font-bold text-gray-700 dark:text-gray-200">
                        {user?.first_name}
                      </span>
                    </button>

                    {isUserMenuOpen && (
                      <div id="user-menu" className="absolute right-0 top-full pt-2 z-[70] w-52">
                        <div className="glass rounded-3xl py-2 overflow-hidden shadow-2xl">
                          <Link to="/profile" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                            Mi Perfil
                          </Link>
                          <Link to="/creditos" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                            Comprar créditos
                          </Link>
                          <Link to="/dashboard" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                            Dashboard
                          </Link>
                          {(user?.is_superuser || user?.is_staff) && (
                            <Link to="/dashboard/admin" className="block px-5 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors">
                              Panel de administración
                            </Link>
                          )}
                          <Link to={ROUTES.tiendaPedidos} className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                            Mis pedidos
                          </Link>
                          <Link to={ROUTES.facturas} className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                            Mis facturas
                          </Link>
                          {canManageContent(user) && (
                            <Link to={ROUTES.facturacion} className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                              Facturación y ventas
                            </Link>
                          )}
                          <Link to="/messages" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                            Mensajes
                          </Link>
                          {canManageContent(user) && (
                            <Link to="/real-estate/my_listings" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                              Mis Propiedades
                            </Link>
                          )}
                          {canManageContent(user) && (
                            <Link to="/jobs/offers/" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                              Gestionar Empleos
                            </Link>
                          )}
                          {canManageContent(user) && (
                            <Link to="/eventos/mis-eventos" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                              Mis Eventos
                            </Link>
                          )}
                          {canManageContent(user) && (
                            <Link to="/tienda/publicar" className="block px-5 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors">
                              Crear producto
                            </Link>
                          )}
                          <hr className="my-2 border-gray-200 dark:border-gray-700" />
                          <button
                            type="button"
                            onClick={logout}
                            className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
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

            <div className="flex items-center gap-1 sm:gap-2 md:hidden">
              {sessionActive && (
                <>
                  <NotificationPanel enabled={sessionActive} />
                  <Link
                    to="/messages"
                    className="relative p-2 rounded-3xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                    title="Mensajes"
                    aria-label="Mensajes"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5">
                        <UnreadBadge count={unreadCount} />
                      </span>
                    )}
                  </Link>
                </>
              )}
              <ThemeToggle />
              <button
                type="button"
                className="p-2.5 rounded-3xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-nav-panel"
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <MobileNavMenu
          services={MOBILE_SERVICES}
          sessionActive={sessionActive}
          user={user}
          onClose={closeMobileMenu}
          onLogout={logout}
          panelRef={mobileMenuRef}
        />
      )}

      <div className="print:hidden">
        <StoreSubNavbar />
      </div>

      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
        <SportsSubscriptionRequiredModal />
      </main>

      <footer className="print:hidden bg-white dark:bg-gray-900/80 border-t border-gray-200/80 dark:border-gray-800/80 mt-auto transition-colors duration-300" role="contentinfo">
        <div className="page-container py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <BrandLogo linkToHome={false} variant="oficial" className="h-10 w-auto max-w-[160px]" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">{BRAND_DISPLAY_NAME}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium leading-relaxed max-w-md">
                La plataforma integral {BRAND_DISPLAY_NAME}. Encuentra empleos, eventos, deportes y bienes raíces en un solo lugar.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5">
                Servicios
              </h3>
              <ul className="space-y-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                <li><Link to={ROUTES.tienda} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded">Tienda</Link></li>
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
            © {new Date().getFullYear()} {BRAND_DISPLAY_NAME}. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      <PwaInstallBanner />
    </div>
  );
};

export default MainLayout;
