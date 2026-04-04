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
  if (params?.enabled === true) {
    console.log('params1:', params);
    return useQuery({
      queryKey: [TOURNAMENTS_KEY, params],
      queryFn: () => getMyTournaments(params),
      enabled: params?.enabled,
    });
  } else {
    console.log('params2:', params);
    return useQuery({
      queryKey: [TOURNAMENTS_KEY, params],
      queryFn: () => getTournaments(params),
      enabled: true,
    });
  }
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

