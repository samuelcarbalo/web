import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  Users, 
  ChevronLeft,
  Upload,
  X
} from 'lucide-react';
import { useCreateTournament } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import type { SportType, sportTypeLabels } from '../../types/sports';

const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createMutation = useCreateTournament();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sport_type: 'football' as SportType,
    start_date: '',
    end_date: '',
    registration_deadline: '',
    max_teams: 16,
    min_players_per_team: 7,
    max_players_per_team: 25,
    logo: '',
    banner: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const sports: { value: SportType; label: string }[] = [
    { value: 'football', label: 'Fútbol' },
    { value: 'softball', label: 'Softbol' },
    { value: 'basketball', label: 'Baloncesto' },
    { value: 'volleyball', label: 'Voleibol' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.start_date) newErrors.start_date = 'La fecha de inicio es requerida';
    if (!formData.end_date) newErrors.end_date = 'La fecha de finalización es requerida';
    if (!formData.registration_deadline) newErrors.registration_deadline = 'La fecha límite de inscripción es requerida';
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'La fecha de finalización debe ser posterior a la de inicio';
      }
    }
    
    if (formData.registration_deadline && formData.start_date) {
      if (new Date(formData.registration_deadline) >= new Date(formData.start_date)) {
        newErrors.registration_deadline = 'La inscripción debe cerrar antes del inicio del torneo';
      }
    }
    
    if (formData.max_teams < 2) newErrors.max_teams = 'Mínimo 2 equipos';
    if (formData.min_players_per_team < 1) newErrors.min_players_per_team = 'Mínimo 1 jugador';
    if (formData.max_players_per_team < formData.min_players_per_team) {
      newErrors.max_players_per_team = 'El máximo debe ser mayor o igual al mínimo';
    }
    
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
      slug: slug,
      organization: user?.organization || '',
    }, {
      onSuccess: () => {
        navigate('/sports');
      },
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-green-600" />
            Crear nuevo torneo
          </h1>
          <p className="mt-2 text-gray-600">
            Organiza un torneo deportivo en Montelibano
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información básica */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Información básica</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del torneo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Ej: Copa Primavera 2024"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deporte *
                </label>
                <select
                  value={formData.sport_type}
                  onChange={(e) => handleChange('sport_type', e.target.value)}
                  className="input-field"
                >
                  {sports.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={`input-field ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Describe el torneo, reglas, premios..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Fechas importantes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Inicio del torneo *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  className={`input-field ${errors.start_date ? 'border-red-500' : ''}`}
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Finalización *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  className={`input-field ${errors.end_date ? 'border-red-500' : ''}`}
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Límite de inscripción *
                </label>
                <input
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) => handleChange('registration_deadline', e.target.value)}
                  className={`input-field ${errors.registration_deadline ? 'border-red-500' : ''}`}
                />
                {errors.registration_deadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.registration_deadline}</p>
                )}
              </div>
            </div>
          </div>

          {/* Configuración de equipos */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Configuración de equipos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Máximo de equipos *
                </label>
                <input
                  type="number"
                  min={2}
                  max={64}
                  value={formData.max_teams}
                  onChange={(e) => handleChange('max_teams', parseInt(e.target.value))}
                  className={`input-field ${errors.max_teams ? 'border-red-500' : ''}`}
                />
                {errors.max_teams && <p className="mt-1 text-sm text-red-600">{errors.max_teams}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jugadores mínimos *
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.min_players_per_team}
                  onChange={(e) => handleChange('min_players_per_team', parseInt(e.target.value))}
                  className={`input-field ${errors.min_players_per_team ? 'border-red-500' : ''}`}
                />
                {errors.min_players_per_team && (
                  <p className="mt-1 text-sm text-red-600">{errors.min_players_per_team}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jugadores máximos *
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.max_players_per_team}
                  onChange={(e) => handleChange('max_players_per_team', parseInt(e.target.value))}
                  className={`input-field ${errors.max_players_per_team ? 'border-red-500' : ''}`}
                />
                {errors.max_players_per_team && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_players_per_team}</p>
                )}
              </div>
            </div>
          </div>

          {/* Imágenes (opcional) */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Imágenes (opcional)</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del banner
                </label>
                <input
                  type="url"
                  value={formData.banner}
                  onChange={(e) => handleChange('banner', e.target.value)}
                  className="input-field"
                  placeholder="https://ejemplo.com/banner.png"
                />
              </div>
            </div>
          </div>

          {/* Error general */}
          {createMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                Error al crear el torneo. Verifica que tienes permisos de administrador.
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
              disabled={createMutation.isPending}
              className="flex-1 btn-primary py-3 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creando...
                </span>
              ) : (
                'Crear torneo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTournament;