import React, { useState, useEffect } from 'react';
import {
  Users,
  Shirt,
  ArrowRightLeft,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Shield,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import {
  useMatchLineup,
  useSetLineup,
  useSubstitutePlayer,
  usePlayers,
} from '../../hooks/useSports';
import type { Player } from '../../types/sports';

interface MatchLineupSectionProps {
  match: {
    id: string;
    status: string;
    sport_type: string;
    home_team: string;
    away_team: string;
    home_team_detail?: { name: string; slug: string };
    away_team_detail?: { name: string; slug: string };
    posted_by?: string;
  };
  playerCards?: Record<string, { yellow: number; red: boolean }>;
  isPlayerSentOff?: (playerId: string) => boolean;
  getPlayerYellowCards?: (playerId: string) => number;
  isLive?: boolean;
  matchTimer?: number;
}

interface LineupPlayer {
  id: string;
  player: string;
  player_name: string;
  jersey_number?: number;
  position?: string;
  is_starter: boolean;
  status: string;
  substitution_minute?: number | null;
  entry_number?: number;
}

const MatchLineupSection: React.FC<MatchLineupSectionProps> = ({
  match,
  playerCards,
  matchTimer,
}) => {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'manager' && user?.id === match?.posted_by;

  const isScheduled = match.status === 'scheduled';
  const isLive = match.status === 'live';

  // === APIS ===
  const { data: lineupData, isLoading: lineupLoading } = useMatchLineup(match.id);

  const homeTeamId = match.home_team;
  const awayTeamId = match.away_team;

  const { data: homePlayersData, isLoading: homePlayersLoading } = usePlayers(homeTeamId);
  const { data: awayPlayersData, isLoading: awayPlayersLoading } = usePlayers(awayTeamId);

  const setLineupMutation = useSetLineup();
  const substituteMutation = useSubstitutePlayer();

  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');
  const [selectedStarters, setSelectedStarters] = useState<Record<string, string[]>>({
    home: [],
    away: [],
  });
  const [selectedSubstituteOut, setSelectedSubstituteOut] = useState<Record<string, string>>({
    home: '',
    away: '',
  });
  const [selectedSubstituteIn, setSelectedSubstituteIn] = useState<Record<string, string>>({
    home: '',
    away: '',
  });
  const [substitutionMinute, setSubstitutionMinute] = useState<number>(0);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const minStarters = match.sport_type === 'football' ? 6 : 1;

  // Jugadores de la plantilla del equipo activo
  const activePlayers: Player[] = activeTeam === 'home'
    ? (homePlayersData?.results || [])
    : (awayPlayersData?.results || []);

  // Datos del equipo activo desde el API
  const teamData = activeTeam === 'home' ? lineupData?.home_team : lineupData?.away_team;

  // TODOS los registros de lineup (titulares + suplentes)
  const allLineup: LineupPlayer[] = [
    ...(teamData?.starters || []),
    ...(teamData?.substitutes || []),
  ];

  // =============================================================================
  // LÓGICA DE AGRUPACIÓN POR ESTADO (usa 'status' del backend)
  // =============================================================================

  // Jugadores actualmente EN CANCHA (titulares jugando + suplentes que entraron)
  const onFieldPlayers = allLineup.filter(
    (p) => p.status === 'playing' || p.status === 'entered'
  );

  // Jugadores que SALIERON (sustituidos)
  const substitutedOut = allLineup.filter(
    (p) => p.status === 'substituted'
  );

  // Jugadores en BANCA (suplentes que nunca entraron)
  const benchPlayers = allLineup.filter(
    (p) => !p.is_starter && p.status !== 'entered'
  );

  // IDs de jugadores que ya tienen algún registro en el lineup
  const lineupPlayerIds = new Set(allLineup.map((p) => p.player));

  // Jugadores de plantilla que NUNCA fueron convocados
  const availablePlayers = activePlayers.filter((p) => !lineupPlayerIds.has(p.id));

  // =============================================================================
  // JUGADORES DISPONIBLES PARA ENTRAR EN UNA SUSTITUCIÓN
  // =============================================================================
  const availableForSubIn = activePlayers.filter((p) => {
    const entry = allLineup.find((lp) => lp.player === p.id);
    if (!entry) return true;
    return entry.status !== 'playing' && entry.status !== 'entered';
  });

  // Sincronizar seleccionados con lineup existente
  useEffect(() => {
    if (lineupData) {
      const homeStarters = lineupData.home_team?.starters
        ?.filter((p: LineupPlayer) => p.status === 'playing')
        ?.map((p: LineupPlayer) => p.player) || [];
      const awayStarters = lineupData.away_team?.starters
        ?.filter((p: LineupPlayer) => p.status === 'playing')
        ?.map((p: LineupPlayer) => p.player) || [];
      setSelectedStarters({ home: homeStarters, away: awayStarters });
    }
  }, [lineupData]);

  // Sincronizar minuto con cronómetro
  useEffect(() => {
    if (isLive && matchTimer !== undefined) {
      setSubstitutionMinute(matchTimer);
    }
  }, [matchTimer, isLive]);

  const currentTeamId = activeTeam === 'home' ? match.home_team : match.away_team;
  const currentTeamName = activeTeam === 'home'
    ? match.home_team_detail?.name
    : match.away_team_detail?.name;

  const handleToggleStarter = (playerId: string) => {
    if (!isOwner || !isScheduled) return;
    setSelectedStarters((prev) => {
      const current = prev[activeTeam];
      const isSelected = current.includes(playerId);
      if (isSelected) {
        return { ...prev, [activeTeam]: current.filter((id) => id !== playerId) };
      }
      return { ...prev, [activeTeam]: [...current, playerId] };
    });
    setSaveError(null);
  };

  const handleSaveLineup = () => {
    const teamStarters = selectedStarters[activeTeam];
    if (teamStarters.length < minStarters) {
      setSaveError(
        `Debes alinear al menos ${minStarters} jugadores titulares para ${match.sport_type === 'football' ? 'fútbol' : 'este deporte'}.`
      );
      return;
    }
    const playersData = teamStarters.map((playerId) => {
      const player = activePlayers.find((p) => p.id === playerId);
      return {
        player: playerId,
        is_starter: true,
        position: player?.position || '',
        jersey_number: player?.jersey_number || 0,
      };
    });

    setLineupMutation.mutate(
      {
        id: match.id,
        data: { team: currentTeamId, players: playersData },
      },
      {
        onSuccess: () => {
          setShowSaveConfirm(false);
          setSaveError(null);
        },
        onError: (err: any) => {
          setSaveError(err?.response?.data?.detail || 'Error al guardar la alineación');
        },
      }
    );
  };

  const isPlayerSentOff = (playerId: string): boolean => {
    return playerCards?.[playerId]?.red === true;
  };

  const handleSubstitute = () => {
    if (!isOwner || !isLive) return;

    const playerOut = selectedSubstituteOut[activeTeam];
    const playerIn = selectedSubstituteIn[activeTeam];
    const teamId = activeTeam === 'home' ? match.home_team : match.away_team;

    if (!teamId) {
      setSaveError('Error: No se pudo determinar el equipo');
      return;
    }
    if (!playerOut) {
      setSaveError('Selecciona un jugador que sale');
      return;
    }
    if (!playerIn) {
      setSaveError('Selecciona un jugador que entra');
      return;
    }
    if (playerOut === playerIn) {
      setSaveError('No puedes sustituir un jugador por sí mismo');
      return;
    }
    if (isPlayerSentOff(playerOut)) {
      setSaveError('Este jugador ya está expulsado');
      return;
    }
    if (isPlayerSentOff(playerIn)) {
      setSaveError('No puedes ingresar un jugador expulsado');
      return;
    }

    substituteMutation.mutate(
      {
        id: match.id,
        data: {
          team: teamId,
          player_out: playerOut,
          player_in: playerIn,
          minute: substitutionMinute || 0,
        },
      },
      {
        onSuccess: () => {
          setSelectedSubstituteOut((prev) => ({ ...prev, [activeTeam]: '' }));
          setSelectedSubstituteIn((prev) => ({ ...prev, [activeTeam]: '' }));
          setSubstitutionMinute(matchTimer || 0);
          setSaveError(null);
        },
        onError: (err: any) => {
          console.error('Error sustitución:', err?.response?.data);
          setSaveError(
            err?.response?.data?.error || err?.response?.data?.detail || 'Error al realizar la sustitución'
          );
        },
      }
    );
  };

  const getPlayerById = (playerId: string): Player | undefined => {
    return activePlayers.find((p) => p.id === playerId);
  };

  const isLoading = lineupLoading || homePlayersLoading || awayPlayersLoading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
        <p className="text-gray-500 mt-2">Cargando alineaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de equipo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setActiveTeam('home');
              setSaveError(null);
              setSelectedSubstituteOut((prev) => ({ ...prev, home: '' }));
              setSelectedSubstituteIn((prev) => ({ ...prev, home: '' }));
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTeam === 'home'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {match.home_team_detail?.name || 'Local'}
          </button>
          <button
            onClick={() => {
              setActiveTeam('away');
              setSaveError(null);
              setSelectedSubstituteOut((prev) => ({ ...prev, away: '' }));
              setSelectedSubstituteIn((prev) => ({ ...prev, away: '' }));
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTeam === 'away'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {match.away_team_detail?.name || 'Visitante'}
          </button>
        </div>
      </div>

      {/* EN CANCHA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">
              En Cancha — {currentTeamName}
            </h3>
          </div>
          <span className="text-sm text-gray-500">{onFieldPlayers.length} jugadores</span>
        </div>

        {onFieldPlayers.length > 0 ? (
          <div className="space-y-2">
            {onFieldPlayers.map((player: LineupPlayer) => {
              const playerInfo = getPlayerById(player.player);
              const isSelectedForSubOut = selectedSubstituteOut[activeTeam] === player.player;
              const yellowCount = playerCards?.[player.player]?.yellow || 0;
              const hasRedCard = playerCards?.[player.player]?.red || false;

              return (
                <div
                  key={`${player.player}-${player.entry_number || 0}`}
                  onClick={() => {
                    if (hasRedCard) return;
                    if (isLive && isOwner) {
                      setSelectedSubstituteOut((prev) => ({
                        ...prev,
                        [activeTeam]: isSelectedForSubOut ? '' : player.player,
                      }));
                      setSaveError(null);
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isSelectedForSubOut
                      ? 'border-red-300 bg-red-50'
                      : hasRedCard
                      ? 'border-red-200 bg-red-50 opacity-60'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isLive && isOwner && !hasRedCard ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm relative">
                    {player.jersey_number || playerInfo?.jersey_number || '—'}
                    <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                      {yellowCount >= 1 && (
                        <div
                          className={`w-3 h-4 rounded-sm ${
                            yellowCount >= 2 ? 'bg-red-600' : 'bg-yellow-400'
                          } border border-white`}
                        />
                      )}
                      {hasRedCard && <div className="w-3 h-4 rounded-sm bg-red-600 border border-white" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${hasRedCard ? 'text-red-700 line-through' : 'text-gray-900'}`}>
                      {player.player_name || playerInfo?.full_name || 'Jugador'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {player.position || playerInfo?.position || 'Jugador'}
                      {!player.is_starter && (
                        <span className="ml-1 text-blue-600 font-medium">(Ingresó)</span>
                      )}
                      {hasRedCard && (
                        <span className="ml-1 text-red-600 font-bold">(EXPULSADO)</span>
                      )}
                    </p>
                  </div>
                  {isLive && isOwner && !hasRedCard && (
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelectedForSubOut ? 'border-red-500 bg-red-500' : 'border-gray-300'
                      }`}
                    >
                      {isSelectedForSubOut && <X className="w-3 h-3 text-white" />}
                    </div>
                  )}
                  {hasRedCard && <Shield className="w-5 h-5 text-red-600" />}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No hay jugadores en cancha</p>
          </div>
        )}
      </div>

      {/* PANEL DE SUSTITUCIÓN */}
      {isLive && isOwner && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Sustitución</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Sale (en cancha)
              </label>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 min-h-[38px]">
                {selectedSubstituteOut[activeTeam] ? (
                  <span className="font-medium">
                    {getPlayerById(selectedSubstituteOut[activeTeam])?.full_name || 'Seleccionado'}
                  </span>
                ) : (
                  <span className="text-gray-400">Selecciona un jugador arriba ↑</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Entra (disponible)
              </label>
              <select
                value={selectedSubstituteIn[activeTeam]}
                onChange={(e) => {
                  setSelectedSubstituteIn((prev) => ({ ...prev, [activeTeam]: e.target.value }));
                  setSaveError(null);
                }}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Seleccionar jugador</option>
                {availableForSubIn
                  .filter((player: Player) => !isPlayerSentOff(player.id))
                  .map((player: Player) => (
                    <option key={player.id} value={player.id}>
                      #{player.jersey_number || '—'} {player.full_name}{' '}
                      {player.position ? `(${player.position})` : ''}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Minuto
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={substitutionMinute}
                onChange={(e) => setSubstitutionMinute(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleSubstitute}
            disabled={
              substituteMutation.isPending ||
              !selectedSubstituteOut[activeTeam] ||
              !selectedSubstituteIn[activeTeam]
            }
            className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {substituteMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="w-4 h-4" />
            )}
            Confirmar Sustitución
          </button>
        </div>
      )}

      {/* SUSTITUIDOS */}
      {substitutedOut.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            Sustituidos / Fuera de Cancha
          </h3>
          <div className="space-y-2">
            {substitutedOut.map((player: LineupPlayer) => {
              const playerInfo = getPlayerById(player.player);
              return (
                <div
                  key={`${player.player}-${player.entry_number || 0}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-60"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                    {player.jersey_number || playerInfo?.jersey_number || '—'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-700 line-through">
                      {player.player_name || playerInfo?.full_name || 'Jugador'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {player.is_starter ? 'Titular' : 'Suplente'} • Entrada #
                      {player.entry_number || 1}
                    </p>
                  </div>
                  <span className="text-xs text-red-500 font-medium">
                    ↓ {player.substitution_minute ?? '-'}'
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN INICIAL DE ALINEACIÓN */}
      {isOwner && isScheduled && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900">
                Plantilla — {currentTeamName}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedStarters[activeTeam].length} seleccionados
              </span>
              {selectedStarters[activeTeam].length >= minStarters && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                  Listo
                </span>
              )}
            </div>
          </div>

          {/* Jugadores ya en lineup (banca) */}
          {benchPlayers.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                En banca
              </p>
              <div className="space-y-2">
                {benchPlayers.map((player: LineupPlayer) => {
                  const playerInfo = getPlayerById(player.player);
                  const isSelected = selectedStarters[activeTeam].includes(player.player);

                  return (
                    <div
                      key={player.id}
                      onClick={() => handleToggleStarter(player.player)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                        {player.jersey_number || playerInfo?.jersey_number || '—'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {player.player_name || playerInfo?.full_name || 'Jugador'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {player.position || playerInfo?.position || 'Jugador'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jugadores disponibles (no en lineup) */}
          {availablePlayers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Disponibles para alinear
              </p>
              <div className="space-y-2">
                {availablePlayers.map((player: Player) => {
                  const isSelected = selectedStarters[activeTeam].includes(player.id);

                  return (
                    <div
                      key={player.id}
                      onClick={() => handleToggleStarter(player.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                        {player.jersey_number || '—'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{player.full_name}</p>
                        <p className="text-xs text-gray-500">
                          {player.position || 'Jugador'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {availablePlayers.length === 0 && benchPlayers.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay jugadores registrados en este equipo</p>
            </div>
          )}

          {/* Botón guardar */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            {saveError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {saveError}
              </div>
            )}
            <button
              onClick={() => setShowSaveConfirm(true)}
              disabled={
                selectedStarters[activeTeam].length < minStarters || setLineupMutation.isPending
              }
              className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {setLineupMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Alineación ({selectedStarters[activeTeam].length} jugadores)
            </button>
          </div>
        </div>
      )}

      {/* VISTA SOLO LECTURA */}
      {(!isOwner || (!isScheduled && !isLive)) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">
              Plantilla — {currentTeamName}
            </h3>
          </div>

          {activePlayers.length > 0 ? (
            <div className="space-y-2">
              {activePlayers.map((player: Player) => {
                const entry = allLineup.find((lp) => lp.player === player.id);
                const isOnField = entry?.status === 'playing' || entry?.status === 'entered';
                const wasSubstituted = entry?.status === 'substituted';
                const hasRedCard = playerCards?.[player.id]?.red || false;
                const yellowCount = playerCards?.[player.id]?.yellow || 0;

                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isOnField
                        ? 'border-green-200 bg-green-50'
                        : wasSubstituted
                        ? 'border-gray-200 bg-gray-50 opacity-60'
                        : 'border-gray-200'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm relative ${
                        isOnField ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {player.jersey_number || '—'}
                      <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                        {yellowCount >= 1 && (
                          <div
                            className={`w-3 h-4 rounded-sm ${
                              yellowCount >= 2 ? 'bg-red-600' : 'bg-yellow-400'
                            } border border-white`}
                          />
                        )}
                        {hasRedCard && (
                          <div className="w-3 h-4 rounded-sm bg-red-600 border border-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          wasSubstituted ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {player.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {player.position || 'Jugador'}
                        {entry?.status === 'entered' && (
                          <span className="ml-1 text-blue-600">(Ingresó de cambio)</span>
                        )}
                      </p>
                    </div>
                    {isOnField && (
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        {entry?.is_starter ? 'Titular' : 'En Cancha'}
                      </span>
                    )}
                    {wasSubstituted && (
                      <span className="text-xs font-medium text-red-500">
                        ↓ {entry?.substitution_minute ?? '-'}'
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hay jugadores registrados</p>
            </div>
          )}
        </div>
      )}

      {/* Modal confirmar guardar */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Confirmar alineación</h2>
            <p className="text-sm text-gray-500 mb-4">
              Vas a alinear <strong>{selectedStarters[activeTeam].length}</strong> jugadores
              titulares para <strong>{currentTeamName}</strong>.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Una vez guardada, solo podrás hacer cambios mediante sustituciones durante el
              partido.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSaveLineup}
                disabled={setLineupMutation.isPending}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
              >
                {setLineupMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirmar
              </button>
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchLineupSection;