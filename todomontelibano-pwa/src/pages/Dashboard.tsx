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
  Settings
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useMyApplications, useJobs, useAdminJobs } from '../hooks/useJobs';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: applications } = useMyApplications();
  
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
  console.log("my jobs", JSON.stringify(myJobs))
  const statusConfig: Record<string, string> = {
    applied: 'bg-yellow-100 text-yellow-800',     // Pendiente/Esperando
    interview: 'bg-blue-100 text-blue-800',       // En proceso (Azul suele ser mejor para esto)
    hired: 'bg-green-100 text-green-800',         // ¡Éxito! (Verde)
    rejected: 'bg-red-100 text-red-800',          // No seleccionado (Rojo)
    default: 'bg-gray-100 text-gray-800',         // Cualquier otro estado
  };
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
      value: 0, // TODO: implementar favoritos
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

  const quickActions = isCompany ? [
    { label: 'Publicar empleo', icon: Plus, link: '/jobs/create', primary: true },
    { label: 'Ver aplicaciones', icon: Eye, link: '/applications', primary: false },
    { label: 'Configuración', icon: Settings, link: '/settings', primary: false },
  ] : [
    { label: 'Buscar empleos', icon: Briefcase, link: '/jobs', primary: true },
    { label: 'Editar perfil', icon: User, link: '/profile', primary: false },
    { label: 'Configuración', icon: Settings, link: '/settings', primary: false },
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
              ? 'Gestiona tus publicaciones y encuentra candidatos' 
              : 'Encuentra tu próxima oportunidad laboral'}
          </p>
        </div>

        {/* Stats Grid */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones rápidas</h2>
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
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad reciente</h2>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;