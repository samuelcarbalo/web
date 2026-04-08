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
  Settings,
  Trophy,
  Users,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMyApplications, useJobs, useAdminJobs } from '../hooks/useJobs';
import { useTournaments } from '../hooks/useSports';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: applications } = useMyApplications();
  
  // Datos de deportes
  
  // Solo para empresas/managers
  let isCompany = false;
  const isManager = user?.role === 'manager';
  if (isManager){
    console.log(user?.id)
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
    interview: 'bg-blue-100 text-blue-800',
    hired: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800',
  };
 
  // Stats principales (empleos)
  const stats = isCompany ? [
    { 
      title: 'Mis empleos activos', 
      value: (myJobs as any)?.count || 0,
      icon: Briefcase,
      color: 'bg-blue-500',
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
      color: 'bg-blue-500',
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
  const { data: tournaments } = useTournaments({ status: 'active', enabled: false });
  const { data: manager_tournaments } = useTournaments({ status: 'active', enabled: isManager });
  

  // Stats de deportes (nuevo)
  const sportsStats = {
    activeTournaments: tournaments?.results?.filter((t: any) => t.status === 'active').length || 0,
    myTournaments: isManager ? (manager_tournaments?.count || 0) : 0,
    totalTeams: tournaments?.results?.reduce((acc: number, t: any) => acc + (t.teams_count || 0), 0) || 0,
  };

  const quickActions = isCompany ? [
    { label: 'Publicar empleo', icon: Plus, link: '/jobs/create', primary: true },
    { label: 'Ver aplicaciones', icon: Eye, link: '/applications', primary: false },
    { label: 'Configuración', icon: Settings, link: '/settings', primary: false },
  ] : [
    { label: 'Buscar empleos', icon: Briefcase, link: '/jobs', primary: true },
    { label: 'Editar perfil', icon: User, link: '/profile', primary: false },
    { label: 'Configuración', icon: Settings, link: '/settings', primary: false },
  ];

  // Acciones rápidas de deportes (nuevo)
  const sportsQuickActions = isManager ? [
    { label: 'Crear torneo', icon: Trophy, link: '/sports/tournaments/create', primary: true, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Ver torneos', icon: Calendar, link: '/sports/my_tournaments', primary: false, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  ] : [
    { label: 'Ver torneos', icon: Trophy, link: '/sports/my_tournaments', primary: true, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Mis equipos', icon: Users, link: '/sports/teams', primary: false, color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user?.first_name}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            {isCompany 
              ? 'Gestiona tus publicaciones, torneos y encuentra candidatos' 
              : 'Encuentra empleos, torneos deportivos y más oportunidades'}
          </p>
        </div>

        {/* Stats Grid - Empleos */}
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
              Empleos
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.title}
              to={stat.link}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* NUEVA SECCIÓN: Deportes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-green-600" />
              Deportes
            </h2>
            <Link to="/sports" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Ver todos →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat: Torneos activos */}
            <Link to="/sports/my_tournaments/active" className="card hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-white border-green-200">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Torneos activos</p>
                  <p className="text-2xl font-bold text-gray-900">{sportsStats.activeTournaments}</p>
                </div>
              </div>
            </Link>

            {/* Stat: Mis torneos (solo managers) */}
            {isManager && (
              <Link to="/sports/my_tournaments" className="card hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-600">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Mis torneos</p>
                    <p className="text-2xl font-bold text-gray-900">{sportsStats.myTournaments}</p>
                  </div>
                </div>
              </Link>
            )}

            {/* Stat: Equipos inscritos */}
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Equipos inscritos</p>
                  <p className="text-2xl font-bold text-gray-900">{sportsStats.totalTeams}</p>
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones rápidas - Empleos - Deportes</h2>
              <div className="flex flex-wrap gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.link}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                      action.primary 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                    action.primary 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-green-600" />
                Próximos torneos
              </h2>
              {tournaments?.results && tournaments.results.length > 0 ? (
                <div className="space-y-3">
                  {tournaments.results.slice(0, 3).map((tournament: any) => (
                    <Link 
                      key={tournament.id} 
                      to={`/sports/tournaments/${tournament.slug}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          tournament.sport_type === 'football' ? 'bg-green-500' :
                          tournament.sport_type === 'softball' ? 'bg-yellow-500' :
                          tournament.sport_type === 'basketball' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{tournament.name}</p>
                          <p className="text-sm text-gray-600">
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad reciente - Empleos</h2>
              {applications?.results && applications.results.length > 0 ? (
                <div className="space-y-4">
                  {applications.results.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{app.offer_title}</p>
                        <p className="text-sm text-gray-600">{app.applicant_name}</p>
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
                  <Link to="/jobs" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
                    Explorar empleos →
                  </Link>
                </div>
              )}
            </div>

            {/* Recomendaciones */}
            {!isCompany && (
              <div className="card bg-blue-50 border-blue-200">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Completa tu perfil</h2>
                <p className="text-gray-600 mb-4">
                  Los perfiles completos reciben 3x más vistas de reclutadores
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <Link to="/profile" className="text-blue-600 font-medium hover:text-blue-700">
                  Continuar edición →
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Mi Perfil Resumen */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Mi perfil</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {user?.user_type === 'company' ? 'Empresa' : 'Persona'}
                  </span>
                </div>
              </div>
              <Link 
                to="/profile" 
                className="block w-full text-center py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Editar perfil
              </Link>
            </div>

            {/* Notificaciones */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Notificaciones</h2>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">No tienes notificaciones nuevas</p>
              </div>
            </div>

            {/* Plan actual (solo empresas) */}
            {isCompany && (
              <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <h2 className="text-lg font-bold mb-2">Tu plan</h2>
                <p className="text-2xl font-bold mb-1">Gratis</p>
                <p className="text-blue-100 text-sm mb-4">
                  3 publicaciones activas
                </p>
                <button className="w-full py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50">
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
                className="block w-full py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 text-center"
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