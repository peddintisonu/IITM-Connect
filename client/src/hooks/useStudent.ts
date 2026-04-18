import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/student.service';
import type { UpdateProfilePayload, UpdateHostelPayload, UpdatePrivacyPayload } from '../types/student.types';

export const useProfileQuery = (username: string) => {
  return useQuery({
    queryKey: ['studentProfile', username],
    queryFn: () => studentService.getProfile(username),
    enabled: !!username,
  });
};

export const useUsernameCheck = (username: string) => {
  return useQuery({
    queryKey: ['usernameCheck', username],
    queryFn: () => studentService.checkUsername(username),
    enabled: username.length >= 3,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => studentService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAuthUser'] });
    },
  });
};

export const useUpdateProfilePhotoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => studentService.updateProfilePhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAuthUser'] });
    },
  });
};

export const useUpdateCoverPhotoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => studentService.updateCoverPhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAuthUser'] });
    },
  });
};

export const useUpdateHostelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateHostelPayload) => studentService.updateHostel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAuthUser'] });
    },
  });
};

export const useUpdatePrivacyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePrivacyPayload) => studentService.updatePrivacy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentAuthUser'] });
    },
  });
};
