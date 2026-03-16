import { useQueryClient } from '@tanstack/react-query'; // O la librería que estés usando para los hooks
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  ChevronLeft, 
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { useJobApplications, useUpdateApplication } from '../../hooks/useJobs';
import type { JobApplication, Application } from '../../types';
import Modal from '../../components/UI/Modal';

const ReceivedApplications: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const id = jobId ? parseInt(jobId) : undefined;
    const [hasChanged, setHasChanged] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
  
    const { data: applicationsData, isLoading } = useJobApplications(id);
    if (applicationsData) {
        console.log('Applications data:', JSON.stringify(applicationsData));
    }
    const updateApplication = useUpdateApplication();

    const applications: Application[] = applicationsData?.results || [];
    const filteredApplications = applications.filter(app => {
        const matchesStatus = !statusFilter || app.status === statusFilter;
        const matchesSearch = !searchTerm || 
            app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicant_email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });
    const queryClient = useQueryClient();
    const getStatusIcon = (status: JobApplication['status']) => {
        switch (status) {
        case 'applied':
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

    const getStatusColor = (status: JobApplication['status']) => {
        const colorMap: Record<JobApplication['status'], string> = {
        pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
        shortlisted: 'bg-green-50 text-green-700 border-green-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        hired: 'bg-green-100 text-green-800 border-green-300',
        applied: 'bg-purple-50 text-purple-700 border-purple-200', 
        interview: 'bg-indigo-50 text-indigo-700 border-indigo-200' 
      };
      
      return colorMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };
    const handleCloseModal = () => {
        setSelectedApplication(null);
        
        // Si hubo cambios, refrescamos la página o los datos
        if (hasChanged) {
            // Opción A: Recarga completa (más sencillo)
            queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    
            // Opción B: Si usas React Query y quieres algo más elegante sin parpadeo:
            // queryClient.invalidateQueries(['applications']); 
            
            setHasChanged(false); // Resetear el estado
        }
    };
    const handleStatusChange = async (applicationId: string, newStatus: JobApplication['status']) => {
        try {
            // Llamamos a la mutación
            await updateApplication.mutateAsync({
                id: applicationId,
                data: { 
                    status: newStatus 
                }
            });
    
            // Actualizamos el estado local
            setHasChanged(true);
            // Opcional: Actualizar el estado local del modal para que los botones cambien de color inmediatamente
            if (selectedApplication) {
                setSelectedApplication({
                    ...selectedApplication,
                    status: newStatus
                });
            }
    
            console.log(`Estado de la aplicación ${applicationId} actualizado a ${newStatus}`);
        } catch (error) {
            console.error('Error al actualizar el estado:', error);
            // Aquí podrías mostrar una notificación de error (Toast)
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to={id ? `/jobs/${id}` : '/dashboard'} 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {id ? 'Volver al empleo' : 'Volver al dashboard'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Aplicaciones recibidas' : 'Todas las aplicaciones recibidas'}
          </h1>
          <p className="mt-2 text-gray-600">
            {id 
              ? `Revisa los candidatos que aplicaron a este empleo` 
              : 'Gestiona todas las aplicaciones a tus empleos publicados'}
          </p>
        </div>

        {/* Filtros */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Todos los estados</option>
                <option value="applied">Aplicado</option>
                <option value="interview">Entrevista</option>
                <option value="reviewing">En revisión</option>
                <option value="shortlisted">Preseleccionado</option>
                <option value="rejected">Rechazado</option>
                <option value="hired">Contratado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de aplicaciones */}
        {filteredApplications.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay aplicaciones {statusFilter ? 'con este filtro' : 'aún'}
            </h3>
            <p className="text-gray-600">
              {statusFilter 
                ? 'Prueba con otro filtro de estado' 
                : 'Las aplicaciones aparecerán aquí cuando los candidatos apliquen a tus empleos'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => (
              <div key={application.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Avatar/Info del candidato */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">
                        {application.applicant_name?.[0]}{application.applicant_name?.[1]}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {application.applicant_name}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              {application.applicant_email}
                            </span>
                            {/* {application.applicant.phone && (
                              <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {application.applicant.phone}
                              </span> */}
                            {/* )} */}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border & ${getStatusColor(application.status)}`}>
                          
                          {/* Agregamos 'applied' a la lógica de visualización */}
                          {(application.status === 'pending' || application.status === 'applied') && 'Pendiente'}
                          {application.status === 'reviewing' && 'En revisión'}
                          {application.status === 'shortlisted' && 'Preseleccionado'}
                          {application.status === 'rejected' && 'Rechazado'}
                          {application.status === 'hired' && 'Contratado'}
                          {application.status === 'interview' && 'Entrevista'}
                          {getStatusIcon(application.status)}

                        </span>
                      </div>

                      <p className="text-sm text-gray-500 flex items-center gap-4">
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {application.offer_title}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Aplicó el {new Date(application.applied_at).toLocaleDateString('es-CO')}
                        </span>
                      </p>

                      {application.cover_letter && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            "{application.cover_letter}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-row md:flex-col gap-2">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="btn-secondary text-sm py-2 px-4 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalle
                    </button>
                    
                    {application.cv_file && (
                      <a
                        href={application.cv_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-sm py-2 px-4 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar CV
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: applications.length, color: 'bg-gray-500' },
            { label: 'Pendientes', value: applications.filter(a => a.status === 'pending').length, color: 'bg-yellow-500' },
            { label: 'En revisión', value: applications.filter(a => a.status === 'reviewing').length, color: 'bg-blue-500' },
            { label: 'Preseleccionados', value: applications.filter(a => a.status === 'shortlisted').length, color: 'bg-green-500' },
            { label: 'Contratados', value: applications.filter(a => a.status === 'hired').length, color: 'bg-green-600' },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className={`w-3 h-3 rounded-full ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedApplication && (
        <Modal
          isOpen={!!selectedApplication}
          // onClose={() => setSelectedApplication(null)}
          // Ahora, tanto la "X" como el clic fuera del modal llamarán a handleCloseModal
          onClose={handleCloseModal}
          title="Detalle de aplicación"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {selectedApplication.applicant_name[0]}
                  {selectedApplication.applicant_name[1]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedApplication.applicant_name}
                </h3>
                {/* <p className="text-gray-600">{selectedApplication.applicant.email}</p>
                {selectedApplication.applicant.phone && (
                  <p className="text-gray-600">{selectedApplication.applicant.phone}</p>
                )} */}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Empleo aplicado</h4>
              <p className="text-gray-600">{selectedApplication.offer_title}</p>
            </div>

            {selectedApplication.cover_letter && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Carta de presentación</h4>
                <p className="text-gray-600 text-sm whitespace-pre-line">
                  {selectedApplication.cover_letter}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Cambiar estado</h4>
              <div className="flex flex-wrap gap-2">
                {(['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedApplication.id, status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      selectedApplication.status === status 
                        ? getStatusColor(status) 
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {status === 'pending' && 'Pendiente'}
                    {status === 'reviewing' && 'En revisión'}
                    {status === 'shortlisted' && 'Preseleccionar'}
                    {status === 'rejected' && 'Rechazar'}
                    {status === 'hired' && 'Contratar'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                // onClick={() => setSelectedApplication(null)}
                onClick={handleCloseModal}
                className="flex-1 btn-secondary"
              >
                Cerrar
              </button>
              {selectedApplication.cv_file && (
                <a
                  href={selectedApplication.cv_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-primary text-center"
                >
                  Descargar CV
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReceivedApplications;