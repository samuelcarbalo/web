import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  FileText,
} from "lucide-react";
import { useJob, useApplyJob, useDeleteJob } from "../../hooks/useJobs";
import { useAuthStore } from "../../store/authStore";
import { usePermissions } from "../../hooks/usePermissions";
import Modal from "../../components/UI/Modal";

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = id || "";
  const { isAuthenticated } = useAuthStore();
  const { isOwner: checkIsOwner } = usePermissions();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cover_letter: "",
    resume: null as File | null,
  });

  const { data: job, isLoading } = useJob(jobId);
  const applyMutation = useApplyJob();
  const deleteMutation = useDeleteJob();

  React.useEffect(() => {
    if (job) {
      document.title = `${job.title} | Portal de Empleo | CordobaTech`;
    }
  }, [job]);

  const isOwner = checkIsOwner(job);
  const hasApplied = false; // TODO: Check if user already applied

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyMutation.mutate(
      {
        jobId,
        data: {
          cover_letter: applicationData.cover_letter,
          resume: applicationData.resume || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowApplyModal(false);
          alert("¡Aplicación enviada con éxito!");
        },
      },
    );
  };

  const handleDelete = () => {
    if (confirm("¿Estás seguro de que deseas eliminar esta oferta?")) {
      deleteMutation.mutate(jobId, {
        onSuccess: () => navigate("/jobs/my_offers"),
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
          <h2 className="text-2xl font-bold text-gray-900">
            Empleo no encontrado
          </h2>
          <Link to="/jobs" className="text-primary-600 mt-2 inline-block">
            ← Volver a empleos
          </Link>
        </div>
      </div>
    );
  }

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "full_time":
        return "Tiempo completo";
      case "part_time":
        return "Medio tiempo";
      case "contract":
        return "Contrato";
      case "freelance":
        return "Freelance";
      case "internship":
        return "Pasantía";
      default:
        return type;
    }
  };

  const getJobTypeStyle = (type: string) => {
    switch (type) {
      case "full_time":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/85";
      case "part_time":
        return "bg-blue-50 text-blue-700 border border-blue-200/85";
      case "contract":
        return "bg-amber-50 text-amber-700 border border-amber-200/85";
      case "freelance":
        return "bg-purple-50 text-purple-700 border border-purple-200/85";
      case "internship":
        return "bg-cyan-50 text-cyan-700 border border-cyan-200/85";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200/85";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <Link
            to="/jobs"
            className="inline-flex items-center text-slate-500 hover:text-blue-600 font-semibold text-sm transition-colors mb-5 group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Volver a empleos
          </Link>
 
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Company Logo in Header */}
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                {job.logo ? (
                  <img
                    src={job.logo}
                    alt={job.company_name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60 rounded-md">
                    {job.category}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md ${getJobTypeStyle(job.job_type)}`}>
                    {getJobTypeLabel(job.job_type)}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3.5 text-xs sm:text-sm text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-900">{job.company_name}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>{job.location}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Publicado {new Date(job.posted_at).toLocaleDateString("es-CO")}</span>
                  </span>
                </div>
              </div>
            </div>
 
            <div className="flex items-center gap-2.5 self-start md:self-center">
              <button className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
 
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2.5">
                Descripción del puesto
              </h2>
              <div className="prose prose-sm max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>
 
            {job.requirements && (
              <div className="card bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2.5">
                  Requisitos
                </h2>
                <div className="prose prose-sm max-w-none text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </div>
              </div>
            )}
 
            {/* Company Info */}
            <div className="card bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2.5">
                Sobre la empresa
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  {job.logo ? (
                    <img
                      src={job.logo}
                      alt={job.company_name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {job.company_name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    {"Empresa certificada y registrada en CordobaTech"}
                  </p>
                </div>
              </div>
            </div>
          </div>
 
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="card bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border border-blue-100/70 shadow-sm rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 text-base mb-4">
                ¿Interesado en este empleo?
              </h3>
 
              {isAuthenticated ? (
                <>
                  {isOwner ? (
                    <div className="space-y-3">
                      <Link
                        to={`/jobs/edit/${job.id}`}
                        className="w-full btn-secondary block text-center font-bold py-2.5 text-sm rounded-xl"
                      >
                        Editar oferta
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="w-full py-2.5 px-4 border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                      >
                        Eliminar oferta
                      </button>
                      <Link
                        to={`/jobs/${job.id}/applications`}
                        className="w-full btn-primary block text-center font-bold py-2.5 text-sm rounded-xl"
                      >
                        Ver aplicaciones ({job.applications_count})
                      </Link>
                    </div>
                  ) : hasApplied ? (
                    <div className="text-center py-4 bg-white rounded-xl border border-green-100 shadow-sm">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Send className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-green-800 font-bold text-sm">
                        Ya aplicaste a este empleo
                      </p>
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        La empresa revisará tu aplicación
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="w-full btn-primary font-bold py-3 text-sm rounded-xl cursor-pointer"
                    >
                      Aplicar ahora
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs font-medium text-slate-500 mb-4">
                    Inicia sesión para poder postularte a esta vacante laboral.
                  </p>
                  <Link
                    to="/login"
                    className="w-full btn-primary block text-center font-bold py-3 text-sm rounded-xl"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              )}
            </div>
 
            {/* Job Details */}
            <div className="card bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-4 border-b border-slate-100 pb-2">
                Detalles del empleo
              </h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center">
                    <DollarSign className="w-4.5 h-4.5 mr-2 text-emerald-500" />
                    Salario
                  </span>
                  <span className="font-bold text-slate-800">
                    {job.salary_min || job.salary_max
                      ? `$${job.salary_min?.toLocaleString() || ""} - $${job.salary_max?.toLocaleString() || ""} ${job.currency}`
                      : "A convenir"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center">
                    <Briefcase className="w-4.5 h-4.5 mr-2 text-blue-500" />
                    Tipo
                  </span>
                  <span className="font-bold text-slate-800">
                    {getJobTypeLabel(job.job_type)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center">
                    <MapPin className="w-4.5 h-4.5 mr-2 text-rose-500" />
                    Ubicación
                  </span>
                  <span className="font-bold text-slate-800">
                    {job.location}
                  </span>
                </div>
                {job.expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center">
                      <Calendar className="w-4.5 h-4.5 mr-2 text-slate-400" />
                      Vence
                    </span>
                    <span className="font-bold text-slate-850">
                      {new Date(job.expires_at).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Aplicar a este empleo"
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carta de presentación
            </label>
            <textarea
              rows={4}
              required
              value={applicationData.cover_letter}
              onChange={(e) =>
                setApplicationData({
                  ...applicationData,
                  cover_letter: e.target.value,
                })
              }
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
                  applicationData.resume
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-300 hover:border-primary-500"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) {
                    setApplicationData({
                      ...applicationData,
                      resume: e.dataTransfer.files[0],
                    });
                  }
                }}
              >
                <FileText
                  className={`w-8 h-8 mx-auto mb-2 ${applicationData.resume ? "text-primary-600" : "text-gray-400"}`}
                />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    setApplicationData({
                      ...applicationData,
                      resume: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                  id="resume"
                />
                <label
                  htmlFor="resume"
                  className="cursor-pointer text-primary-600 font-medium hover:text-primary-500"
                >
                  {applicationData.resume
                    ? applicationData.resume.name
                    : "Haz clic o arrastra tu archivo aquí"}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, DOC, DOCX hasta 5MB
                </p>
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
              disabled={
                applyMutation.isPending || !applicationData.cover_letter
              }
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {applyMutation.isPending ? "Enviando..." : "Enviar aplicación"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetail;
