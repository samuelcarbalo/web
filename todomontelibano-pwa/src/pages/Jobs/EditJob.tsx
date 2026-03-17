import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText, 
  List,
  Plus,
  X
} from 'lucide-react';
import { useJob, useUpdateJob } from '../../hooks/useJobs';
import { useAuthStore } from '../../store/authStore';
import type { Job } from '../../types';

// Tipo para el formulario
type JobFormData = {
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_min: string;
  salary_max: string;
  currency: string;
  job_type: Job['job_type']; // Usamos el tipo literal del Job
  category: string;
  expires_at: string;
  status: Job['status']; // Usamos el tipo literal del Job
};

const EditJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const jobId = id || '';
  const { user } = useAuthStore();
  
  const { data: job, isLoading } = useJob(jobId);
  const updateJob = useUpdateJob();

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary_min: '',
    salary_max: '',
    currency: 'COP',
    job_type: 'full_time',
    category: '',
    expires_at: '',
    status: 'published',
  });

  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');

  // Cargar datos del job cuando esté disponible
  useEffect(() => {
    if (job) {
      // Verificar si el usuario es el dueño (comparando IDs)
      const isOwner = user?.id === job.posted_by.id || user?.role === 'manager';
      
      if (!isOwner) {
        navigate(`/jobs/${jobId}`);
        return;
      }

      setFormData({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        salary_min: job.salary_min?.toString() || '',
        salary_max: job.salary_max?.toString() || '',
        currency: job.currency,
        job_type: job.job_type, // Ahora es compatible
        category: job.category,
        expires_at: job.expires_at ? job.expires_at.split('T')[0] : '',
        status: job.status, // Ahora es compatible
      });
      
      // Si hay beneficios en el job, cargarlos
      if ((job as any).benefits) {
        setBenefits((job as any).benefits);
      }
    }
  }, [job, user, jobId, navigate]);

  const categories = [
    'Tecnología', 'Ventas', 'Administrativo', 'Operaciones', 
    'Marketing', 'Recursos Humanos', 'Contabilidad', 'Servicios',
    'Salud', 'Educación', 'Construcción', 'Otros'
  ];

  const jobTypes: { value: Job['job_type']; label: string }[] = [
    { value: 'full_time', label: 'Tiempo completo' },
    { value: 'part_time', label: 'Medio tiempo' },
    { value: 'contract', label: 'Contrato' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Pasantía' },
  ];

  const currencies = [
    { value: 'COP', label: 'COP - Peso colombiano' },
    { value: 'USD', label: 'USD - Dólar americano' },
  ];

  const statuses: { value: Job['status']; label: string }[] = [
    { value: 'published', label: 'Publicada (visible)' },
    { value: 'draft', label: 'Borrador (no visible)' },
    { value: 'closed', label: 'Cerrada (no recibe más aplicaciones)' },
    { value: 'archived', label: 'Archivada' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construimos el objeto de actualización compatible con Partial<Job>
    const updateData: Partial<Job> = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      location: formData.location,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
      currency: formData.currency,
      job_type: formData.job_type, // Tipo literal correcto
      category: formData.category,
      expires_at: formData.expires_at || undefined,
      status: formData.status, // Ahora es compatible
    };

    // Solo agregamos benefits si existen (no está en el tipo Job base)
    if (benefits.length > 0) {
      (updateData as any).benefits = benefits;
    }

    updateJob.mutate(
      { id: jobId, data: updateData },
      {
        onSuccess: () => {
          navigate(`/jobs/my_offers`);
        },
      }
    );
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBenefit();
    }
  };

  // Helper para actualizar campos con tipos correctos
  const handleSelectChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Empleo no encontrado</h2>
          <button 
            onClick={() => navigate('/jobs')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Ver todos los empleos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Editar oferta</h1>
          <p className="mt-2 text-gray-600">
            Actualiza los detalles de la vacante 
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Información básica</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título del puesto *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Desarrollador Full Stack Senior"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <div className="relative">
                    <List className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="category"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field pl-10"
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="job_type" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de empleo *
                  </label>
                  <select
                    id="job_type"
                    required
                    value={formData.job_type}
                    onChange={(e) => handleSelectChange('job_type', e.target.value as Job['job_type'])}
                    className="input-field"
                  >
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Ej: Montelibano, Córdoba"
                  />
                </div>
              </div>

              {/* Estado de la oferta */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la oferta
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleSelectChange('status', e.target.value as Job['status'])}
                  className="input-field"
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Descripción del puesto</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción general *
                </label>
                <textarea
                  id="description"
                  required
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  placeholder="Describe las responsabilidades del puesto..."
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos *
                </label>
                <textarea
                  id="requirements"
                  required
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="input-field"
                  placeholder="Lista los requisitos obligatorios y deseables..."
                />
              </div>
            </div>
          </div>

          {/* Salario */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Compensación</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-2">
                    Salario mínimo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="salary_min"
                      min="0"
                      value={formData.salary_min}
                      onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-2">
                    Salario máximo
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="salary_max"
                      min="0"
                      value={formData.salary_max}
                      onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                      className="input-field pl-8"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input-field"
                  >
                    {currencies.map(curr => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Beneficios (opcional)</h2>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="input-field flex-1"
                  placeholder="Ej: Seguro médico, trabajo remoto..."
                />
                <button
                  type="button"
                  onClick={addBenefit}
                  className="btn-primary px-4"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(index)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fecha de expiración */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Vigencia de la oferta</h2>
            </div>

            <div>
              <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de cierre (opcional)
              </label>
              <input
                type="date"
                id="expires_at"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Error Message */}
          {updateJob.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                Error al actualizar la oferta. Por favor intenta de nuevo.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 btn-secondary py-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateJob.isPending}
              className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateJob.isPending ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Guardando...
                </span>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;