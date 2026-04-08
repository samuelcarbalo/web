import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  Users, 
  MapPin, 
  Filter,
  Plus,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useTournaments } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import type { SportType } from '../../types/sports';
import { sportTypeLabels, sportTypeColors } from '../../types/sports';
import { useLocation } from 'react-router-dom';

const TournamentsList: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<SportType | ''>('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { user } = useAuthStore();
  let isManager = user?.role === 'manager';
  if (isManager){
    console.log(user?.id)
  }
  const location = useLocation();
  
  if (location.pathname === '/sports/') {
    isManager = false;
  }
  const { data: tournamentsData, isLoading } = useTournaments({
    sport_type: selectedSport,
    status: selectedStatus ? selectedStatus : 'active',
    enabled: isManager
  });


  const sports: { value: SportType | ''; label: string }[] = [
    { value: '', label: 'Todos los deportes' },
    { value: 'football', label: 'Fútbol' },
    { value: 'softball', label: 'Softbol' },
    { value: 'basketball', label: 'Baloncesto' },
    { value: 'volleyball', label: 'Voleibol' },
  ];

  const statuses = [
    { value: 'active', label: 'En curso' },
    { value: 'draft', label: 'Borradores' },
    { value: 'upcoming', label: 'Próximos' },
    { value: 'cancelled', label: 'Cancelados' },
    { value: 'finished', label: 'Finalizados' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      upcoming: 'Próximo',
      ongoing: 'En curso',
      completed: 'Finalizado',
      cancelled: 'Cancelado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Trophy className="w-8 h-8 mr-3 text-green-600" />
                Torneos Deportivos
              </h1>
              <p className="mt-2 text-gray-600">
                Compite en fútbol, softbol y más deportes en Montelibano
              </p>
            </div>
            {isManager && (
              <div className="mt-4 md:mt-0">
                <Link
                  to="/sports/tournaments/create"
                  className="btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear torneo
                </Link>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value as SportType)}
                className="input-field"
              >
                {sports.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field"
              >
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tournaments List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : tournamentsData?.results.length === 0 ? (
          <div className="card text-center py-16">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No hay torneos activos</h3>
            <p className="text-gray-600 mt-2">
              {selectedSport ? 'Prueba con otro deporte' : 'Los próximos torneos aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournamentsData?.results.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/sports/tournaments/${tournament.slug}`}
                className="card hover:shadow-lg transition-shadow group"
              >
                {/* Banner */}
                <div className="h-32 bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                  {tournament.banner ? (
                    <img 
                      src={tournament.banner} 
                      alt={tournament.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full ${sportTypeColors[tournament.sport_type]} flex items-center justify-center`}>
                      <Trophy className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tournament.status)}`}>
                    {getStatusLabel(tournament.status)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex items-start gap-3 mb-3">
                  {tournament.logo ? (
                    <img src={tournament.logo} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className={`w-12 h-12 rounded-lg ${sportTypeColors[tournament.sport_type]} flex items-center justify-center flex-shrink-0`}>
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      {tournament.name}
                    </h3>
                    <p className="text-sm text-gray-600">{sportTypeLabels[tournament.sport_type]}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {tournament.description}
                </p>

                {/* Meta */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(tournament.start_date)}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {tournament.teams_count} / {tournament.max_teams} equipos
                  </div>
                  {tournament.is_registration_open && (
                    <div className="flex items-center text-green-600 font-medium">
                      <Clock className="w-4 h-4 mr-2" />
                      Inscripciones abiertas hasta {formatDate(tournament.registration_deadline)}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center text-green-600 font-medium">
                  Ver detalles
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsList;