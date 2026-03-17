import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText, 
  List,
  ChevronLeft,
  Plus,
  X
} from 'lucide-react';
import { useCreateJob } from '../../hooks/useJobs';

type JobType = 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const createJob = useCreateJob();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary_min: '',
    salary_max: '',
    currency: 'COP',
    job_type: 'full_time' as JobType,
    category: '',
    expires_at: '',
    skills: [] as string[],
  });
  const [newSkill, setNewSkill] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };
  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };
  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };
  
  const categories = [
    'Tecnología',
    'Ventas',
    'Administrativo',
    'Operaciones',
    'Marketing',
    'Recursos Humanos',
    'Contabilidad',
    'Servicios',
    'Salud',
    'Educación',
    'Construcción',
    'Otros'
  ];

  const jobTypes = [
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData = {
      ...formData,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : undefined,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      skills: formData.skills.length > 0 ? formData.skills : undefined,  // ← AGREGAR
      status: 'published' as const,
    };

    createJob.mutate(jobData, {
      onSuccess: (data) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/jobs/${data.id}/`);
      },
    });
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Publicar nueva oferta</h1>
          <p className="mt-2 text-gray-600">
            Completa los detalles de la vacante para encontrar al candidato ideal
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
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value as JobType })}
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
                  placeholder="Describe las responsabilidades del puesto, el equipo, la cultura de la empresa..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Sé claro y atractivo. Los mejores candidatos valoran la transparencia.
                </p>
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
                  placeholder="Lista los requisitos obligatorios y deseables: experiencia, estudios, habilidades técnicas..."
                />
              </div>
            </div>
          </div>          
          {/* Skills */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Habilidades requeridas</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  className="input-field flex-1"
                  placeholder="Ej: Python, React, Django..."
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-primary px-4"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
              <p className="text-xs text-gray-500">
                * Dejar en 0 si prefieres negociar el salario directamente con los candidatos
              </p>
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
                  placeholder="Ej: Seguro médico, trabajo remoto, bonificaciones..."
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
              <p className="mt-1 text-xs text-gray-500">
                Si no especificas fecha, la oferta permanecerá activa por 30 días
              </p>
            </div>
          </div>

          {/* Preview Card */}
          <div className="card bg-gray-50 border-2 border-dashed border-gray-300">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Vista previa</h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                {formData.category && (
                  <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                    {formData.category}
                  </span>
                )}
                {formData.job_type && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {jobTypes.find(t => t.value === formData.job_type)?.label}
                  </span>
                )}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                {formData.title || 'Título del puesto'}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {formData.location || 'Ubicación no especificada'}
              </p>
              <p className="text-sm text-gray-500 line-clamp-2">
                {formData.description || 'La descripción aparecerá aquí...'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {createJob.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                Error al publicar la oferta. Verifica que tienes un plan activo y todos los campos requeridos.
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
              disabled={createJob.isPending}
              className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createJob.isPending ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Publicando...
                </span>
              ) : (
                'Publicar oferta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;