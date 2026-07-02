import { api } from './api';
import { getViewerHash } from './viewerHash';
import type { Tournament, CreateTournamentData, PaginatedResponse, Team, CreateTeamData, Player, CreatePlayerData, Match, CreateMatchData, MatchPeriod, CreateBannerData, FormatTemplate, TournamentStructure, StandingsScope, CompetitionGroup, Bracket, AdvancePhaseData, AdvancePhaseResult } from '../types/sports';

export const getTournaments = async (params?: { 
  sport_type?: string; 
  status?: string;
  page?: number;
}) => {
  const response = await api.get<PaginatedResponse<Tournament>>('/sports/tournaments/', { params });
  // console.log('Response getTournaments:', JSON.stringify(response.data))
  return response.data;
};
export const getMyTournaments = async (params?: { 
  sport_type?: string; 
  status?: string;
  page?: number;
}) => {
  // console.log('params1:', params);
  const response = await api.get<PaginatedResponse<Tournament>>('/sports/tournaments/my_tournaments/', { params });
  // console.log('Response getMyTournaments:', JSON.stringify(response.data))
  return response.data; 
};

export const getTournament = async (slug: string) => {
  const response = await api.get<Tournament>(`/sports/tournaments/${slug}/`);
  // console.log('Response data:', JSON.stringify(response.data))
  return response.data;
};

export const createTournament = async (data: CreateTournamentData) => {
  const response = await api.post<Tournament>('/sports/tournaments/', data);
  return response.data;
};

export const updateTournament = async (slug: string, data: Partial<CreateTournamentData>) => {
  const response = await api.patch<Tournament>(`/sports/tournaments/${slug}/`, data);
  return response.data;
};

export const deleteTournament = async (slug: string) => {
  await api.delete(`/sports/tournaments/${slug}/`);
};

// --- Funciones para equipos ---

export const getTeams = async (slug?: string) => {
  const params = slug ? { tournament: slug } : {};
  const response = await api.get<PaginatedResponse<Team>>(`/sports/tournaments/${slug}/teams/`, { params });
  // console.log('Response getTeams:', JSON.stringify(response.data))
  return response.data;
};

export const getTeam = async (slug: string) => {
  const response = await api.get<Team>(`/sports/teams/${slug}/`);
  return response.data;
};

export const createTeam = async (data: CreateTeamData) => {
  const response = await api.post<Team>('/sports/teams/', data);
  return response.data;
};

export const updateTeam = async (slug: string, data: Partial<CreateTeamData>) => {
  const response = await api.patch<Team>(`/sports/teams/${slug}/`, data);
  return response.data;
};

export const deleteTeam = async (slug: string) => {
  await api.delete(`/sports/teams/${slug}/`);
};

// --- Funciones para jugadores ---

export const getPlayers = async (teamId?: string) => {
  const params = teamId ? { team: teamId } : {};
  const response = await api.get<PaginatedResponse<Player>>('/sports/players/', { params });
  return response.data;
};

export const getPlayer = async (id: string) => {
  const response = await api.get<Player>(`/sports/players/${id}/`);
  return response.data;
};

export const createPlayer = async (data: CreatePlayerData) => {
  const response = await api.post<Player>('/sports/players/', data);
  return response.data;
};

export const updatePlayer = async (id: string, data: Partial<CreatePlayerData>) => {
  const response = await api.patch<Player>(`/sports/players/${id}/`, data);
  return response.data;
};

export const deletePlayer = async (id: string) => {
  await api.delete(`/sports/players/${id}/`);
};

// --- Funciones para partidos ---

export const getMatches = async (params?: {
  tournament?: string;
  team?: string;
  status?: string;
  live?: boolean;
  from?: string;
  to?: string;
  page?: number;
  phase?: string;
  group?: string;
}) => {
  const response = await api.get<PaginatedResponse<Match>>('/sports/matches/', { params });
  return response.data;
};

export const getMatch = async (id: string) => {
  const response = await api.get<Match>(`/sports/matches/${id}/`);
  return response.data;
};

export const createMatch = async (data: CreateMatchData) => {
  const response = await api.post<Match>('/sports/matches/', data);
  return response.data;
};

export const updateMatch = async (id: string, data: Partial<CreateMatchData>) => {
  const response = await api.patch<Match>(`/sports/matches/${id}/`, data);
  return response.data;
};

export const deleteMatch = async (id: string) => {
  await api.delete(`/sports/matches/${id}/`);
};

// Acciones especiales
export const startMatch = async (id: string) => {
  const response = await api.post(`/sports/matches/${id}/start_match/`);
  return response.data;
};

export const finishMatch = async (id: string, data: {
  home_score?: number;
  away_score?: number;
  home_runs?: number;
  away_runs?: number;
}) => {
  const response = await api.post(`/sports/matches/${id}/finish_match/`, data);
  return response.data;
};

export const updateScore = async (id: string, data: {
  home_score?: number;
  away_score?: number;
  home_runs?: number;
  away_runs?: number;
}) => {
  const response = await api.post(`/sports/matches/${id}/update_score/`, data);
  return response.data;
};

export const addMatchEvent = async (id: string, data: {
  event_type: string;
  minute: number;
  player?: string;
  team?: string;
  description?: string;
}) => {
  const response = await api.post(`/sports/matches/${id}/add_event/`, data);
  return response.data;
};

// Alineaciones
export const setLineup = async (id: string, data: {
  team: string;
  players: Array<{
    player: string;
    is_starter: boolean;
    position: string;
    jersey_number: number;
  }>;
}) => {
  const response = await api.post(`/sports/matches/${id}/set_lineup/`, data);
  return response.data;
};

export const substitutePlayer = async (id: string, data: {
  team: string | number;
  player_out: string | number;
  player_in: string | number;
  minute: number;
}) => {
  const response = await api.post(`/sports/matches/${id}/substitute_player/`, data);
  return response.data;
};

// Agregar al final del archivo, junto con las otras funciones

// ============ ALINEACIONES ============

export const getMatchLineup = async (id: string) => {
  const response = await api.get(`/sports/matches/${id}/lineup/`);
  return response.data;
};

export const setMatchLineup = async (id: string, data: {
  team: string;
  players: Array<{
    player: string;
    is_starter: boolean;
    position: string;
    jersey_number: number;
  }>;
}) => {
  const response = await api.post(`/sports/matches/${id}/set_lineup/`, data);
  return response.data;
};

export const substituteMatchPlayer = async (id: string, data: {
  team: string | number;
  player_out: string | number;
  player_in: string | number;
  minute: number;
}) => {
  const response = await api.post(`/sports/matches/${id}/substitute_player/`, data);
  return response.data;
};

// ============ JUGADORES POR EQUIPO ============

export const getTeamPlayers = async (slug: string) => {
  const response = await api.get<Player[]>(`/sports/teams/${slug}/players/`);
  return response.data;
};

export const getMatchPeriods = async (id: string) => {
  const response = await api.get<MatchPeriod[]>(`/sports/matches/${id}/periods/`);
  return response.data;
};

export const startPeriod = async (id: string, data: {
  period_number: number;
  name: string;
}) => {
  const response = await api.post<MatchPeriod>(`/sports/matches/${id}/start_period/`, data);
  return response.data;
};

export const pausePeriod = async (id: string) => {
  const response = await api.post<MatchPeriod>(`/sports/matches/${id}/pause_period/`);
  return response.data;
};

export const resumePeriod = async (id: string) => {
  const response = await api.post<MatchPeriod>(`/sports/matches/${id}/resume_period/`);
  return response.data;
};

export const endPeriod = async (id: string) => {
  const response = await api.post<MatchPeriod>(`/sports/matches/${id}/end_period/`);
  return response.data;
};

// ============ ESTADÍSTICAS DE JUGADOR ============

export const getPlayerStats = async (id: string) => {
  const response = await api.get(`/sports/players/${id}/stats/`);
  return response.data;
};

// ============ TABLA DE POSICIONES ============

export const getTournamentStandings = async (slug: string, scope?: StandingsScope) => {
  const params: Record<string, string> = {};
  if (scope?.phase) params.phase = scope.phase;
  if (scope?.group) params.group = scope.group;
  const response = await api.get(`/sports/tournaments/${slug}/standings/`, { params });
  return response.data;
};

// ============ ESTRUCTURA DE TORNEO ============

export const getFormatTemplates = async (sportType?: string) => {
  const params = sportType ? { sport_type: sportType } : {};
  const response = await api.get<FormatTemplate[]>('/sports/tournaments/format_templates/', { params });
  return response.data;
};

export const getTournamentStructure = async (slug: string) => {
  const response = await api.get<TournamentStructure>(`/sports/tournaments/${slug}/structure/`);
  return response.data;
};

export const assignGroupTeams = async (slug: string, groupId: string, teamIds: string[]) => {
  const response = await api.post<CompetitionGroup>(
    `/sports/tournaments/${slug}/assign_group_teams/`,
    { group_id: groupId, team_ids: teamIds }
  );
  return response.data;
};

export const generateFixture = async (
  slug: string,
  data: { phase_id: string; group_id?: string; match_date: string; venue?: string }
) => {
  const response = await api.post<{ created_count: number; matches: Match[] }>(
    `/sports/tournaments/${slug}/generate_fixture/`,
    data
  );
  return response.data;
};

export const getTournamentSchedule = async (
  slug: string,
  params?: { status?: string; team?: string; phase?: string; group?: string }
) => {
  const response = await api.get<Match[]>(`/sports/tournaments/${slug}/schedule/`, { params });
  return response.data;
};

export const advancePhase = async (slug: string, data: AdvancePhaseData) => {
  const response = await api.post<AdvancePhaseResult>(
    `/sports/tournaments/${slug}/advance_phase/`,
    data
  );
  return response.data;
};

export const getTournamentBracket = async (slug: string, phaseSlug: string) => {
  const response = await api.get<Bracket>(
    `/sports/tournaments/${slug}/bracket/`,
    { params: { phase: phaseSlug } }
  );
  return response.data;
};

// ============ ESTADÍSTICAS DE JUGADORES POR TORNEO ============

export const getTournamentPlayerStats = async (slug: string) => {
  const response = await api.get(`/sports/tournaments/${slug}/player_stats/`);
  return response.data;
};

export const getBannersByPosition = async (
  position: string,
  tournamentId?: string,
  objectId?: string
) => {
  const params: Record<string, string> = { position };
  if (tournamentId) params.tournament = tournamentId;
  if (objectId) {
    params.object_id = objectId;
    params.viewer_hash = getViewerHash();
  }
  const response = await api.get('/sports/banners/by_position/', { params });
  return response.data;
};
export const trackBannerClick = async (id: string) => {
  const response = await api.post(`/sports/banners/${id}/track_click/`);
  return response.data;
};

export const createBanner = async (data: CreateBannerData) => {
  const response = await api.post('/sports/banners/', data);
  return response.data;
};

