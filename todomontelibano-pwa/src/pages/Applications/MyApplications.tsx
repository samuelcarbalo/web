import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';
import { useMyApplications } from '../../hooks/useJobs';
import type { JobApplication } from '../../types';

const MyApplications: React.FC = () => {
  const { data: applicationsData, isLoading } = useMyApplications();

  const getStatusIcon = (status: JobApplication['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'reviewing':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'shortlisted':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'hired':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: JobApplication['status']): string => {
    const statusMap: Record<JobApplication['status'], string> = {
      pending: 'Pendiente',
      reviewing: 'En revisión',
      shortlisted: 'Preseleccionado',
      rejected: 'No seleccionado',
      hired: 'Contratado',
      // Debes agregar los estados que faltan para cumplir con el tipo
      applied: 'Aplicado',
      interview: 'Entrevista'
    };
  
    return statusMap[status];
  };

  const getStatusColor = (status: JobApplication['status']) => {
    const colorMap: Record<JobApplication['status'], string> = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
      shortlisted: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      hired: 'bg-green-100 text-green-800 border-green-300',
      // Agregamos el estado faltante:
      applied: 'bg-purple-50 text-purple-700 border-purple-200', 
      // Si tu interfaz tiene otros, asegúrate de incluirlos aquí también
      interview: 'bg-indigo-50 text-indigo-700 border-indigo-200' 
    };
    
    return colorMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const applications = applicationsData?.results || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Aplicaciones</h1>
          <p className="mt-2 text-gray-600">
            Seguimiento de tus postulaciones a empleos
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No has aplicado a ningún empleo
            </h3>
            <p className="text-gray-600 mb-6">
              Explora las ofertas disponibles y postula a las que se ajusten a tu perfil
            </p>
            <Link to="/jobs" className="btn-primary inline-flex items-center">
              Ver empleos disponibles
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Info del empleo */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {application.offer_title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {application.applicant_name}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {application.locatinon}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Aplicado el {new Date(application.applied_at).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Mensaje según estado */}
                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      {getStatusIcon(application.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Estado: {getStatusText(application.status)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {application.status === 'pending' && 'Tu aplicación está pendiente de revisión por parte de la empresa.'}
                          {application.status === 'reviewing' && 'La empresa está revisando tu perfil y experiencia.'}
                          {application.status === 'shortlisted' && '¡Felicitaciones! Has sido preseleccionado para esta posición.'}
                          {application.status === 'rejected' && 'Lamentablemente no fuiste seleccionado para esta posición.'}
                          {application.status === 'hired' && '¡Felicidades! Has sido contratado para esta posición.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-row md:flex-col gap-2">
                    <Link
                      to={`/jobs/${application.offer_id}`}
                      className="btn-secondary text-sm py-2 px-4"
                    >
                      Ver empleo
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {applications.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total aplicaciones', value: applications.length },
              { label: 'En revisión', value: applications.filter(a => ['pending', 'reviewing'].includes(a.status)).length },
              { label: 'Preseleccionado', value: applications.filter(a => a.status === 'shortlisted').length },
              { label: 'Contratado', value: applications.filter(a => a.status === 'hired').length },
            ].map((stat) => (
              <div key={stat.label} className="card text-center">
                <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;