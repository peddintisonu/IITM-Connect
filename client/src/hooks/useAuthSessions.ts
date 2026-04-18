import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';

export const useSessionsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['authSessions'],
    queryFn: () => authService.getSessions(),
    enabled,
  });
};

export const useRevokeSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authSessions'] });
    },
  });
};

export const useLogoutAllMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authSessions'] });
    },
  });
};
