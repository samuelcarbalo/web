import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
//   Calendar, 
//   Users, 
  ChevronLeft,
  Trash2
} from 'lucide-react';
import { useTournament, useUpdateTournament, useDeleteTournament } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import type { SportType } from '../../types/sports'; //sportTypeLabels

const EditTournament: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: tournament, isLoading } = useTournament(slug || '');
  const updateMutation = useUpdateTournament();
  const deleteMutation = useDeleteTournament();
  
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
    status: 'upcoming',
  });

  const sports: { value: SportType; label: string }[] = [
    { value: 'football', label: 'Fútbol' },
    { value: 'softball', label: 'Softbol' },
    { value: 'basketball', label: 'Baloncesto' },
    { value: 'volleyball', label: 'Voleibol' },
  ];

  const statuses = [
    { value: 'upcoming', label: 'Próximo' },
    { value: 'ongoing', label: 'En curso' },
    { value: 'completed', label: 'Finalizado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  useEffect(() => {
    if (tournament) {
      // Verificar ownership
      if (user?.organization !== tournament.organization && user?.role !== 'admin') {
        navigate('/sports');
        return;
      }

      setFormData({
        name: tournament.name,
        description: tournament.description,
        sport_type: tournament.sport_type,
        start_date: tournament.start_date,
        end_date: tournament.end_date,
        registration_deadline: tournament.registration_deadline,
        max_teams: tournament.max_teams,
        min_players_per_team: tournament.min_players_per_team,
        max_players_per_team: tournament.max_players_per_team,
        logo: tournament.logo || '',
        banner: tournament.banner || '',
        status: tournament.status,
      });
    }
  }, [tournament, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slug) return;
    
    updateMutation.mutate({
      slug,
      data: formData,
    }, {
      onSuccess: () => {
        navigate(`/sports/tournaments/${slug}`);
      },
    });
  };

  const handleDelete = () => {
    if (!confirm('¿Estás seguro de eliminar este torneo? Esta acción no se puede deshacer.')) {
      return;
    }
    
    if (!slug) return;
    
    deleteMutation.mutate(slug, {
      onSuccess: () => {
        navigate('/sports');
      },
    });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Torneo no encontrado</h2>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-green-600" />
            Editar torneo
          </h1>
          <p className="mt-2 text-gray-600">
            {tournament.name}
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
                  Nombre del torneo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deporte
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
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="input-field"
                >
                  {statuses.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Fechas */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Fechas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inicio del torneo
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finalización
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite de inscripción
                </label>
                <input
                  type="date"
                  value={formData.registration_deadline}
                  onChange={(e) => handleChange('registration_deadline', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Configuración */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Configuración de equipos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de equipos
                </label>
                <input
                  type="number"
                  value={formData.max_teams}
                  onChange={(e) => handleChange('max_teams', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jugadores mínimos
                </label>
                <input
                  type="number"
                  value={formData.min_players_per_team}
                  onChange={(e) => handleChange('min_players_per_team', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jugadores máximos
                </label>
                <input
                  type="number"
                  value={formData.max_players_per_team}
                  onChange={(e) => handleChange('max_players_per_team', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Imágenes */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Imágenes</h2>
            
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
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {updateMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                Error al actualizar el torneo.
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
              disabled={updateMutation.isPending}
              className="flex-1 btn-primary py-3 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

          {/* Danger zone */}
          <div className="card border-red-200 bg-red-50">
            <h3 className="text-lg font-bold text-red-900 mb-2">Zona de peligro</h3>
            <p className="text-sm text-red-700 mb-4">
              Eliminar este torneo eliminará todos los datos asociados. Esta acción no se puede deshacer.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar torneo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTournament;