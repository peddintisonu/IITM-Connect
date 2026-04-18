import { api } from './api';
import type { IStudent, UpdateProfilePayload, UpdateHostelPayload, UpdatePrivacyPayload, OnboardingPayload } from '../types/student.types';

export const studentService = {
  getMe: async (): Promise<IStudent> => {
    const res = await api.get('/api/v1/students/me');
    return res.data.data;
  },

  onboard: async (data: OnboardingPayload): Promise<IStudent> => {
    const res = await api.patch('/api/v1/students/onboarding', data);
    return res.data.data;
  },

  checkUsername: async (username: string): Promise<{ username: string; available: boolean }> => {
    const res = await api.get(`/api/v1/students/username-availability?username=${username}`);
    return res.data.data;
  },

  getProfile: async (username: string): Promise<IStudent> => {
    const res = await api.get(`/api/v1/students/${username}`);
    return res.data.data;
  },

  updateProfile: async (data: UpdateProfilePayload): Promise<IStudent> => {
    const res = await api.patch('/api/v1/students/me/profile', data);
    return res.data.data;
  },

  updateProfilePhoto: async (file: File): Promise<IStudent> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.patch('/api/v1/students/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  updateCoverPhoto: async (file: File): Promise<IStudent> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.patch('/api/v1/students/me/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  updateHostel: async (data: UpdateHostelPayload): Promise<IStudent> => {
    const res = await api.patch('/api/v1/students/me/hostel', data);
    return res.data.data;
  },

  updatePrivacy: async (data: UpdatePrivacyPayload): Promise<IStudent> => {
    const res = await api.patch('/api/v1/students/me/privacy', data);
    return res.data.data;
  },
};
