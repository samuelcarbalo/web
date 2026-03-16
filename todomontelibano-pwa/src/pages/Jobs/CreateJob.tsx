import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, User, Building2, Bell, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useMyApplications } from '../../hooks/useJobs';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: applications } = useMyApplications();

  const stats = [
    { 
      name: 'Mis aplicaciones', 
      value: applications?.count || 0, 
      icon: Briefcase,
      href: '/applications',
      color: 'bg-blue-500'
    },
    { 
      name: 'Mensajes', 
      value: 0, 
      icon: Bell,
      href: '#',
      color: 'bg-yellow-500'
    },
    { 
      name: 'Perfil completado', 
      value: '85%', 
      icon: User,
      href: '/profile',
      color: 'bg-green-500'
    },
  ];

  if (user?.user_type === 'company') {
    stats.push({
      name: 'Empleos activos',
      value: 5, // TODO: Fetch real data
      icon: Building2,
      href: '/jobs/manage',
      color: 'bg-purple-500'
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user?.first_name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Este es tu panel de control en TodoMontelibano
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad reciente</h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">No hay actividad reciente</p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recomendaciones</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Completa tu perfil</p>
                  <p className="text-sm text-gray-600">
                    Los perfiles completos reciben 3x más vistas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;