import React from 'react';
import {
  usePlayers,
  useUpdatePlayer,
  useUpdateScore,
  useAddMatchEvent,
  useFinishMatch,
} from '../../hooks/useSports';

interface MatchEventControlsProps {
  id: string;
  match: any;
  homeTeamId: string;
  awayTeamId: string;
  isOwner: boolean;
  isLive: boolean;
}

const MatchEventControls: React.FC<MatchEventControlsProps> = ({
  id,
  match,
  homeTeamId,
  awayTeamId,
  isOwner,
  isLive,
}) => {
  const { mutate: updatePlayer } = useUpdatePlayer();
  const updateScoreMutation = useUpdateScore();
  const addEventMutation = useAddMatchEvent();
  const finishMutation = useFinishMatch();

  const { data: homeData } = usePlayers(homeTeamId);
  const { data: awayData } = usePlayers(awayTeamId);

  // Normalización de datos
  const homePlayers = (!Array.isArray(homeData) && homeData?.results) ? homeData.results : [];
  const awayPlayers = (!Array.isArray(awayData) && awayData?.results) ? awayData.results : [];

  /**
   * Función unificada para manejar Goles, Amarillas y Rojas
   */
  const handlePlayerEvent = (team: 'home' | 'away', player: any, type: 'goal' | 'yellow_card' | 'red_card') => {
    // 1. Si es gol, actualizamos el marcador del partido
    if (type === 'goal') {
      const newScore = {
        home_score: match.home_score ?? 0,
        away_score: match.away_score ?? 0,
      };
      if (team === 'home') newScore.home_score += 1;
      else newScore.away_score += 1;
      
      updateScoreMutation.mutate({ id, data: newScore });
    }

    // 2. Registrar el evento en el historial del partido (para el feed)
    addEventMutation.mutate({
      id: id,
      data: {
        event_type: type,
        minute: new Date().getMinutes(), // Idealmente usar un timer real si lo tienes
        player: player.id,
        team: team === 'home' ? match.home_team.id : match.away_team.id,
        description: `${type === 'goal' ? 'Gol' : 'Tarjeta'} de ${player.full_name}`,
      },
    });

    // 3. Actualizar las estadísticas individuales del jugador
    // Asumimos que el backend suma estos valores o recibe el incremento
    const statsUpdate: any = {};
    if (type === 'goal') statsUpdate.goals = (player.goals || 0) + 1;
    if (type === 'yellow_card') statsUpdate.yellow_cards = (player.yellow_cards || 0) + 1;
    if (type === 'red_card') statsUpdate.red_cards = (player.red_cards || 0) + 1;

    updatePlayer({ id: player.id, data: statsUpdate });
  };

  const handleFinish = () => {
    // Sumar partido jugado a todos
    [...homePlayers, ...awayPlayers].forEach((player) => {
      updatePlayer({ id: player.id, data: { matches_played: (player.matches_played || 0) + 1 } });
    });
    finishMutation.mutate({ id, data: {} });
  };

  if (!isOwner) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-900">Panel de Control (En Vivo)</h3>
        <button
          onClick={handleFinish}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold"
        >
          Finalizar y Cerrar Planilla
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Lado Local */}
        <TeamActionList 
          title={match.home_team_detail?.name || 'Local'} 
          players={homePlayers} 
          onEvent={(p, type) => handlePlayerEvent('home', p, type)}
        />
        {/* Lado Visitante */}
        <TeamActionList 
          title={match.away_team_detail?.name || 'Visitante'} 
          players={awayPlayers} 
          onEvent={(p, type) => handlePlayerEvent('away', p, type)}
        />
      </div>
    </div>
  );
};

/**
 * Sub-componente para no repetir el diseño de las listas por equipo
 */
const TeamActionList = ({ title, players, onEvent }: { title: string, players: any[], onEvent: (p: any, type: any) => void }) => (
  <div className="space-y-4">
    <h4 className="font-semibold text-gray-700 border-b pb-2">{title}</h4>
    <div className="max-h-64 overflow-y-auto space-y-2">
      {players.map((player) => (
        <div key={player.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
          <span className="text-sm font-medium">{player.full_name}</span>
          <div className="flex gap-1">
            <button onClick={() => onEvent(player, 'goal')} className="p-1.5 bg-green-100 text-green-700 rounded text-xs font-bold hover:bg-green-200" title="Gol">+G</button>
            <button onClick={() => onEvent(player, 'yellow_card')} className="p-1.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold hover:bg-yellow-200" title="Amarilla">AM</button>
            <button onClick={() => onEvent(player, 'red_card')} className="p-1.5 bg-red-100 text-red-700 rounded text-xs font-bold hover:bg-red-200" title="Roja">RJ</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MatchEventControls;