import { api } from './api';
import type { Tournament, CreateTournamentData, PaginatedResponse, Team, CreateTeamData, Player, CreatePlayerData } from '../types/sports';

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