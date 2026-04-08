import React, { useState } from 'react';
import { X, Users, Palette, UserCircle } from 'lucide-react';
import { useCreateTeam } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  tournamentName: string;
}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ 
  isOpen, 
  onClose, 
  tournamentId,
  tournamentName 
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-green-600 px-4 py-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-white mr-3" />
              <h3 className="text-lg font-medium text-white">Inscribir Equipo</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            <p className="text-sm text-gray-600 mb-4">
              Torneo: <span className="font-medium text-gray-900">{tournamentName}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre del equipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del equipo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Ej: Los Halcones"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Abreviatura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abreviatura * (máx. 5 caracteres)
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={formData.abbreviation}
                  onChange={(e) => handleChange('abbreviation', e.target.value.toUpperCase())}
                  className={`input-field ${errors.abbreviation ? 'border-red-500' : ''}`}
                  placeholder="Ej: HAL"
                />
                {errors.abbreviation && <p className="mt-1 text-sm text-red-600">{errors.abbreviation}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="input-field"
                  placeholder="Historia del equipo, logros, etc."
                />
              </div>

              {/* Colores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Palette className="w-4 h-4 mr-1" />
                    Color primario *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="h-10 w-16 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => handleChange('primary_color', e.target.value)}
                      className="input-field flex-1"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Palette className="w-4 h-4 mr-1" />
                    Color secundario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleChange('secondary_color', e.target.value)}
                      className="h-10 w-16 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => handleChange('secondary_color', e.target.value)}
                      className="input-field flex-1"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del logo
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => handleChange('logo', e.target.value)}
                  className="input-field"
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>

              {/* Datos del entrenador */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <UserCircle className="w-4 h-4 mr-1" />
                  Información del entrenador
                </h4>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.coach_name}
                    onChange={(e) => handleChange('coach_name', e.target.value)}
                    className="input-field"
                    placeholder="Nombre del entrenador"
                  />
                  <input
                    type="email"
                    value={formData.coach_email}
                    onChange={(e) => handleChange('coach_email', e.target.value)}
                    className="input-field"
                    placeholder="Email del entrenador"
                  />
                  <input
                    type="tel"
                    value={formData.coach_phone}
                    onChange={(e) => handleChange('coach_phone', e.target.value)}
                    className="input-field"
                    placeholder="Teléfono del entrenador"
                  />
                </div>
              </div>

              {/* Error general */}
              {createMutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">
                    Error al crear el equipo. Verifica los datos.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
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
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamModal;