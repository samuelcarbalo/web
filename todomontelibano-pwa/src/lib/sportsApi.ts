import { api } from './api';
import type { Tournament, CreateTournamentData, PaginatedResponse } from '../types/sports';

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
  const response = await api.get<PaginatedResponse<Tournament>>('/sports/tournaments/my_tournaments/', { params });
  console.log('Response data:', JSON.stringify(response.data))
  return response.data; 
};

export const getTournament = async (slug: string) => {
  const response = await api.get<Tournament>(`/sports/tournaments/${slug}/`);
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