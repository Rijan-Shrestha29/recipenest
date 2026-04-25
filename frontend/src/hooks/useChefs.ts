import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

export const useChefs = () => {
  return useQuery({
    queryKey: ['chefs'],
    queryFn: () => userService.getAllChefs(),
  });
};

export const useChef = (id: string) => {
  return useQuery({
    queryKey: ['chef', id],
    queryFn: () => userService.getChefById(id),
    enabled: !!id,
  });
};