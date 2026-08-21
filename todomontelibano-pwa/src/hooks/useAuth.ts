import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { clearSession, hasValidSessionHint } from '../lib/session';
import type { LoginCredentials, RegisterData, User, Profile } from '../types';
import { useNavigate } from 'react-router-dom';
import { TENANT_CONFIG } from '../config/tenant';
import { consumeAuthRedirect } from '../lib/authRedirect';

export const useMe = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const logout = useAuthStore((state) => state.logout);
  const tokens = useAuthStore((state) => state.tokens);

  const sessionActive = hasValidSessionHint() || !!tokens?.access;

  return useQuery({
    queryKey: ['me'],
    enabled: sessionActive,
    queryFn: async () => {
      try {
        const token = hasValidSessionHint();
        if (!token) {
          logout();
          return null;
        }

        const userRes = await api.get<any>('/auth/me/');
        const user_res = userRes.data;
        let profile: Partial<Profile> = {};
        try {
          const profileRes = await api.get<Profile>('/profiles/me/');
          profile = profileRes.data;
        } catch {
          /* superusuario de plataforma puede no tener Profile */
        }
        const fullName = profile.user_name || user_res.full_name || user_res.email || '';

        const user: User = {
          id: profile.user || user_res.id,
          email: profile.user_email || user_res.email,
          first_name: user_res.first_name || fullName.split(' ')[0] || '',
          last_name: user_res.last_name || fullName.split(' ').slice(1).join(' ') || '',
          name: fullName,
          phone: profile.phone,
          organization: profile.organization,
          organization_name: profile.organization_name,
          role: user_res.role as 'user' | 'manager' | 'admin',
          is_superuser: !!user_res.is_superuser,
          is_staff: !!user_res.is_staff,
          is_unlimited_credits: !!user_res.is_unlimited_credits,
          user_type: user_res.user_type || 'person',
          avatar: profile.avatar,
          bio: profile.bio || undefined,
          location: profile.location || undefined,
          job_title: profile.job_title || undefined,
          completion_percentage: profile.completion_percentage,
          credits: user_res.credits,
        };

        setAuth(user, {
          access: localStorage.getItem('access_token') || '',
          refresh: localStorage.getItem('refresh_token') || '',
        });

        return profile;
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          clearSession();
          return null;
        }
        // 500 / CORS / red: no tumbar sesión persistida; solo liberar loading en finally
        console.error('Error en useMe:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};
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
      const payload: Record<string, string> = {
        email: credentials.email,
        password: credentials.password,
      };

      const orgSlug = credentials.organization_slug?.trim();
      if (orgSlug) {
        payload.organization_slug = orgSlug;
      } else if (credentials.organization_slug === undefined) {
        // Usuario tenant: slug por defecto del tenant configurado
        payload.organization_slug = TENANT_CONFIG.slug;
      }
      // Si organization_slug es '' explícito → login superusuario (sin enviar el campo)

      const response = await api.post('/auth/login/', payload);
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
        is_superuser: !!user_res.is_superuser,
        is_staff: !!user_res.is_staff,
        is_unlimited_credits: !!user_res.is_unlimited_credits,
        user_type: user_res.user_type || 'person',
        avatar: profile.avatar,
        bio: profile.bio || undefined,
        location: profile.location || undefined,
        job_title: profile.job_title || undefined,
        completion_percentage: profile.completion_percentage,
        credits: user_res.credits,
      };
      
      setAuth(user, { access: data.access, refresh: data.refresh });
      queryClient.setQueryData(['me'], profile);
      navigate(consumeAuthRedirect('/dashboard'), { replace: true });
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      data.organization_name = TENANT_CONFIG.name;
      const response = await api.post('/auth/register/', data);
      return response.data;
    },
    onSuccess: async (data) => {
      const accessToken = data.tokens?.access || data.access;
      const refreshToken = data.tokens?.refresh || data.refresh;
      
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      
      // Fetch perfil y usuario después de registro
      const [profileRes, userRes] = await Promise.all([
        api.get<Profile>('/profiles/me/'),
        api.get<any>('/auth/me/'),
      ]);
      const profile = profileRes.data;
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
        is_superuser: !!user_res.is_superuser,
        is_staff: !!user_res.is_staff,
        is_unlimited_credits: !!user_res.is_unlimited_credits,
        user_type: user_res.user_type || 'person',
        avatar: profile.avatar,
        bio: profile.bio || undefined,
        location: profile.location || undefined,
        job_title: profile.job_title || undefined,
        completion_percentage: profile.completion_percentage,
        credits: user_res.credits,
      };
      
      setAuth(user, { access: accessToken, refresh: refreshToken });
      queryClient.setQueryData(['me'], profile);
      navigate(consumeAuthRedirect('/dashboard'), { replace: true });
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    clearSession();
    logout();
    queryClient.clear();
    navigate('/login', { replace: true });
  };
};


export const isAdmin = () => {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  return user.role === 'admin' || !!user.is_superuser || !!user.is_staff;
}

export const isManager = () => {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  return user.role === 'manager' || user.role === 'admin' || !!user.is_superuser || !!user.is_staff;
}

export const isUser = () => {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  return user.role === 'user' && !user.is_superuser && !user.is_staff;
}

export const isSuperUser = () => {
  const user = useAuthStore((state) => state.user);
  return !!user?.is_superuser;
}

export const isPlatformAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return !!(user?.is_superuser || user?.is_staff);
}