import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  ChevronLeft,
  Share2,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

import { 
  useTournament, 
  useDeleteTournament,
  useTeams,
  useDeleteTeam
} from '../../hooks/useSports';

import { useAuthStore } from '../../store/authStore';
import { sportTypeLabels, sportTypeColors } from '../../types/sports';
import CreateTeamModal from './CreateTeamModal';

const TournamentDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();

  const { data: tournament, isLoading } = useTournament(slug || '');
  const deleteMutation = useDeleteTournament();

  const { data: teams } = useTeams(slug || '');
  const deleteTeamMutation = useDeleteTeam();

  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

  const isManager = user?.role === 'manager';
  const isOwner = isManager && user?.id === tournament?.posted_by;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isRegistrationStillOpen = () => {
    if (!tournament?.registration_deadline) return false;
    return new Date(tournament.registration_deadline) > new Date();
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de eliminar este torneo?')) {
      deleteMutation.mutate(slug || '');
    }
  };

  const handleDeleteTeam = (teamSlug: string) => {
    if (confirm('¿Eliminar este equipo?')) {
      deleteTeamMutation.mutate(teamSlug);
    }
  };

  const myTeam = teams?.results?.find((team: any) => team.coach_email === user?.email);

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
          <Link to="/sports" className="text-green-600 mt-4 inline-block">
            ← Ver todos los torneos
          </Link>
        </div>
      </div>
    );
  }

  const registrationOpen = isRegistrationStillOpen();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        <div className="h-64 bg-gray-900 relative overflow-hidden">
          {tournament.banner ? (
            <img 
              src={tournament.banner} 
              alt={tournament.name}
              className="w-full h-full object-cover opacity-60"
              crossOrigin="anonymous"
              onError={(e) => {
                // Fallback si la imagen falla
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-full h-full ${sportTypeColors[tournament.sport_type]}`} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link 
              to="/sports" 
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Volver a torneos
            </Link>
            <h1 className="text-4xl font-bold text-white">{tournament.name}</h1>
            <p className="text-white/80 mt-2 text-lg">
              {sportTypeLabels[tournament.sport_type]}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Sobre */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre el torneo</h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {tournament.description}
                </p>
              </div>

              {/* Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Información general</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Inicio</p>
                      <p className="font-medium">{formatDate(tournament.start_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Finalización</p>
                      <p className="font-medium">{formatDate(tournament.end_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Equipos</p>
                      <p className="font-medium">
                        {tournament.teams_count} / {tournament.max_teams}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Jugadores por equipo</p>
                      <p className="font-medium">
                        {tournament.min_players_per_team} - {tournament.max_players_per_team}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Equipos inscritos */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-600" />
                    Equipos inscritos ({teams?.count || 0})
                  </h3>

                  {isOwner && registrationOpen && (
                    <button 
                      onClick={() => setIsCreateTeamModalOpen(true)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      + Agregar
                    </button>
                  )}
                </div>
                
                {teams?.results && teams.results.length > 0 ? (
                  <div className="space-y-3">
                    {teams.results.map((team: any) => (
                      <Link
                        key={team.id}
                        to={`/sports/tournaments/${tournament.slug}/teams/${team.slug}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group block"
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          {team.logo ? (
                            <img 
                              src={team.logo} 
                              alt="" 
                              className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
                              crossOrigin="anonymous"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ backgroundColor: team.primary_color || '#3B82F6' }}
                            >
                              {team.abbreviation || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{team.name}</p>
                            <p className="text-xs text-gray-600">
                              {team.coach_name || 'Sin entrenador'}
                            </p>
                          </div>
                        </div>

                        {/* Botón de eliminar - evita navegación */}
                        {isOwner && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteTeam(team.slug);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2 relative z-10"
                            title="Eliminar equipo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No hay equipos inscritos aún
                  </p>
                )}
              </div>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Registro */}
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 bg-green-50/50">
                <h3 className="font-bold text-gray-900 mb-4">Inscripción</h3>
                
                {registrationOpen ? (
                  <>
                    <div className="flex items-center text-green-700 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      Inscripciones abiertas
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Cierra el {formatDate(tournament.registration_deadline)}
                    </p>

                    {isOwner ? (
                      <button 
                        onClick={() => setIsCreateTeamModalOpen(true)}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Inscribir equipo
                      </button>
                    ) : (
                      // Verificar si el usuario es coach de algún equipo inscrito
                      myTeam ? (
                        <Link
                          to={`/sports/tournaments/${tournament.slug}/teams/${myTeam.id}/roster`}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Inscribir plantilla
                        </Link>
                      ) : myTeam === null ? (
                        <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 opacity-50 cursor-not-allowed">
                          <Users className="w-4 h-4 mr-2" />
                          Inscribir plantilla
                        </button>
                      ) : null
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Inscripciones cerradas</p>
                  </div>
                )}
              </div>

              {/* Gestión */}
              {isOwner && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Gestión</h3>
                  <div className="space-y-2">
                    <Link 
                      to={`/sports/tournaments/${tournament.slug}/edit`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar torneo
                    </Link>

                    <button 
                      onClick={handleDelete}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}

              {/* Share */}
              <button className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                <Share2 className="w-5 h-5 mr-2" />
                Compartir torneo
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Modal - Renderizado fuera del flujo normal del DOM */}
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        tournamentId={tournament?.id || ''}
        tournamentName={tournament?.name || ''}
      />
    </>
  );
};

export default TournamentDetail;