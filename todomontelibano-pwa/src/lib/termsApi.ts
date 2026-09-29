import { api } from './api';
import { TERMS_VERSION } from '../content/legal';

export const acceptCurrentTerms = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;
  const response = await api.post('/auth/accept-terms/', { terms_version: TERMS_VERSION });
  return response.data;
};
