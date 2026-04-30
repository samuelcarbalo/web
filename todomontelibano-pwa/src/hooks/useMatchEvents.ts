import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMatchEvent, updateScore } from '../services/sportsApi';
import type { MatchEvent } from '../types/sports';

export const useMatchEvents = (matchId: string) => {
  const queryClient = useQueryClient();

  // Agregar evento al partido
  const addEventMutation = useMutation({
    mutationFn: (data: {
      event_type: string;
      minute: number;
      player: string;
      team: string;
      description?: string;
    }) => addMatchEvent(matchId, data),
    onSuccess: () => {
      // Invalidar la query del partido para recargar eventos
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      // También invalidar la lista de partidos
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });

  // Actualizar marcador en vivo
  const updateScoreMutation = useMutation({
    mutationFn: (params: { id: string; data: { home_score?: number; away_score?: number } }) =>
      updateScore(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });

  return {
    addEventMutation,
    updateScoreMutation,
  };
};