import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeService } from '../services/recipeService';
import { likeService } from '../services/likeService';
import { bookmarkService } from '../services/bookmarkService';
import { toast } from 'sonner';

export const useRecipes = (params?: {
  search?: string;
  category?: string;
  difficulty?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['recipes', params],
    queryFn: () => recipeService.getRecipes(params),
  });
};

export const useTrendingRecipes = () => {
  return useQuery({
    queryKey: ['trending-recipes'],
    queryFn: () => recipeService.getTrendingRecipes(),
  });
};

export const useRecipeCategories = () => {
  return useQuery({
    queryKey: ['recipe-categories'],
    queryFn: () => recipeService.getRecipeCategories(),
  });
};

export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipeService.getRecipeById(id),
    enabled: !!id && id !== '',
    staleTime: 0, // Always fetch fresh data to update view count
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) => likeService.toggleLike(recipeId),
    onSuccess: (data, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success(data.liked ? 'Recipe liked!' : 'Like removed');
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast.error('Please login to like recipes');
      } else {
        toast.error(error.response?.data?.message || 'Failed to toggle like');
      }
    },
  });
};

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipeId: string) => bookmarkService.toggleBookmark(recipeId),
    onSuccess: (data, recipeId) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success(data.bookmarked ? 'Recipe bookmarked!' : 'Bookmark removed');
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast.error('Please login to bookmark recipes');
      } else {
        toast.error(error.response?.data?.message || 'Failed to toggle bookmark');
      }
    },
  });
};