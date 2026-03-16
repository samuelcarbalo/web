import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Application, Job, JobApplication, PaginatedResponse } from '../types';

const JOBS_KEY = 'jobs';

export const useJobs = (filters: any, options: any, params?: any) => {
  return useQuery({
    queryKey: [JOBS_KEY, filters, params],
    queryFn: async () => {
      // Nota: Si usas 'filters', deberías pasarlos a tu API aquí
      const response = await api.get<PaginatedResponse<Job>>('/jobs/offers/');
      return response.data;
    },
    ...options, // <--- ESTO ES LO QUE FALTABA
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: [JOBS_KEY, id],
    queryFn: async () => {
      const response = await api.get<Job>(`/jobs/offers/${id}/`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Agrega esto junto a tus otros hooks
export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: { status?: JobApplication['status']; recruiter_notes?: string } 
    }) => {
      const response = await api.patch(`/jobs/applications/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las queries de aplicaciones para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Job>) => {
      const response = await api.post('/jobs/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOBS_KEY] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Job> }) => {
      const response = await api.patch(`/jobs/${id}/`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [JOBS_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [JOBS_KEY] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/jobs/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOBS_KEY] });
    },
  });
};

export const useApplyJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: { cover_letter: string; resume?: File } }) => {
      const formData = new FormData();
      formData.append('cover_letter', data.cover_letter);
      if (data.resume) {
        formData.append('resume', data.resume);
      }
      
      const response = await api.post(`/jobs/${jobId}/apply/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [JOBS_KEY] });
    },
  });
};

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Application>>('/jobs/applications/');
      console.log('Response data:', JSON.stringify(response.data))
      return response.data;
    },
  });
};

export const useJobApplications = (jobId?: number) => {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      const url = jobId ? `/jobs/applications/?job=${jobId}/` : `/jobs/applications/`;
      const response = await api.get<PaginatedResponse<Application>>(url);
      return response.data;
    },
    // Sin "enabled" — siempre corre
  });
};