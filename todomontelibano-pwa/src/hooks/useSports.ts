import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTournaments, 
  getMyTournaments,
  getTournament, 
  createTournament, 
  updateTournament, 
  deleteTournament,
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  // Nuevos imports
  getPlayers,
  getPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from '../lib/sportsApi';
import type { CreateTournamentData, CreateTeamData, CreatePlayerData } from '../types/sports';

const TOURNAMENTS_KEY = 'tournaments';
const TEAMS_KEY = 'teams';
const PLAYERS_KEY = 'players';

// ==================== TORNEOS ====================

export const useTournaments = (params?: { 
  sport_type?: string; 
  status?: string;
  page?: number;
  enabled?: boolean;
}) => {
  const fetchFn = params?.enabled ? getMyTournaments : getTournaments;

  return useQuery({
    queryKey: [TOURNAMENTS_KEY, params?.enabled, params], 
    queryFn: () => fetchFn(params),
    enabled: true, 
  });
};

export const useTournament = (slug: string) => {
  return useQuery({
    queryKey: [TOURNAMENTS_KEY, slug],
    queryFn: () => getTournament(slug),
    enabled: !!slug,
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TOURNAMENTS_KEY] });
    },
  });
};

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Partial<CreateTournamentData> }) => 
      updateTournament(slug, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TOURNAMENTS_KEY, variables.slug] });
      queryClient.invalidateQueries({ queryKey: [TOURNAMENTS_KEY] });
    },
  });
};

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TOURNAMENTS_KEY] });
    },
  });
};

// ==================== EQUIPOS ====================

export const useTeams = (slug?: string) => {
  return useQuery({
    queryKey: [TEAMS_KEY, slug],
    queryFn: () => getTeams(slug),
    enabled: !!slug,
  });
};

export const useTeam = (slug: string) => {
  return useQuery({
    queryKey: [TEAMS_KEY, slug],
    queryFn: () => getTeam(slug),
    enabled: !!slug,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTeam,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY, variables.tournament] });
      queryClient.invalidateQueries({ queryKey: [TOURNAMENTS_KEY] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: Partial<CreateTeamData> }) => 
      updateTeam(slug, data),
    onSuccess: (_, variables) => {
      console.log(variables)
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAMS_KEY] });
    },
  });
};

// ==================== JUGADORES ====================

export const usePlayers = (teamId?: string) => {
  return useQuery({
    queryKey: [PLAYERS_KEY, { team: teamId }],
    queryFn: () => getPlayers(teamId),
    enabled: !!teamId,
  });
};

export const usePlayer = (id: string) => {
  return useQuery({
    queryKey: [PLAYERS_KEY, id],
    queryFn: () => getPlayer(id),
    enabled: !!id,
  });
};

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPlayer,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_KEY, { team: variables.team }] });
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePlayerData> }) => 
      updatePlayer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_KEY] });
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_KEY] });
    },
  });
};

