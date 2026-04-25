import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/commentService';
import { toast } from 'sonner';

export const useComments = (recipeId: string) => {
  return useQuery({
    queryKey: ['comments', recipeId],
    queryFn: () => commentService.getCommentsByRecipe(recipeId),
    enabled: !!recipeId, // Only run query if recipeId exists
  });
};

// Rest of the hooks remain the same...
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipeId, content }: { recipeId: string; content: string }) =>
      commentService.createComment(recipeId, content),
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', recipeId] });
      queryClient.invalidateQueries({ queryKey: ['recipe', recipeId] });
      toast.success('Comment added!');
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast.error('Please login to comment');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add comment');
      }
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentService.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment updated!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Comment deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    },
  });
};