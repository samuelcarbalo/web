import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Users,
  Trophy,
  Calendar,
  Target,
  Shield,
  Crown,
  Shirt,
  TrendingUp,
  Activity,
  MapPin,
  Mail,
  Phone,
  UserCircle,
} from 'lucide-react';
import { useTournament, useTeam, usePlayers } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import { sportTypeLabels } from '../../types/sports';

const TeamDetailPage: React.FC = () => {
  const { tournamentSlug, teamSlug } = useParams<{ tournamentSlug: string; teamSlug: string }>();
  const { user } = useAuthStore();

  const { data: tournament, isLoading: loadingTournament } = useTournament(tournamentSlug || '');
  const { data: team, isLoading: loadingTeam } = useTeam(teamSlug || '');
  const { data: playersData, isLoading: loadingPlayers } = usePlayers(team?.id);

  const isLoading = loadingTournament || loadingTeam || loadingPlayers;
  const players = playersData?.results || [];

  // Verificar si el usuario es el coach o dueño del equipo
  const isTeamCoach = user?.email === team?.coach_email;
  const isOwner = user?.role === 'manager' && user?.id === tournament?.posted_by;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Equipo no encontrado</h2>
          <Link to={`/sports/tournaments/${tournamentSlug}`} className="text-green-600 mt-4 inline-block">
            ← Volver al torneo
          </Link>
        </div>
      </div>
    );
  }

  // Calcular estadísticas del equipo
  const totalGoals = players.reduce((sum, p) => sum + (p.goals || 0), 0);
  const totalMatches = team.played || 0;
  const winRate = totalMatches > 0 ? ((team.won || 0) / totalMatches * 100).toFixed(1) : '0';
  const topScorer = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0))[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con banner del equipo */}
      <div className="relative h-48 bg-gray-900 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{ backgroundColor: team.primary_color || '#3B82F6' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to={`/sports/tournaments/${tournamentSlug}`}
            className="inline-flex items-center text-white/80 hover:text-white mb-3 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver al torneo
          </Link>
          <div className="flex items-center gap-4">
            {team.logo ? (
              <img 
                src={team.logo} 
                alt={team.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white/20"
                style={{ backgroundColor: team.primary_color || '#3B82F6' }}
              >
                {team.abbreviation}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">{team.name}</h1>
              <p className="text-white/80 text-sm">{team.abbreviation} • {sportTypeLabels[tournament?.sport_type]}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna izquierda - Info del equipo */}
          <div className="space-y-6">
            
            {/* Estadísticas del equipo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Estadísticas
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{totalMatches}</p>
                  <p className="text-xs text-gray-500 uppercase">Partidos</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{team.won || 0}</p>
                  <p className="text-xs text-gray-500 uppercase">Ganados</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{team.drawn || 0}</p>
                  <p className="text-xs text-gray-500 uppercase">Empatados</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{team.lost || 0}</p>
                  <p className="text-xs text-gray-500 uppercase">Perdidos</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Puntos</span>
                  <span className="text-xl font-bold text-gray-900">{team.points || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Goles a favor</span>
                  <span className="font-medium text-gray-900">{team.goals_for || 0}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Goles en contra</span>
                  <span className="font-medium text-gray-900">{team.goals_against || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Diferencia</span>
                  <span className={`font-medium ${(team.goal_difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {team.goal_difference > 0 ? '+' : ''}{team.goal_difference || 0}
                  </span>
                </div>
                {totalMatches > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">% Victoria</span>
                      <span className="font-bold text-blue-600">{winRate}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info del entrenador */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <UserCircle className="w-5 h-5 mr-2 text-blue-500" />
                Cuerpo técnico
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{team.coach_name || 'Sin entrenador'}</p>
                    <p className="text-xs text-gray-500">Entrenador</p>
                  </div>
                </div>
                {team.coach_email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {team.coach_email}
                  </div>
                )}
                {team.coach_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {team.coach_phone}
                  </div>
                )}
              </div>
            </div>

            {/* Colores del equipo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Colores</h2>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div 
                    className="h-12 rounded-lg border border-gray-200"
                    style={{ backgroundColor: team.primary_color || '#3B82F6' }}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Primario</p>
                </div>
                <div className="flex-1">
                  <div 
                    className="h-12 rounded-lg border border-gray-200"
                    style={{ backgroundColor: team.secondary_color || '#FFFFFF' }}
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Secundario</p>
                </div>
              </div>
            </div>

            {/* Botón para editar plantilla (solo coach/owner) */}
            {(isTeamCoach || isOwner) && (
              <Link
                to={`/sports/tournaments/${tournamentSlug}/teams/${teamSlug}/roster`}
                className="block w-full bg-green-600 text-white text-center py-3 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                <Users className="w-5 h-5 inline mr-2" />
                Gestionar plantilla
              </Link>
            )}
          </div>

          {/* Columna derecha - Jugadores */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Resumen de jugadores */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Plantilla
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {players.length}
                  </span>
                </h2>
                {topScorer && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span>Goleador: <strong>{topScorer.first_name} {topScorer.last_name}</strong> ({topScorer.goals} gol{topScorer.goals !== 1 ? 'es' : ''})</span>
                  </div>
                )}
              </div>

              {loadingPlayers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
              ) : players.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Shirt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No hay jugadores registrados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {players.map((player) => (
                    <Link
                      key={player.id}
                      to={`/sports/players/${player.id}`}
                      className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      {player.photo ? (
                        <img 
                          src={player.photo} 
                          alt={player.full_name}
                          className="w-14 h-14 rounded-full object-cover mr-4"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg mr-4 group-hover:bg-gray-300 transition-colors">
                          {player.first_name?.[0]}{player.last_name?.[0]}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">
                            {player.first_name} {player.last_name}
                          </p>
                          {player.is_captain && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                        </div>
                        {player.nickname && (
                          <p className="text-xs text-gray-500">"{player.nickname}"</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Shirt className="w-3 h-3" />
                            #{player.jersey_number}
                          </span>
                          <span>{player.position_display || player.position}</span>
                        </div>
                      </div>

                      <div className="text-right ml-2">
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p className="flex items-center justify-end gap-1">
                            <Activity className="w-3 h-3" />
                            {player.matches_played} PJ
                          </p>
                          <p className="flex items-center justify-end gap-1">
                            <Target className="w-3 h-3" />
                            {player.goals} G
                          </p>
                          <p className="flex items-center justify-end gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {player.assists} A
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Estadísticas de jugadores */}
            {players.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  Líderes del equipo
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Goleadores */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Target className="w-4 h-4 text-orange-500" />
                      Goleadores
                    </h3>
                    {[...players]
                      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
                      .slice(0, 3)
                      .map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{i + 1}. {p.first_name} {p.last_name}</span>
                          <span className="font-bold text-orange-600">{p.goals}</span>
                        </div>
                      ))}
                  </div>

                  {/* Asistencias */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Asistencias
                    </h3>
                    {[...players]
                      .sort((a, b) => (b.assists || 0) - (a.assists || 0))
                      .slice(0, 3)
                      .map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{i + 1}. {p.first_name} {p.last_name}</span>
                          <span className="font-bold text-blue-600">{p.assists}</span>
                        </div>
                      ))}
                  </div>

                  {/* Partidos jugados */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Activity className="w-4 h-4 text-green-500" />
                      Más partidos
                    </h3>
                    {[...players]
                      .sort((a, b) => (b.matches_played || 0) - (a.matches_played || 0))
                      .slice(0, 3)
                      .map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{i + 1}. {p.first_name} {p.last_name}</span>
                          <span className="font-bold text-green-600">{p.matches_played}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;