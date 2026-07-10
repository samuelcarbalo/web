import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Filter,
  ChevronDown,
  Plus,
  Building2,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/authStore';
import JsonLd from '../../components/SEO/JsonLd';
import { buildJobsCollectionSchema } from '../../components/SEO/schemas/seoSchemas';
import { ROUTES } from '../../config/seo';
import type { Job } from '../../types';

interface JobsResponse {
  links: {
    next: string | null;
    previous: string | null;
  };
  count: number;
  total_pages: number;
  current_page: number;
  results: Job[];
}

const JobsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading } = useJobs({
    search: searchTerm,
    category: selectedCategory,
    job_type: selectedType,
    }, 
    {}
  );
  const jobsData = data as JobsResponse;
  
  const categories = [
    'Tecnología',
    'Ventas',
    'Administrativo',
    'Operaciones',
    'Marketing',
    'Recursos Humanos',
    'Contabilidad',
    'Servicios',
  ];

  const jobTypes = [
    { value: 'full_time', label: 'Tiempo completo' },
    { value: 'part_time', label: 'Medio tiempo' },
    { value: 'contract', label: 'Contrato' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Pasantía' },
  ];

  const getJobTypeStyle = (type: string) => {
    switch (type) {
      case 'full_time':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/80';
      case 'part_time':
        return 'bg-violet-50 dark:bg-violet-950/30 text-blue-700 border border-violet-200 dark:border-violet-800/80';
      case 'contract':
        return 'bg-amber-50 text-amber-700 border border-amber-200/80';
      case 'freelance':
        return 'bg-purple-50 text-purple-700 border border-purple-200/80';
      case 'internship':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200/80';
      default:
        return 'bg-slate-50 dark:bg-gray-900/50 text-slate-700 dark:text-gray-200 border border-slate-200/80';
    }
  };

  const formatSalary = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return 'Salario a convenir';
    if (job.salary_min && job.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()} ${job.currency}`;
    }
    return job.salary_min 
      ? `Desde $${job.salary_min.toLocaleString()} ${job.currency}`
      : `Hasta $${job.salary_max?.toLocaleString()} ${job.currency}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Publicado ayer';
    if (diffDays < 7) return `Publicado hace ${diffDays} días`;
    if (diffDays < 30) return `Publicado hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950/50 pb-16">
      <JsonLd data={buildJobsCollectionSchema(jobsData?.count)} />
      {/* Header con gradiente sofisticado */}
      <div className="bg-gradient-to-r from-violet-600/90 via-indigo-600/90 to-indigo-700 text-white shadow-md">
        <div className="page-container py-10 sm:py-14">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-white/20 text-white rounded-full backdrop-blur-md">
                Bolsa de Empleo
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
                Portal de Empleo
              </h1>
              <p className="mt-2 text-violet-100 text-base sm:text-lg max-w-2xl font-light">
                Descubre tu próximo paso profesional en NissigDigital. Las mejores empresas de la región publican sus vacantes aquí.
              </p>
            </div>
            {isAuthenticated && user?.user_type === 'company' && (
              <div className="mt-6 md:mt-0 flex-shrink-0">
                <Link
                  to={ROUTES.empleosCreate}
                  className="inline-flex items-center px-5 py-3 bg-white text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:bg-violet-950/30 font-bold rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:translate-y-0"
                >
                  <Plus className="w-5 h-5 mr-2 stroke-[2.5]" />
                  Publicar empleo
                </Link>
              </div>
            )}
          </div>

          {/* Buscador Integrado */}
          <div className="mt-10 search-bar text-slate-800 dark:text-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-violet-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por título de empleo, empresa, tecnología o palabras clave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary py-3.5 px-6 text-sm cursor-pointer ${
                  showFilters
                    ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700'
                    : ''
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Panel de Filtros Desplegable */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Categoría Profesional
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-3xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-gray-900 text-sm font-medium text-gray-900 dark:text-gray-100 transition-all"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Jornada Laboral
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3.5 py-3 bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-800 rounded-3xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-gray-900 text-sm font-medium text-gray-900 dark:text-gray-100 transition-all"
                  >
                    <option value="">Todos los tipos</option>
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Listado de Empleos */}
      <div className="page-container mt-10">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse border border-slate-200 dark:border-gray-800 p-6 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-3xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-full mb-1" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : jobsData?.results?.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-slate-200/80 dark:border-gray-800/80 shadow-sm max-w-xl mx-auto px-6 mt-6">
            <div className="w-16 h-16 bg-violet-50 dark:bg-violet-950/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-violet-100 dark:border-violet-900">
              <Briefcase className="w-8 h-8 text-violet-500 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100">No se encontraron empleos</h3>
            <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm max-w-sm mx-auto">
              No encontramos ofertas que coincidan con tu búsqueda en este momento. Intenta ajustando los filtros o el término ingresado.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobsData?.results.map((job) => (
              <Link
                key={job.id}
                to={ROUTES.empleosDetail(String(job.id))}
                className="group card border border-slate-200/85 dark:border-gray-800/85 hover:border-violet-400 dark:hover:border-violet-600 rounded-3xl p-5 sm:p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 block"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Logo de la Empresa */}
                  <div className="w-14 h-14 bg-slate-50 dark:bg-gray-900/50 border border-slate-100 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                    {job.logo ? (
                      <img 
                        src={job.logo} 
                        alt={job.company_name} 
                        className="w-full h-full object-cover rounded-3xl" 
                      />
                    ) : (
                      <Building2 className="w-7 h-7 text-slate-400 group-hover:text-violet-500 dark:text-violet-400 transition-colors" />
                    )}
                  </div>

                  {/* Detalles del Empleo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 dark:text-gray-200 border border-slate-200/60 rounded-3xl">
                        {job.category}
                      </span>
                      {/* Corregido el bug: validar por job.is_featured en vez de job.is_active */}
                      {job.is_featured && (
                        <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 rounded-3xl flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          Destacado
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:hover:text-violet-400 transition-colors tracking-tight mb-2">
                      {job.title}
                    </h3>
                    
                    {/* Fila de Metadatos */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium mb-3.5">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-800 dark:text-gray-100">{job.company_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-violet-400" />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getJobTypeStyle(job.job_type)}`}>
                          {jobTypes.find(t => t.value === job.job_type)?.label || job.job_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-800 dark:text-gray-100 font-semibold">{formatSalary(job)}</span>
                      </div>
                    </div>
                    
                    <p className="text-slate-500 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
                      {job.description}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-slate-100/80 pt-3.5">
                      <div className="flex items-center text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {formatDate(job.posted_at)}
                      </div>
                      <span className="text-violet-600 dark:text-violet-400 group-hover:text-violet-700 dark:hover:text-violet-300 font-bold text-xs sm:text-sm inline-flex items-center gap-0.5 transition-colors">
                        Ver detalles
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Paginación */}
        {jobsData && jobsData.count > 10 && (
          <div className="mt-10 flex justify-center">
            <nav className="flex items-center space-x-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-3xl border border-slate-200/80 dark:border-gray-800/80 shadow-sm">
              <button
                disabled={!jobsData.links.previous}
                className="px-4 py-2 border border-slate-200 dark:border-gray-800 rounded-3xl text-xs font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>
              <button
                disabled={!jobsData.links.next}
                className="px-4 py-2 border border-slate-200 dark:border-gray-800 rounded-3xl text-xs font-bold text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:bg-gray-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;