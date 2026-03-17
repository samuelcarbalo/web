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
  DollarSign
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/authStore';
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
    {} // ← El segundo argumento (opciones) que faltaba
  );
  const jobsData = data as JobsResponse;
  console.log(JSON.stringify(jobsData))
  
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Empleos</h1>
              <p className="mt-2 text-gray-600">
                Encuentra tu próxima oportunidad laboral en Montelibano
              </p>
            </div>
            {isAuthenticated && user?.user_type === 'company' && (
              <div className="mt-4 md:mt-0">
                <Link
                  to="/jobs/create"
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar empleo
                </Link>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por título, empresa o palabra clave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 py-3"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center justify-center py-3 px-6"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de empleo
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input-field"
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

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : jobsData?.results?.length === 0? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No se encontraron empleos</h3>
            <p className="text-gray-600 mt-2">Intenta ajustar tus filtros de búsqueda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobsData?.results.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="card hover:shadow-md transition-shadow block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                        {job.category}
                      </span>
                      {job.is_active && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full flex items-center">
                          Destacado
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {job.company_name}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {jobTypes.find(t => t.value === job.job_type)?.label || job.job_type}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatSalary(job)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 line-clamp-2 mb-4">
                      {job.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(job.posted_at)}
                      </div>
                      <span className="text-primary-600 font-medium text-sm">
                        Ver detalles →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {jobsData && jobsData.count > 10 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                // {/* Accedemos a links.previous */}
                disabled={!jobsData.links.previous}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                // Accedemos a links.next
                disabled={!jobsData.links.next}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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