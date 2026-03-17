import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Building2, 
  Calendar,
  Share2,
  Bookmark,
  ChevronLeft,
  Send,
  FileText
} from 'lucide-react';
import { useJob, useApplyJob, useDeleteJob } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/authStore';
import Modal from '../../components/UI/Modal';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = id || '';
  const { user, isAuthenticated } = useAuthStore();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({ cover_letter: '', resume: null as File | null });
  
  const { data: job, isLoading } = useJob(jobId);
  const applyMutation = useApplyJob();
  const deleteMutation = useDeleteJob();

  // Agrega el ?. después de posted_by también
  const isOwner = user?.id === job?.posted_by?.id || user?.role === 'manager';
  const hasApplied = false; // TODO: Check if user already applied

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate({
      jobId,
      data: {
        cover_letter: applicationData.cover_letter,
        resume: applicationData.resume || undefined,
      }
    }, {
      onSuccess: () => {
        setShowApplyModal(false);
        alert('¡Aplicación enviada con éxito!');
      }
    });
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      deleteMutation.mutate(jobId, {
        onSuccess: () => navigate('/jobs')
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Empleo no encontrado</h2>
          <Link to="/jobs" className="text-primary-600 mt-2 inline-block">
            ← Volver a empleos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/jobs" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a empleos
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                  {job.category}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {job.job_type === 'full_time' ? 'Tiempo completo' : 
                   job.job_type === 'part_time' ? 'Medio tiempo' : 
                   job.job_type === 'contract' ? 'Contrato' : 
                   job.job_type === 'freelance' ? 'Freelance' : 'Pasantía'}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {job.company_name}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.location}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Publicado {new Date(job.posted_at).toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Bookmark className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Descripción del puesto</h2>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Requisitos</h2>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
                {job.requirements}
              </div>
            </div>

            {/* Company Info */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sobre la empresa</h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  {job.logo ? (
                    <img src={job.logo} alt={job.company_name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{job.company_name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {'Empresa registrada en TodoMontelibano'}
                    {/* job.company_description ||  */}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="card bg-primary-50 border-primary-200">
              <h3 className="font-bold text-gray-900 mb-4">¿Interesado en este empleo?</h3>
              
              {isAuthenticated ? (
                <>
                  {isOwner ? (
                    <div className="space-y-3">
                      <Link
                        to={`/jobs/edit/${job.id}`}
                        className="w-full btn-secondary block text-center"
                      >
                        Editar oferta
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                      >
                        Eliminar oferta
                      </button>
                      <Link
                        to={`/jobs/${job.id}/applications`}
                        className="w-full btn-primary block text-center"
                      >
                        Ver aplicaciones ({job.applications_count})
                      </Link>
                    </div>
                  ) : hasApplied ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Send className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-green-800 font-medium">Ya aplicaste a este empleo</p>
                      <p className="text-sm text-green-600 mt-1">La empresa revisará tu aplicación</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="w-full btn-primary py-3"
                    >
                      Aplicar ahora
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Inicia sesión para aplicar a este empleo
                  </p>
                  <Link to="/login" className="w-full btn-primary block text-center py-3">
                    Iniciar sesión
                  </Link>
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Detalles del empleo</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Salario
                  </span>
                  <span className="font-medium text-gray-900">
                    {job.salary_min || job.salary_max 
                      ? `$${job.salary_min?.toLocaleString() || ''} - $${job.salary_max?.toLocaleString() || ''} ${job.currency}`
                      : 'A convenir'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Tipo
                  </span>
                  <span className="font-medium text-gray-900">
                    {job.job_type === 'full_time' ? 'Tiempo completo' : 'Otro'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Ubicación
                  </span>
                  <span className="font-medium text-gray-900">{job.location}</span>
                </div>
                {job.expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Vence
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Date(job.expires_at).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Aplicar a este empleo">
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carta de presentación
            </label>
            <textarea
              rows={4}
              required
              value={applicationData.cover_letter}
              onChange={(e) => setApplicationData({ ...applicationData, cover_letter: e.target.value })}
              className="input-field"
              placeholder="Cuéntale a la empresa por qué eres el candidato ideal..."
            />
          </div>
          
          <div>
            {/* Modal content - Sección de CV */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CV/Resume (Obligatorio) <span className="text-red-500">*</span>
              </label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  applicationData.resume ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-500'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    setApplicationData({ ...applicationData, resume: e.dataTransfer.files[0] });
                  }
                }}
              >
                <FileText className={`w-8 h-8 mx-auto mb-2 ${applicationData.resume ? 'text-primary-600' : 'text-gray-400'}`} />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setApplicationData({ ...applicationData, resume: e.target.files?.[0] || null })}
                  className="hidden"
                  id="resume"
                />
                <label htmlFor="resume" className="cursor-pointer text-primary-600 font-medium hover:text-primary-500">
                  {applicationData.resume ? applicationData.resume.name : 'Haz clic o arrastra tu archivo aquí'}
                </label>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX hasta 5MB</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={applyMutation.isPending || !applicationData.cover_letter}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {applyMutation.isPending ? 'Enviando...' : 'Enviar aplicación'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetail;