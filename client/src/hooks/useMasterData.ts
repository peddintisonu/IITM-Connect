import { useQuery } from '@tanstack/react-query';
import * as masterDataService from '../services/masterData.service';

export const useMasterDataBootstrap = () => {
  return useQuery({
    queryKey: ['master-data', 'bootstrap'],
    queryFn: masterDataService.getMasterDataBootstrap,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useHostels = () => {
  return useQuery({
    queryKey: ['master-data', 'hostels'],
    queryFn: masterDataService.getHostels,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: ['master-data', 'departments'],
    queryFn: masterDataService.getDepartments,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCourses = () => {
  return useQuery({
    queryKey: ['master-data', 'courses'],
    queryFn: masterDataService.getCourses,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
