import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users,
  MapPin,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminJobs } from '../../hooks/useJobs';
import type { Job } from '../../types';

const MyOffers: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Verificar que sea manager/empresa
  const isManager = user?.role === 'manager';
  
  // Obtener los jobs del usuario usando el hook existente
  const { data: jobsData, isLoading, error } = useAdminJobs(
    { posted_by: user?.id },
    { enabled: !!(isManager && user?.id) }
  );

  // Transformar los datos según la estructura de PaginatedResponse
  const jobs = (jobsData as any)?.results || [];
  const totalCount = (jobsData as any)?.count || 0;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      published: { bg: 'bg-green-100', text: 'text-green-800', label: 'Publicado' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Borrador' },
      closed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cerrado' },
      archived: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Archivado' },
    };
    return configs[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      full_time: 'Tiempo completo',
      part_time: 'Medio tiempo',
      contract: 'Contrato',
      freelance: 'Freelance',
      internship: 'Pasantía',
    };
    return types[type] || type;
  };

  const handleDelete = (jobId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      console.log('Eliminar job:', jobId);
    }
  };

  if (!isManager) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Acceso restringido
            </h2>
            <p className="text-gray-600 mb-4">
              Esta sección solo está disponible para cuentas de empresa.
            </p>
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
              Volver al dashboard →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mis empleos publicados
            </h1>
            <p className="mt-2 text-gray-600">
              {totalCount} {totalCount === 1 ? 'oferta activa' : 'ofertas activas'}
            </p>
          </div>
          <Link
            to="/jobs/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Publicar nuevo empleo
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="card">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-medium text-red-900">Error al cargar los empleos</h3>
                <p className="text-red-700 text-sm mt-1">Por favor, intenta de nuevo más tarde.</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && jobs.length === 0 && (
          <div className="card text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No tienes empleos publicados</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Comienza a publicar tus primeras ofertas laborales para encontrar los mejores candidatos.
            </p>
            <Link to="/jobs/create" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              Publicar mi primer empleo
            </Link>
          </div>
        )}

        {/* Jobs List */}
        {!isLoading && !error && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job: Job) => {
              const statusConfig = getStatusConfig(job.status);
              
              return (
                <div key={job.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {job.logo ? (
                            <img src={job.logo} alt={job.company_name} className="w-8 h-8 object-contain" />
                          ) : (
                            <Briefcase className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{job.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                            {job.is_featured && (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Destacado</span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{job.company_name}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{job.location}</span>
                            <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{getJobTypeLabel(job.job_type)}</span>
                            <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{job.applications_count} aplicaciones</span>
                            {job.salary_min && job.salary_max && (
                              <span className="text-green-600 font-medium">
                                ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} {job.currency}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-400 mt-2">
                            Publicado el {new Date(job.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 lg:mt-0 lg:ml-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                      <button onClick={() => navigate(`/jobs/${job.id}`)} className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4 mr-1" /><span className="text-sm">Ver</span>
                      </button>
                      
                      <button onClick={() => navigate(`/jobs/${job.id}/applications`)} className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm">Aplicaciones {job.applications_count > 0 && `(${job.applications_count})`}</span>
                      </button>
                      
                      <button onClick={() => navigate(`/jobs/edit/${job.id}`)} className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button onClick={() => handleDelete(job.id)} className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Info */}
        {!isLoading && !error && jobs.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando {jobs.length} de {totalCount} empleos
            {(jobsData as any)?.links?.next && (
              <button className="ml-4 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                Ver más <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOffers;