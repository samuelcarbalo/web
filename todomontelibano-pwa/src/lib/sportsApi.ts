import { api } from './api';
import type { Tournament, CreateTournamentData, PaginatedResponse, Team, CreateTeamData } from '../types/sports';

export const getTournaments = async (params?: { 
  sport_type?: string; 
  status?: string;
  page?: number;
}) => {
  console.log('params1:', params);
  const response = await api.get<PaginatedResponse<Tournament>>('/sports/tournaments/', { params });
  console.log('Response data:', JSON.stringify(response.data))
  return response.data;
};
export const getMyTournaments = async (params?: { 
  sport_type?: string; 
  status?: string;
  page?: number;
}) => {
  console.log('params1:', params);
  const response = await api.get<PaginatedResponse<Tournament>>('/sports/tournaments/my_tournaments/', { params });
  console.log('Response data:', JSON.stringify(response.data))
  return response.data; 
};

export const getTournament = async (slug: string) => {
  const response = await api.get<Tournament>(`/sports/tournaments/${slug}/`);
  console.log('Response data:', JSON.stringify(response.data))
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

export const getTeams = async (tournamentId?: string) => {
  const params = tournamentId ? { tournament: tournamentId } : {};
  const response = await api.get<PaginatedResponse<Team>>('/sports/teams/', { params });
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