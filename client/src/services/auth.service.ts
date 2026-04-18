import { api } from './api';
import type { ISession } from '../types/session.types';

export const authService = {
  refreshToken: async () => {
    const res = await api.get('/api/v1/auth/refresh');
    return res.data;
  },

  logout: async () => {
    const res = await api.get('/api/v1/auth/logout');
    return res.data;
  },

  logoutAll: async () => {
    const res = await api.post('/api/v1/auth/logout-all');
    return res.data;
  },

  getSessions: async (): Promise<{ sessions: ISession[]; currentSessionId: string }> => {
    const res = await api.get('/api/v1/auth/sessions');
    return res.data.data;
  },

  revokeSession: async (sessionId: string) => {
    const res = await api.post(`/api/v1/auth/sessions/${sessionId}/logout`);
    return res.data;
  },
};
