import React, { useState } from 'react';
import { X, Users, Palette, UserCircle } from 'lucide-react';
import { useCreateTeam } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import ImageUploader from '../../components/UI/ImageUploader';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentName: string;
  onSuccess?: () => void;  // ← agrega esto
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ 
  isOpen, 
  onClose, 
  tournamentId,
  tournamentName,
  onSuccess, 
}) => {
  const { user } = useAuthStore();
  const createMutation = useCreateTeam();
  
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    description: '',
    primary_color: '#3B82F6',
    secondary_color: '#FFFFFF',
    logo: '',
    coach_name: '',
    coach_email: '',
    coach_phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cerrar con Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre del equipo es requerido';
    if (!formData.abbreviation.trim()) newErrors.abbreviation = 'La abreviatura es requerida';
    if (formData.abbreviation.length > 5) newErrors.abbreviation = 'Máximo 5 caracteres';
    if (!formData.primary_color) newErrors.primary_color = 'El color primario es requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    createMutation.mutate({
      ...formData,
      slug,
      tournament: tournamentId,
      organization: user?.organization || '',
    }, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: '',
          abbreviation: '',
          description: '',
          primary_color: '#3B82F6',
          secondary_color: '#FFFFFF',
          logo: '',
          coach_name: '',
          coach_email: '',
          coach_phone: '',
        });
      },
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor centrado */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          
          {/* Modal content */}
          <div 
            className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            onClick={handleModalClick}
          >
            {/* Header */}
            <div className="bg-green-600 px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-white mr-3" />
                <h3 className="text-lg font-medium text-white">Inscribir Equipo</h3>
              </div>
              <button 
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 py-5 sm:p-6 max-h-[70vh] overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Torneo: <span className="font-medium text-gray-900 dark:text-white">{tournamentName}</span>
              </p>

              <form id="create-team-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre del equipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Nombre del equipo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full rounded-3xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Ej: Los Halcones"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Abreviatura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Abreviatura * (máx. 5 caracteres)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={formData.abbreviation}
                    onChange={(e) => handleChange('abbreviation', e.target.value.toUpperCase())}
                    className={`w-full rounded-3xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 ${errors.abbreviation ? 'border-red-500' : ''}`}
                    placeholder="Ej: HAL"
                  />
                  {errors.abbreviation && <p className="mt-1 text-sm text-red-600">{errors.abbreviation}</p>}
                </div>

                {/* Descripción */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full rounded-3xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Historia del equipo, logros, etc."
                  />
                </div> */}

                <ImageUploader
                  id="team-logo"
                  label="Logo del equipo"
                  value={formData.logo}
                  onChange={(url) => handleChange('logo', url)}
                  error={errors.logo}
                  preview="square"
                  hint="Máximo 2 MB. PNG, JPG, GIF o WEBP."
                />

                {/* Datos del entrenador */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <UserCircle className="w-4 h-4 mr-1" />
                    Información del entrenador
                  </h4>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.coach_name}
                      onChange={(e) => handleChange('coach_name', e.target.value)}
                      className="w-full rounded-3xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Nombre del entrenador"
                    />
                    <input
                      type="email"
                      value={formData.coach_email}
                      onChange={(e) => handleChange('coach_email', e.target.value)}
                      className="w-full rounded-3xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Email del entrenador"
                    />
                    <input
                      type="tel"
                      value={formData.coach_phone}
                      onChange={(e) => handleChange('coach_phone', e.target.value)}
                      className="w-full rounded-3xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Teléfono del entrenador"
                    />
                  </div>
                </div>
                
                {/* Colores */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 flex items-center">
                      <Palette className="w-4 h-4 mr-1" />
                      Color primario *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="h-10 w-16 rounded cursor-pointer border border-gray-300 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        value={formData.primary_color}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                        className="flex-1 rounded-3xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 flex items-center">
                      <Palette className="w-4 h-4 mr-1" />
                      Color secundario
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="h-10 w-16 rounded cursor-pointer border border-gray-300 dark:border-gray-700"
                      />
                      <input
                        type="text"
                        value={formData.secondary_color}
                        onChange={(e) => handleChange('secondary_color', e.target.value)}
                        className="flex-1 rounded-3xl border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>

                {/* Error general */}
                {createMutation.isError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-3xl">
                    <p className="text-sm text-red-600">
                      Error al crear el equipo. Verifica los datos.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-gray-800">
              <button
                type="submit"
                form="create-team-form"
                disabled={createMutation.isPending}
                className="w-full inline-flex justify-center rounded-3xl border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  'Inscribir equipo'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-3xl border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamModal;