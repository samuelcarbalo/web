import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  User, 
  Building2, 
  Bell, 
  TrendingUp,
  Plus,
  Eye,
  Trophy,
  Users,
  Calendar,
  House,
  Mail,
  Coins,
  ShoppingBag,
  Package,
  Boxes,
  Shield,
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { canManageContent, canSeeMyCreatedProducts } from '../hooks/usePermissions';
import { useMyApplications, useJobs, useAdminJobs } from '../hooks/useJobs';
import { useTournaments } from '../hooks/useSports';
import { useContactMessages } from '../hooks/useContact';
import CreditBalanceBadge from '../components/Credits/CreditBalanceBadge';
import BuyCreditsButton from '../components/Credits/BuyCreditsButton';
import { useMyShopOrders, useShopProducts } from '../hooks/useShop';
import { useMyPurchases } from '../hooks/usePayments';
import type { PurchaseHistoryItem } from '../lib/paymentsApi';
import { ROUTES } from '../config/seo';
import { useCartStore } from '../store/cartStore';
import BrandLogo from '../components/Brand/BrandLogo';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: applications } = useMyApplications();
  
  // Datos de deportes
  
  // Solo para empresas/managers/admins de plataforma
  let isCompany = false;
  const isManager = canManageContent(user);
  if (isManager){
    isCompany = true;
  }
  const adminResult = useAdminJobs(
    { posted_by: user?.id },
    { enabled: !!(isManager && user?.id) }
  );
  
  const userResult = useJobs(
    { posted_by: user?.id },
    { enabled: !!(!isManager && user?.id) }
  );
  const myJobs = isManager ? adminResult.data : userResult.data;
  // console.log("my jobs", JSON.stringify(myJobs))
  
  const statusConfig: Record<string, string> = {
    applied: 'bg-yellow-100 text-yellow-800',
    interview: 'bg-violet-100 dark:bg-violet-950/40 text-blue-800',
    hired: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
  };
 
  // Stats principales (empleos)
  const stats = isCompany ? [
    { 
      title: 'Mis empleos activos', 
      value: (myJobs as any)?.count || 0,
      icon: Briefcase,
      color: 'bg-violet-50 dark:bg-violet-950/300',
      link: '/jobs/my_offers'
    },
    { 
      title: 'Aplicaciones recibidas', 
      value: (applications as any)?.count || 0, 
      icon: User,
      color: 'bg-green-500',
      link: '/applications/received'
    },
    { 
      title: 'Vistas totales', 
      value: (myJobs as any)?.results?.reduce((acc: number, job: any) => acc + job.views_count, 0) || 0, 
      icon: Eye,
      color: 'bg-purple-500',
      link: '#'
    },
  ] : [
    { 
      title: 'Mis aplicaciones', 
      value: (applications as any)?.count || 0, 
      icon: Briefcase,
      color: 'bg-violet-50 dark:bg-violet-950/300',
      link: '/applications'
    },
    { 
      title: 'Empleos guardados', 
      value: 0,
      icon: Building2,
      color: 'bg-yellow-500',
      link: '/saved'
    },
    { 
      title: 'Perfil completado', 
      value: '85%', 
      icon: User,
      color: 'bg-green-500',
      link: '/profile'
    },
  ];
  
  // Stats de torneos (nuevo)
  const isManagerOrAdmin = canManageContent(user);
  const isSuperUser = !!user?.is_superuser;
  const isPlatformAdmin = isSuperUser || !!user?.is_staff;
  const { data: contactMessages = [] } = useContactMessages(isSuperUser, { is_read: false });
  const unreadContactCount = contactMessages.filter((m) => !m.is_read).length;
  const { data: tournaments } = useTournaments({ status: 'active', enabled: false });
  const { data: manager_tournaments } = useTournaments({ status: 'active', enabled: isManagerOrAdmin });
  const { data: shopOrders = [] } = useMyShopOrders(true);
  const showMyCreatedProducts = canSeeMyCreatedProducts(user);
  const { data: myProductsData } = useShopProducts(
    { created_by_me: true },
    { enabled: showMyCreatedProducts },
  );
  const myProductCount = myProductsData?.count ?? myProductsData?.results?.length ?? 0;
  const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));

  // Historial de compras
  const { data: purchases = [], isLoading: loadingPurchases } = useMyPurchases(!!user);

  const formatCOP = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const purchaseStatusBadge = (item: PurchaseHistoryItem) => {
    const cfg: Record<string, { label: string; cls: string; Icon: React.FC<{ className?: string }> }> = {
      approved:  { label: 'Aprobado',   cls: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300',   Icon: CheckCircle2 },
      pending:   { label: 'Pendiente',  cls: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300', Icon: Clock },
      in_process:{ label: 'En proceso', cls: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300', Icon: Clock },
      rejected:  { label: 'Rechazado',  cls: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300',            Icon: XCircle },
      cancelled: { label: 'Cancelado',  cls: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',           Icon: XCircle },
      refunded:  { label: 'Reembolsado',cls: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',        Icon: AlertCircle },
    };
    const s = cfg[item.status] ?? { label: item.status_display || item.status, cls: 'bg-gray-100 text-gray-600', Icon: AlertCircle };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
        <s.Icon className="w-3 h-3" />
        {s.label}
      </span>
    );
  };
  

  // Stats de deportes (nuevo)
  const sportsStats = {
    activeTournaments: tournaments?.results?.filter((t: any) => t.status === 'active').length || 0,
    myTournaments: isManagerOrAdmin ? (manager_tournaments?.count || 0) : 0,
    totalTeams: tournaments?.results?.reduce((acc: number, t: any) => acc + (t.teams_count || 0), 0) || 0,
  };

  const quickActions = isManagerOrAdmin
    ? [
        {
          label: '+ Crear Empleo',
          icon: Briefcase,
          link: ROUTES.empleosCreate,
          tone: 'bg-violet-600 hover:bg-violet-500 text-white',
        },
        {
          label: '+ Crear Torneo',
          icon: Trophy,
          link: ROUTES.deportesCreate,
          tone: 'bg-emerald-600 hover:bg-emerald-500 text-white',
        },
        {
          label: '+ Crear Bienes Raíces',
          icon: House,
          link: ROUTES.bienesRaicesCreate,
          tone: 'bg-amber-600 hover:bg-amber-500 text-white',
        },
        {
          label: '+ Crear Evento',
          icon: Calendar,
          link: ROUTES.eventosPublicar,
          tone: 'bg-rose-600 hover:bg-rose-500 text-white',
        },
        {
          label: '+ Crear Producto',
          icon: Package,
          link: ROUTES.tiendaCreate,
          tone: 'bg-indigo-600 hover:bg-indigo-500 text-white',
        },
        ...(isPlatformAdmin
          ? [
              {
                label: '+ Ajustar Créditos',
                icon: Coins,
                link: ROUTES.adminCredits,
                tone: 'bg-slate-800 hover:bg-slate-700 text-white ring-2 ring-amber-400/80',
              },
            ]
          : [
              {
                label: 'Comprar créditos',
                icon: Coins,
                link: ROUTES.creditos,
                tone: 'bg-amber-500 hover:bg-amber-400 text-white',
              },
            ]),
      ]
    : [
        { label: 'Buscar empleos', icon: Briefcase, link: ROUTES.empleos, tone: 'bg-violet-600 hover:bg-violet-500 text-white' },
        { label: 'Ver torneos', icon: Trophy, link: ROUTES.deportes, tone: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
        { label: 'Ver propiedades', icon: House, link: ROUTES.bienesRaices, tone: 'bg-amber-600 hover:bg-amber-500 text-white' },
        { label: 'Ver eventos', icon: Calendar, link: ROUTES.eventos, tone: 'bg-rose-600 hover:bg-rose-500 text-white' },
        { label: 'Explorar tienda', icon: ShoppingBag, link: ROUTES.tienda, tone: 'bg-indigo-600 hover:bg-indigo-500 text-white' },
      ];

  const moduleCards = [
    {
      key: 'empleos',
      title: 'Empleos',
      description: 'Publica vacantes y gestiona postulaciones',
      icon: Briefcase,
      color: 'bg-violet-600',
      href: isManagerOrAdmin ? ROUTES.empleosMyOffers : ROUTES.empleos,
      createHref: isManagerOrAdmin ? ROUTES.empleosCreate : undefined,
      createLabel: 'Crear empleo',
      stat: isCompany ? (myJobs as any)?.count || 0 : (applications as any)?.count || 0,
      statLabel: isCompany ? 'mis ofertas' : 'aplicaciones',
    },
    {
      key: 'deportes',
      title: 'Deportes',
      description: 'Torneos, equipos y resultados',
      icon: Trophy,
      color: 'bg-emerald-600',
      href: ROUTES.deportes,
      createHref: isManagerOrAdmin ? ROUTES.deportesCreate : undefined,
      createLabel: 'Crear torneo',
      stat: sportsStats.myTournaments || sportsStats.activeTournaments,
      statLabel: isManagerOrAdmin ? 'mis torneos' : 'activos',
    },
    {
      key: 'bienes',
      title: 'Bienes Raíces',
      description: 'Propiedades en venta y alquiler',
      icon: House,
      color: 'bg-amber-600',
      href: isManagerOrAdmin ? '/bienes-raices/mis-publicaciones' : ROUTES.bienesRaices,
      createHref: isManagerOrAdmin ? ROUTES.bienesRaicesCreate : undefined,
      createLabel: 'Publicar propiedad',
      stat: '—',
      statLabel: 'módulo',
    },
    {
      key: 'eventos',
      title: 'Eventos',
      description: 'Ferias, conciertos y activaciones',
      icon: Calendar,
      color: 'bg-rose-600',
      href: isManagerOrAdmin ? ROUTES.eventosMisEventos : ROUTES.eventos,
      createHref: isManagerOrAdmin ? ROUTES.eventosPublicar : undefined,
      createLabel: 'Crear evento',
      stat: '—',
      statLabel: 'módulo',
    },
    {
      key: 'tienda',
      title: 'Tienda',
      description: 'Catálogo y pedidos locales',
      icon: ShoppingBag,
      color: 'bg-indigo-600',
      href: ROUTES.tienda,
      createHref: isManagerOrAdmin ? ROUTES.tiendaCreate : undefined,
      createLabel: 'Crear producto',
      stat: shopOrders.length,
      statLabel: 'pedidos',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="page-container">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <BrandLogo
              linkToHome={false}
              variant="mark"
              className="mt-1 h-10 w-auto max-w-[7rem] shrink-0 opacity-90"
            />
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ¡Hola, {user?.first_name}!
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {isCompany 
                  ? 'Gestiona los 5 módulos, créditos y publicaciones desde un solo lugar' 
                  : 'Encuentra empleos, torneos, eventos, propiedades y más'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CreditBalanceBadge />
            <BuyCreditsButton label="Obtener más créditos" />
            {isPlatformAdmin && (
              <Link
                to={ROUTES.adminCredits}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-amber-400 transition-colors"
              >
                <Coins className="w-4 h-4" />
                Ajustar créditos
              </Link>
            )}
            {isPlatformAdmin && (
              <Link
                to="/dashboard/admin"
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-600 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Panel de administración
              </Link>
            )}
          </div>
        </div>

        <div className="mb-8 card-static border border-violet-200 dark:border-violet-800/50 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-3xl bg-violet-600 text-white shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Cartera</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ¿Necesitas más créditos?
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Recarga para publicar empleos, inmuebles, eventos o torneos.
                  {isPlatformAdmin ? ' Como admin también puedes ajustar créditos de usuarios.' : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <BuyCreditsButton label="Comprar créditos" />
              {isPlatformAdmin && (
                <Link
                  to={ROUTES.adminCredits}
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-amber-500 bg-white px-4 py-2.5 text-sm font-bold text-amber-700 hover:bg-amber-50"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Ajustar créditos de usuario
                </Link>
              )}
            </div>
          </div>
        </div>

        {isPlatformAdmin && (
          <Link
            to="/dashboard/admin"
            className="card mb-8 border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50 to-slate-50 dark:from-indigo-950/30 dark:to-slate-950/20 hover:shadow-2xl transition-shadow block"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-3xl bg-indigo-700 text-white">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Administración</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Panel de usuarios</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Usuarios, créditos e historial global de pagos (tienda, deportes, eventos)
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex rounded-2xl bg-indigo-700 px-4 py-2 text-sm font-bold text-white">
                Abrir panel
              </span>
            </div>
          </Link>
        )}

        {isManagerOrAdmin && (
          <Link
            to={ROUTES.facturacion}
            className="card mb-8 border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 hover:shadow-2xl transition-shadow block"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-3xl bg-emerald-600 text-white">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Facturación y ventas</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Gestión financiera de la tienda</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Pedidos recibidos, métricas, ticket promedio y facturas
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
                Abrir
              </span>
            </div>
          </Link>
        )}

        {isSuperUser && (
          <Link
            to="/dashboard/contacto"
            className="card mb-8 border-violet-200 dark:border-violet-800/50 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/20 hover:shadow-2xl transition-shadow block"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-3xl bg-violet-600 text-white">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Administración</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Mensajes de contacto</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Revisa consultas enviadas desde el formulario público
                  </p>
                </div>
              </div>
              {unreadContactCount > 0 && (
                <span className="shrink-0 px-3 py-1.5 rounded-full bg-amber-500 text-white text-sm font-bold">
                  {unreadContactCount} nuevos
                </span>
              )}
            </div>
          </Link>
        )}

        {/* Módulos del sistema (5) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Módulos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {moduleCards.map((mod) => (
              <div
                key={mod.key}
                className="card hover:shadow-2xl transition-shadow flex flex-col"
              >
                <Link to={mod.href} className="flex items-start gap-3">
                  <div className={`p-3 rounded-3xl ${mod.color} text-white shrink-0`}>
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white">{mod.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {mod.description}
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-2">
                      {mod.stat}{' '}
                      <span className="font-normal text-gray-500">{mod.statLabel}</span>
                    </p>
                  </div>
                </Link>
                {mod.createHref && (
                  <Link
                    to={mod.createHref}
                    className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold text-white ${mod.color}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {mod.createLabel}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid - Empleos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-violet-600 dark:text-violet-400" />
              Empleos
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              to={stat.link}
              className="card hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-3xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Deportes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-green-600" />
              Deportes
            </h2>
            <div className="flex items-center gap-3">
              {isManagerOrAdmin && (
                <Link
                  to={ROUTES.deportesCreate}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-emerald-500"
                >
                  <Plus className="w-4 h-4" />
                  Crear torneo
                </Link>
              )}
              <Link to="/deportes" className="text-green-600 hover:text-green-700 text-sm font-medium">
                Ver todos →
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/deportes/my_tournaments/active" className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-3xl bg-green-500">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Torneos activos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{sportsStats.activeTournaments}</p>
                </div>
              </div>
            </Link>

            {isManagerOrAdmin && (
              <Link to="/deportes/my_tournaments" className="card hover:shadow-2xl transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-3xl bg-green-600">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis torneos</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{sportsStats.myTournaments}</p>
                  </div>
                </div>
              </Link>
            )}

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-3xl bg-violet-500 dark:bg-violet-600">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Equipos inscritos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{sportsStats.totalTeams}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Eventos + Bienes Raíces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card border border-rose-200/60 dark:border-rose-900/40">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-600" />
                Eventos
              </h2>
              <Link to={ROUTES.eventos} className="text-sm font-medium text-rose-600">
                Ver →
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Ferias, conciertos y activaciones de marca.
            </p>
            {isManagerOrAdmin && (
              <Link
                to={ROUTES.eventosPublicar}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-500"
              >
                <Plus className="w-4 h-4" />
                Crear evento
              </Link>
            )}
          </div>
          <div className="card border border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <House className="w-5 h-5 text-amber-600" />
                Bienes Raíces
              </h2>
              <Link to={ROUTES.bienesRaices} className="text-sm font-medium text-amber-700">
                Ver →
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Publica casas, locales y terrenos en venta o arriendo.
            </p>
            {isManagerOrAdmin && (
              <Link
                to={ROUTES.bienesRaicesCreate}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-500"
              >
                <Plus className="w-4 h-4" />
                Publicar propiedad
              </Link>
            )}
          </div>
        </div>

        <div className="mb-8" id="tienda">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2 text-violet-600 dark:text-violet-400" />
              Tienda
            </h2>
            <div className="flex items-center gap-3">
              {isManagerOrAdmin && (
                <Link
                  to={ROUTES.tiendaCreate}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-indigo-500"
                >
                  <Plus className="w-4 h-4" />
                  Crear producto
                </Link>
              )}
              <Link to={ROUTES.tienda} className="text-violet-600 hover:text-violet-700 text-sm font-medium">
                Ver catálogo →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to={ROUTES.tienda} className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-3xl bg-violet-600">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Explorar catálogo</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Productos públicos</p>
                </div>
              </div>
            </Link>
            <Link to={ROUTES.tiendaCarrito} className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-3xl bg-indigo-500">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carrito</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{cartCount}</p>
                </div>
              </div>
            </Link>
            <Link to={ROUTES.tiendaPedidos} className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-3xl bg-emerald-500">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis pedidos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{shopOrders.length}</p>
                </div>
              </div>
            </Link>
            {showMyCreatedProducts && (
              <Link to={ROUTES.tiendaMisProductos} className="card hover:shadow-2xl transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-3xl bg-fuchsia-600">
                    <Boxes className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis productos creados</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {myProductCount} producto{myProductCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </Link>
            )}
            <Link to={ROUTES.facturas} className="card hover:shadow-2xl transition-shadow">
              <div className="flex items-center">
                <div className="p-3 rounded-3xl bg-amber-500">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis facturas</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">Descargar / ver</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Historial de Compras ─────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              Mis Compras
            </h2>
            <Link to={ROUTES.creditos} className="text-violet-600 hover:text-violet-700 text-sm font-medium">
              Comprar créditos →
            </Link>
          </div>

          <div className="card overflow-hidden p-0">
            {loadingPurchases ? (
              /* Skeleton loader */
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
                    <div className="w-10 h-10 rounded-3xl bg-gray-200 dark:bg-gray-700 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : purchases.length === 0 ? (
              /* Empty state */
              <div className="py-16 text-center px-6">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Aún no has realizado ninguna compra
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                  Adquiere créditos para publicar empleos, torneos, eventos y más en la plataforma.
                </p>
                <Link
                  to={ROUTES.creditos}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-3xl transition-colors"
                >
                  <Coins className="w-4 h-4" />
                  Ver paquetes de créditos
                </Link>
              </div>
            ) : (
              <>
                {/* Tabla desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Fecha</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Detalle</th>
                        <th className="text-right px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Valor</th>
                        <th className="text-center px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Estado</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">ID Transacción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs">
                            {formatDate(p.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900 dark:text-white">{p.package_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{p.package_description}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-gray-900 dark:text-white">{formatCOP(p.amount_cop)}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {purchaseStatusBadge(p)}
                          </td>
                          <td className="px-6 py-4">
                            {p.mp_payment_id ? (
                              <span className="font-mono text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                {p.mp_payment_id.slice(0, 14)}…
                                <ExternalLink className="w-3 h-3 opacity-50" />
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Lista mobile */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
                  {purchases.map((p) => (
                    <div key={p.id} className="px-4 py-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.package_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{p.package_description}</p>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm shrink-0">
                          {formatCOP(p.amount_cop)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {purchaseStatusBadge(p)}
                        <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(p.created_at)}</span>
                      </div>
                      {p.mp_payment_id && (
                        <p className="font-mono text-[11px] text-gray-400 dark:text-gray-500 truncate">
                          ID: {p.mp_payment_id}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Acciones rápidas — todos los módulos */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Acciones rápidas</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Crea cualquier entidad del sistema con un clic
              </p>
              <div className="flex flex-wrap gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.link}
                    className={`inline-flex items-center px-4 py-2.5 rounded-3xl font-bold text-sm shadow-sm ${action.tone}`}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity - Empleos */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actividad reciente - Empleos</h2>
              {applications?.results && applications.results.length > 0 ? (
                <div className="space-y-4">
                  {applications.results.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-3xl">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{app.offer_title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{app.applicant_name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[app.status] || statusConfig.default}`}>
                        {app.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay actividad reciente</p>
                  <Link to="/empleos" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 text-sm mt-2 inline-block">
                    Explorar empleos →
                  </Link>
                </div>
              )}
            </div>

            {!isCompany && (
              <div className="card bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Completa tu perfil</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Los perfiles completos reciben 3x más vistas de reclutadores
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <Link to="/profile" className="text-violet-600 dark:text-violet-400 font-medium hover:text-violet-700 dark:hover:text-violet-300">
                  Continuar edición →
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mi perfil</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-violet-100 dark:bg-violet-950/40 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="inline-block px-2 py-0.5 text-xs bg-violet-100 dark:bg-violet-950/40 text-blue-700 rounded-full">
                      {user?.user_type === 'company' ? 'Empresa' : 'Persona'}
                    </span>
                    {canManageContent(user) && (
                      <span className="inline-block px-2 py-0.5 text-xs bg-amber-100 text-amber-800 border border-amber-200 font-semibold rounded-full">
                        🪙 {user?.credits ?? 0} Créditos
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link 
                to="/profile" 
                className="block w-full text-center py-2 border border-gray-300 dark:border-gray-700 rounded-3xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-900/50"
              >
                Editar perfil
              </Link>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notificaciones</h2>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">No tienes notificaciones nuevas</p>
              </div>
            </div>

            {isCompany && (
              <div className="card bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <h2 className="text-lg font-bold mb-2">Tu plan</h2>
                <p className="text-2xl font-bold mb-1">Gratis</p>
                <p className="text-violet-100 text-sm mb-4">
                  Publica en los 5 módulos con créditos
                </p>
                <Link
                  to={ROUTES.creditos}
                  className="block w-full py-2 bg-white text-violet-600 rounded-3xl font-medium hover:bg-violet-50 text-center"
                >
                  Obtener créditos
                </Link>
              </div>
            )}

            <div className="card bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <h2 className="text-lg font-bold mb-2 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Tienda
              </h2>
              <p className="text-violet-100 text-sm mb-4">
                {shopOrders.length} pedido{shopOrders.length === 1 ? '' : 's'} · {cartCount} en carrito
              </p>
              <Link
                to={ROUTES.tiendaPedidos}
                className="block w-full py-2 bg-white text-violet-600 rounded-3xl font-medium hover:bg-violet-50 text-center"
              >
                Ver mis pedidos
              </Link>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h2 className="text-lg font-bold mb-2 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Deportes
              </h2>
              <p className="text-green-100 text-sm mb-4">
                {sportsStats.activeTournaments} torneos disponibles
              </p>
              <Link 
                to="/deportes" 
                className="block w-full py-2 bg-white text-green-600 rounded-3xl font-medium hover:bg-green-50 text-center"
              >
                Ver torneos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;