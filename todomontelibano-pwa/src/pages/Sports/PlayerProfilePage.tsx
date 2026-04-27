import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  User,
  Shirt,
  Crown,
  Target,
  Activity,
  Shield,
  AlertTriangle,
  Calendar,
  MapPin,
  Trophy,
  TrendingUp,
  Award,
  Zap,
  Crosshair,
  BarChart3,
} from 'lucide-react';
import { usePlayer, useTournament } from '../../hooks/useSports';
import { useAuthStore } from '../../store/authStore';
import { sportTypeLabels, sportTypeColors } from '../../types/sports';

const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const { user } = useAuthStore();

  const { data: player, isLoading: loadingPlayer } = usePlayer(playerId || '');
  
  // Consultar el torneo para saber el tipo de deporte
  const { data: tournament, isLoading: loadingTournament } = useTournament(player?.tournament_slug || '');

  const isSoftball = tournament?.sport_type === 'softball';
  const isFootball = tournament?.sport_type === 'football'

  const isLoading = loadingPlayer || loadingTournament;

  // Verificar si el usuario puede editar (coach del equipo o owner del torneo)
  const canEdit = user?.email === player?.team_name || user?.id === tournament?.posted_by;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }
  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Jugador no encontrado</h2>
          <Link to="/sports" className="text-green-600 mt-4 inline-block">
            ← Ver todos los torneos
          </Link>
        </div>
      </div>
    );
  }


  // Estadísticas según el deporte
  const renderStats = () => {
    if (!tournament) return null;
  
    if (isSoftball) {
      return (
        <>
          {/* Estadísticas de Softbol */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Target className="w-5 h-5 text-orange-500" />}
              label="Strikes"
              value={player.strikes || 0}
              sublabel="A favor"
            />
            <StatCard
              icon={<Crosshair className="w-5 h-5 text-red-500" />}
              label="Strikes en contra"
              value={player.strikes_against || 0}
              sublabel="En contra"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
              label="Avg. Strikes"
              value={player.average_strikes?.toFixed(3) || '0.000'}
              sublabel="Promedio"
            />
            <StatCard
              icon={<Zap className="w-5 h-5 text-yellow-500" />}
              label="Walks"
              value={player.walks || 0}
              sublabel="A favor"
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-orange-400" />}
              label="Walks en contra"
              value={player.walks_against || 0}
              sublabel="En contra"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
              label="Avg. Walks"
              value={player.average_walks?.toFixed(3) || '0.000'}
              sublabel="Promedio"
            />
            <StatCard
              icon={<Award className="w-5 h-5 text-purple-500" />}
              label="Home Runs"
              value={player.home_runs || 0}
              sublabel="A favor"
            />
            <StatCard
              icon={<Shield className="w-5 h-5 text-red-400" />}
              label="HR en contra"
              value={player.home_runs_against || 0}
              sublabel="En contra"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
              label="Avg. Home Runs"
              value={player.average_home_runs?.toFixed(3) || '0.000'}
              sublabel="Promedio"
            />
            <StatCard
              icon={<Zap className="w-5 h-5 text-green-500" />}
              label="Strikes Out"
              value={player.strikes_out || 0}
              sublabel="Ponches"
            />
            <StatCard
              icon={<Crosshair className="w-5 h-5 text-red-500" />}
              label="SO en contra"
              value={player.strikes_out_against || 0}
              sublabel="En contra"
            />
            
            <StatCard
              icon={<Shield className="w-5 h-5 text-indigo-500" />}
              label="Saves"
              value={player.saves || 0}
            />

            <StatCard
              icon={<Shield className="w-5 h-5 text-indigo-500" />}
              label="Saves"
              value={player.saves || 0}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
              label="Avg. SO"
              value={player.average_strikes_out?.toFixed(3) || '0.000'}
              sublabel="Promedio"
            />
            <StatCard
              icon={<BarChart3 className="w-5 h-5 text-indigo-500" />}
              label="Average"
              value={player.average?.toFixed(3) || '0.000'}
              sublabel="Promedio bateo"
              highlight
            />
          </div>
  
          {/* Resumen de bateo */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />
              Resumen de Bateo
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-3xl font-bold text-indigo-600">{player.strikes || 0}</p>
                <p className="text-xs text-gray-600 mt-1">Strikes</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{player.walks || 0}</p>
                <p className="text-xs text-gray-600 mt-1">Walks</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{player.home_runs || 0}</p>
                <p className="text-xs text-gray-600 mt-1">Home Runs</p>
              </div>
            </div>
          </div>
        </>
      );
    }
  
    if (isFootball) {
      return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<Target className="w-5 h-5 text-orange-500" />}
              label="Goles"
              value={player.goals || 0}
              highlight={player.goals > 0}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
              label="Asistencias"
              value={player.assists || 0}
            />
            <StatCard
              icon={<Activity className="w-5 h-5 text-green-500" />}
              label="Partidos"
              value={player.matches_played || 0}
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
              label="Amarillas"
              value={player.yellow_cards || 0}
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
              label="Rojas"
              value={player.red_cards || 0}
            />
            <StatCard
              icon={<Award className="w-5 h-5 text-purple-500" />}
              label="Promedio"
              value={player.average?.toFixed(2) || '0.00'}
            />
            <StatCard
              icon={<Zap className="w-5 h-5 text-yellow-500" />}
              label="Efectividad"
              value={
                player.matches_played > 0
                  ? ((player.goals / player.matches_played) * 100).toFixed(1) + '%'
                  : '0%'
              }
            />
          </div>
  
          {/* Tarjetas acumuladas */}
          {(player.yellow_cards > 0 || player.red_cards > 0) && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                Disciplina
              </h3>
              <div className="flex gap-4">
                {player.yellow_cards > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                    <div className="w-4 h-6 bg-yellow-400 rounded-sm" />
                    <span className="font-bold text-yellow-700">{player.yellow_cards}</span>
                    <span className="text-sm text-yellow-600">amarillas</span>
                  </div>
                )}
                {player.red_cards > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                    <div className="w-4 h-6 bg-red-500 rounded-sm" />
                    <span className="font-bold text-red-700">{player.red_cards}</span>
                    <span className="text-sm text-red-600">rojas</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );
    }
  
    // Fallback si sport_type no coincide
    return (
      <p className="text-gray-500 text-center py-4">
        Tipo de deporte no reconocido:{' '}
        <span className="font-mono text-sm">{tournament.sport_type}</span>
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative h-56 bg-gray-900 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundColor: tournament?.sport_type === 'softball' ? '#F59E0B' : '#3B82F6' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to={player.team ? `/sports/tournaments/${player.tournament_slug}/teams/${player.team}` : '/sports'}
            className="inline-flex items-center text-white/80 hover:text-white mb-3 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver al equipo
          </Link>
          <div className="flex items-center gap-4">
            {player.photo ? (
              <img 
                src={player.photo} 
                alt={`${player.first_name} ${player.last_name}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl border-4 border-white/20">
                {player.first_name?.[0]}{player.last_name?.[0]}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {player.first_name} {player.last_name}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Shirt className="w-4 h-4" />
                  #{player.jersey_number}
                </span>
                <span>•</span>
                <span>{player.position_display || player.position}</span>
                {player.is_captain && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Crown className="w-4 h-4" />
                      Capitán
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna izquierda - Info personal */}
          <div className="space-y-6">
            
            {/* Info del jugador */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Información
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Equipo</span>
                  <Link 
                    to={`/sports/tournaments/${player.tournament_slug}/teams/${player.team}`}
                    className="font-medium text-gray-900 hover:text-green-600 transition-colors"
                  >
                    {player.team_name}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Torneo</span>
                  <Link 
                    to={`/sports/tournaments/${player.tournament_slug}`}
                    className="font-medium text-gray-900 hover:text-green-600 transition-colors text-right"
                  >
                    {player.tournament_name}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Posición</span>
                  <span className="font-medium text-gray-900">{player.position_display || player.position}</span>
                </div>
                {player.nickname && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Apodo</span>
                    <span className="font-medium text-gray-900">"{player.nickname}"</span>
                  </div>
                )}
                {player.birth_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Nacimiento
                    </span>
                    <span className="font-medium text-gray-900">
                      {new Date(player.birth_date).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
                {player.nationality && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Nacionalidad
                    </span>
                    <span className="font-medium text-gray-900">{player.nationality}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${player.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {player.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Deporte */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Competición
              </h2>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: tournament?.sport_type && sportTypeColors[tournament.sport_type] || '#3B82F6' }}
                >
                  {tournament?.sport_type && sportTypeLabels[tournament.sport_type]?.[0] || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tournament?.sport_type && sportTypeLabels[tournament.sport_type] || 'Deporte'}</p>
                  <p className="text-xs text-gray-500">{player.tournament_name}</p>
                </div>
              </div>
            </div>

            {/* Botón editar */}
            {canEdit && (
              <Link
                to={`/sports/tournaments/${player.tournament_slug}/teams/${player.team}/roster`}
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Editar jugador
              </Link>
            )}
          </div>

          {/* Columna derecha - Estadísticas */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Título de estadísticas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  Estadísticas
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {isSoftball ? 'Softbol' : 'Fútbol'}
                  </span>
                </h2>
                <span className="text-sm text-gray-500">
                  {player.matches_played} partidos jugados
                </span>
              </div>

              {renderStats()}
            </div>

            {/* Historial reciente (placeholder para futuro) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                Últimos partidos
              </h2>
              <p className="text-gray-500 text-center py-8">
                El historial de partidos estará disponible próximamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para tarjetas de estadísticas
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sublabel, highlight }) => (
  <div className={`p-4 rounded-xl border transition-colors ${highlight ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs font-medium text-gray-600 uppercase">{label}</span>
    </div>
    <p className={`text-2xl font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>{value}</p>
    {sublabel && <p className="text-xs text-gray-500 mt-1">{sublabel}</p>}
  </div>
);

export default PlayerProfilePage;