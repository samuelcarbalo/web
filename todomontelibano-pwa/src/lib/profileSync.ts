import type { Profile } from '../types';
import { useAuthStore } from '../store/authStore';
import { normalizeBirthDateForInput } from './apiErrors';

export function mergeProfileFromApi(
  previous: Profile | undefined,
  patch: Partial<Profile>,
): Profile {
  if (!previous) {
    return patch as Profile;
  }
  return { ...previous, ...patch };
}

/** Aplica en Zustand los datos devueltos por PATCH /profiles/{id}/ */
export function syncProfileToAuthStore(profile: Profile): void {
  const fullName = (profile.user_name || '').trim();
  const parts = fullName.split(/\s+/).filter(Boolean);

  useAuthStore.getState().updateUser({
    name: fullName || undefined,
    first_name: parts[0] ?? '',
    last_name: parts.slice(1).join(' '),
    bio: profile.bio || undefined,
    location: profile.location || undefined,
    job_title: profile.job_title || undefined,
    completion_percentage: profile.completion_percentage,
    avatar: profile.avatar,
  });
}

export function profileToFormData(profile: Profile) {
  return {
    user_name: profile.user_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    department: profile.department || '',
    job_title: profile.job_title || '',
    birth_date: normalizeBirthDateForInput(profile.birth_date),
  };
}
