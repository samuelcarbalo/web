import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTournaments, 
  getMyTournaments,
  getTournament, 
  createTournament, 
  updateTournament, 
  deleteTournament 
} from '../lib/sportsApi';
import type { Tournament, CreateTournamentData } from '../types/sports';

const TOURNAMENTS_KEY = 'tournaments';

export const useTournaments = (params?: { 
  sport_type?: string; 
  status?: string;
  page?: number;
  enabled?: boolean;
}) => {
  // 1. Determine which function to use based on the flag
  const fetchFn = params?.enabled ? getMyTournaments : getTournaments;

  // 2. Call the hook once at the top level
  return useQuery({
    // Include the 'enabled' flag in the key if it changes the data source
    queryKey: [TOURNAMENTS_KEY, params?.enabled, params], 
    queryFn: () => fetchFn(params),
    // Ensure the query actually runs if enabled is true
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

