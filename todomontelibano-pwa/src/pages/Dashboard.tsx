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
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMyApplications, useJobs, useAdminJobs } from '../hooks/useJobs';
import { useTournaments } from '../hooks/useSports';
import { useContactMessages } from '../hooks/useContact';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: applications } = useMyApplications();
  
  // Datos de deportes
  
  // Solo para empresas/managers
  let isCompany = false;
  const isManager = user?.role === 'manager';
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
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';
  const isSuperUser = !!user?.is_superuser;
  const { data: contactMessages = [] } = useContactMessages(isSuperUser, { is_read: false });
  const unreadContactCount = contactMessages.filter((m) => !m.is_read).length;
  const { data: tournaments } = useTournaments({ status: 'active', enabled: false });
  const { data: manager_tournaments } = useTournaments({ status: 'active', enabled: isManagerOrAdmin });
  

  // Stats de deportes (nuevo)
  const sportsStats = {
    activeTournaments: tournaments?.results?.filter((t: any) => t.status === 'active').length || 0,
    myTournaments: isManagerOrAdmin ? (manager_tournaments?.count || 0) : 0,
    totalTeams: tournaments?.results?.reduce((acc: number, t: any) => acc + (t.teams_count || 0), 0) || 0,
  };

  const quickActions = isCompany ? [
    { label: 'Publicar empleo', icon: Plus, link: '/jobs/create', primary: true },
    { label: 'Publicar propiedad', icon: House, link: '/real-estate/create', primary: false },
    { label: 'Mis propiedades', icon: House, link: '/real-estate/my_listings', primary: false },
    { label: 'Ver aplicaciones', icon: Eye, link: '/applications', primary: false },
  ] : [
    { label: 'Buscar empleos', icon: Briefcase, link: '/jobs', primary: true },
    { label: 'Ver propiedades', icon: House, link: '/real-estate', primary: false },
    { label: 'Editar perfil', icon: User, link: '/profile', primary: false },
  ];

  // Acciones rápidas de deportes (nuevo)
  const sportsQuickActions = isManagerOrAdmin ? [
    { label: 'Crear torneo', icon: Trophy, link: '/sports/tournaments/create', primary: true, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Ver torneos', icon: Calendar, link: '/sports/my_tournaments', primary: false, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200' },
  ] : [
    { label: 'Ver torneos', icon: Trophy, link: '/sports', primary: true, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Mis equipos', icon: Users, link: '/sports/teams', primary: false, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="page-container">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Hola, {user?.first_name}! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isCompany 
              ? 'Gestiona tus publicaciones, torneos y encuentra candidatos' 
              : 'Encuentra empleos, torneos deportivos y más oportunidades'}
          </p>
        </div>

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

        {/* NUEVA SECCIÓN: Deportes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-green-600" />
              Deportes
            </h2>
            <Link to="/sports" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat: Torneos activos */}
            <Link to="/sports/my_tournaments/active" className="card hover:shadow-2xl transition-shadow">
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

            {/* Stat: Mis torneos (solo managers/admins) */}
            {isManagerOrAdmin && (
              <Link to="/sports/my_tournaments" className="card hover:shadow-2xl transition-shadow">
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

            {/* Stat: Equipos inscritos */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions - Empleos */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Acciones rápidas - Empleos - Deportes</h2>
              <div className="flex flex-wrap gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.link}
                    className={`flex items-center px-4 py-2 rounded-3xl font-medium ${
                      action.primary 
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Link>
                ))}
              </div>
              <br></br>
              <div className="flex flex-wrap gap-3">
                {sportsQuickActions.map((action) => (
                  <Link
                  key={action.label}
                  to={action.link}
                  className={`flex items-center px-4 py-2 rounded-3xl font-medium ${
                    action.primary 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Link>
                ))}
              </div>
            </div>

            {/* Torneos destacados (próximos) */}
            {/* <div className="card">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-green-600" />
                Próximos torneos
              </h2>
              {tournaments?.results && tournaments.results.length > 0 ? (
                <div className="space-y-3">
                  {tournaments.results.slice(0, 3).map((tournament: any) => (
                    <Link 
                      key={tournament.id} 
                      to={`/sports/tournaments/${tournament.slug}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-3xl hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-3xl flex items-center justify-center mr-3 ${
                          tournament.sport_type === 'football' ? 'bg-green-500' :
                          tournament.sport_type === 'softball' ? 'bg-yellow-500' :
                          tournament.sport_type === 'basketball' ? 'bg-orange-500' : 'bg-violet-50 dark:bg-violet-950/300'
                        }`}>
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{tournament.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(tournament.start_date).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'short'
                            })} • {tournament.teams_count}/{tournament.max_teams} equipos
                          </p>
                        </div>
                      </div>
                      <span className="text-green-600 text-sm font-medium">Ver →</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Trophy className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No hay torneos próximos</p>
                  <Link to="/sports" className="text-green-600 text-sm mt-1 inline-block">
                    Explorar torneos
                  </Link>
                </div>
              )}
            </div> */}

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
                  <Link to="/jobs" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 text-sm mt-2 inline-block">
                    Explorar empleos →
                  </Link>
                </div>
              )}
            </div>

            {/* Recomendaciones */}
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
            
            {/* Mi Perfil Resumen */}
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
                    {user?.role === 'manager' && (
                      <span className="inline-block px-2 py-0.5 text-xs bg-amber-100 text-amber-800 border border-amber-200 font-semibold rounded-full">
                        🪙 {user.credits !== undefined ? user.credits : 0} Créditos
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

            {/* Notificaciones */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notificaciones</h2>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">No tienes notificaciones nuevas</p>
              </div>
            </div>

            {/* Plan actual (solo empresas) */}
            {isCompany && (
              <div className="card bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <h2 className="text-lg font-bold mb-2">Tu plan</h2>
                <p className="text-2xl font-bold mb-1">Gratis</p>
                <p className="text-violet-100 text-sm mb-4">
                  3 publicaciones activas
                </p>
                <button className="w-full py-2 bg-white text-violet-600 dark:text-violet-400 rounded-3xl font-medium hover:bg-violet-50 dark:bg-violet-950/30">
                  Actualizar plan
                </button>
              </div>
            )}

            {/* Resumen Deportes (nuevo) */}
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h2 className="text-lg font-bold mb-2 flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Deportes
              </h2>
              <p className="text-green-100 text-sm mb-4">
                {sportsStats.activeTournaments} torneos disponibles
              </p>
              <Link 
                to="/sports" 
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