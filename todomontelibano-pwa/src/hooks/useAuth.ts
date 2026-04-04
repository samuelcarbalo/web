import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials, RegisterData, User, Profile } from '../types';
import { useNavigate } from 'react-router-dom';

// Hook para obtener el perfil completo
export const useMe = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        // Llama a /auth/me/ que retorna el Profile completo
        const response = await api.get<Profile>('/auth/me/');
        const profile = response.data;
        
        // Convierte Profile a User para el store
        const user: User = {
          id: profile.user,
          email: profile.user_email,
          first_name: profile.user_name.split(' ')[0] || '',
          last_name: profile.user_name.split(' ').slice(1).join(' ') || '',
          name: profile.user_name,
          phone: profile.phone,
          organization: profile.organization,
          organization_name: profile.organization_name,
          role: profile.role as "user" | "manager" | "admin",
          user_type: 'person', // Esto también
          avatar: profile.avatar,
          bio: profile.bio || undefined,
          location: profile.location || undefined,
          job_title: profile.job_title || undefined,
          completion_percentage: profile.completion_percentage,
        };
        console.log(user.role)
        
        // Actualiza store solo si hay token
        const token = localStorage.getItem('access_token');
        if (token) {
          setAuth(user, { 
            access: token, 
            refresh: localStorage.getItem('refresh_token') || '' 
          });
        }
        
        return profile; // Retorna el profile completo
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log('Usuario no autenticado');
          setLoading(false);
          return null;
        }
        console.error('Error en useMe:', error);
        setLoading(false);
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener el perfil (alternativa más específica)
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<Profile>('/profiles/me/');
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para actualizar el perfil
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      // Obtenemos el perfil cacheado para sacar su id
      const profile = queryClient.getQueryData<Profile>(['profile']);
      const profileId = profile?.id; // el id del perfil extendido: 2d7e3e55-...
      
      const response = await api.patch(`/profiles/${profileId}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      credentials.organization_slug = "conectando-empleo"
      const response = await api.post('/auth/login/', credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Después de login, fetch el perfil completo
      const profileRes = await api.get<Profile>('/profiles/me/');
      const profile = profileRes.data;
      const userRes = await api.get<User>('/auth/me/');
      const user_res = userRes.data;
      
      const user: User = {
        id: profile.user,
        email: profile.user_email,
        first_name: profile.user_name.split(' ')[0] || '',
        last_name: profile.user_name.split(' ').slice(1).join(' ') || '',
        name: profile.user_name,
        organization: profile.organization,
        organization_name: profile.organization_name,
        role: user_res.role || 'user',
        user_type: user_res.user_type || 'person',
        avatar: profile.avatar,
        bio: profile.bio || undefined,
        location: profile.location || undefined,
        job_title: profile.job_title || undefined,
        completion_percentage: profile.completion_percentage,
      };
      
      setAuth(user, { access: data.access, refresh: data.refresh });
      queryClient.setQueryData(['me'], profile);
      navigate('/dashboard');
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      data.organization_name = "conectando-empleo"
      const response = await api.post('/auth/register/', data);
      return response.data;
    },
    onSuccess: async (data) => {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Fetch perfil después de registro
      const profileRes = await api.get<Profile>('/profiles/me/');
      const profile = profileRes.data;
      
      const user: User = {
        id: profile.user,
        email: profile.user_email,
        first_name: profile.user_name.split(' ')[0] || '',
        last_name: profile.user_name.split(' ').slice(1).join(' ') || '',
        name: profile.user_name,
        organization: profile.organization,
        organization_name: profile.organization_name,
        role: 'user',
        user_type: data.user.user_type || 'person',
        avatar: profile.avatar,
        completion_percentage: profile.completion_percentage,
      };
      
      setAuth(user, { access: data.access, refresh: data.refresh });
      queryClient.setQueryData(['me'], profile);
      navigate('/dashboard');
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return () => {
    logout();
    queryClient.clear(); // Limpia todo el caché
    navigate('/login');
  };
};


export const isAdmin = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  return user.role === 'admin';
}

export const isManager = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  return user.role === 'manager';
}

export const isUser = () => {
  const user = useAuthStore((state) => state.user);
  if (!user) return false;
  return user.role === 'user';
}