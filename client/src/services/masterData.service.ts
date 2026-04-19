import { api } from './api';
import type { IHostel, IDepartment, ICourse } from '../types/student.types';

export interface BootstrapData {
  hostels: IHostel[];
  departments: IDepartment[];
  courses: ICourse[];
}

export const getMasterDataBootstrap = async (): Promise<BootstrapData> => {
  const response = await api.get('/api/v1/master-data/bootstrap');
  return response.data.data;
};

export const getHostels = async (): Promise<IHostel[]> => {
  const response = await api.get('/api/v1/master-data/hostels');
  return response.data.data;
};

export const getDepartments = async (): Promise<IDepartment[]> => {
  const response = await api.get('/api/v1/master-data/departments');
  return response.data.data;
};

export const getCourses = async (): Promise<ICourse[]> => {
  const response = await api.get('/api/v1/master-data/courses');
  return response.data.data;
};
