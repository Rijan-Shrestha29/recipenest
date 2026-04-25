import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Clock,
  Users,
  ChefHat,
  Share2,
  Heart,
  Bookmark as BookmarkIcon,
  MessageCircle,
  Send,
  Pencil,
  Trash2,
  X,
  Check,
  Eye,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { Recipe, Chef } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToggleLike, useToggleBookmark, useRecipe } from '../../hooks/useRecipes';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '../../hooks/useComments';

interface RecipeDetailModalProps {
  recipe?: Recipe;
  recipeId?: string;
  chef?: Chef;
  isOpen: boolean;
  onClose: () => void;
  onLikeToggle?: () => void;
  onBookmarkToggle?: () => void;
}

export function RecipeDetailModal({
  recipe: propRecipe,
  recipeId: propRecipeId,
  chef: propChef,
  isOpen,
  onClose,
  onLikeToggle,
  onBookmarkToggle,
}: RecipeDetailModalProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [showFullInstructions, setShowFullInstructions] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Local state for optimistic updates
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(0);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(false);

  // Get the actual recipe ID
  const actualRecipeId = propRecipe?._id || propRecipe?.id || propRecipeId;
  
  // Fetch recipe data
  const { 
    data: fetchedRecipeData, 
    isLoading: recipeLoading,
    refetch: refetchRecipe
  } = useRecipe(isOpen && actualRecipeId ? actualRecipeId : '');

  // Use provided recipe or fetched recipe
  const recipe = propRecipe || fetchedRecipeData?.recipe;
  const chef = propChef || recipe?.chefId;
  const recipeIdToUse = recipe?._id || recipe?.id || actualRecipeId;

  // Sync local state with fetched data
  useEffect(() => {
    if (recipe) {
      setLocalIsLiked(recipe.isLiked || false);
      setLocalLikesCount(recipe.likesCount || 0);
      setLocalIsBookmarked(recipe.isBookmarked || false);
    }
  }, [recipe]);

  // Fetch comments
  const { 
    data: commentsData, 
    refetch: refetchComments, 
    isLoading: commentsLoading 
  } = useComments(isOpen && recipeIdToUse ? recipeIdToUse : '');
  
  const { mutate: createComment, isPending: isCreatingComment } = useCreateComment();
  const { mutate: updateComment } = useUpdateComment();
  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: toggleLike, isPending: isLiking } = useToggleLike();
  const { mutate: toggleBookmark, isPending: isBookmarking } = useToggleBookmark();

  const comments = commentsData?.comments || [];
  const totalTime = (recipe?.prepTime || 0) + (recipe?.cookTime || 0);

  // Refetch data when modal opens
  useEffect(() => {
    if (isOpen && recipeIdToUse) {
      refetchRecipe();
      refetchComments();
    }
  }, [isOpen, recipeIdToUse, refetchRecipe, refetchComments]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowShareMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  if (recipeLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading..." size="xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipe details...</p>
          </div>
        </div>
      </Modal>
    );
  }

  if (!recipe) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Recipe Not Found" size="xl">
        <div className="text-center py-12">
          <p className="text-gray-600">Recipe not found or has been removed.</p>
        </div>
      </Modal>
    );
  }

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.info('Please login to like recipes');
      navigate('/login');
      return;
    }
    
    // Optimistic update
    const newLikedState = !localIsLiked;
    const newLikesCount = newLikedState ? localLikesCount + 1 : localLikesCount - 1;
    setLocalIsLiked(newLikedState);
    setLocalLikesCount(newLikesCount);
    
    toggleLike(recipeIdToUse, {
      onSuccess: (data) => {
        // Update with actual server data
        setLocalIsLiked(data.liked);
        setLocalLikesCount(data.likesCount);
        refetchRecipe();
        onLikeToggle?.();
      },
      onError: (error) => {
        // Revert optimistic update on error
        setLocalIsLiked(!newLikedState);
        setLocalLikesCount(localLikesCount);
        console.error('Like error:', error);
      },
    });
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.info('Please login to bookmark recipes');
      navigate('/login');
      return;
    }
    
    // Optimistic update
    const newBookmarkedState = !localIsBookmarked;
    setLocalIsBookmarked(newBookmarkedState);
    
    toggleBookmark(recipeIdToUse, {
      onSuccess: (data) => {
        // Update with actual server data
        setLocalIsBookmarked(data.bookmarked);
        refetchRecipe();
        onBookmarkToggle?.();
      },
      onError: (error) => {
        // Revert optimistic update on error
        setLocalIsBookmarked(!newBookmarkedState);
        console.error('Bookmark error:', error);
      },
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please login to comment');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) return;

    createComment(
      { recipeId: recipeIdToUse, content: newComment },
      {
        onSuccess: () => {
          setNewComment('');
          refetchComments();
          refetchRecipe();
        },
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId, {
      onSuccess: () => {
        setDeleteCommentId(null);
        refetchComments();
        refetchRecipe();
      },
    });
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editContent.trim()) return;
    updateComment(
      { commentId, content: editContent },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditContent('');
          refetchComments();
        },
      }
    );
  };

  const shareRecipe = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this amazing recipe: ${recipe.title}`;
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Recipe link copied to clipboard!');
        setShowShareMenu(false);
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const chefName = chef?.name || recipe.chefName;
  const chefAvatar = chef?.profileImage || chef?.avatar || recipe.chefAvatar;
  const chefSpecialty = chef?.specialty;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={recipe.title} size="xl">
        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x600?text=No+Image';
              }}
            />
          </div>

          {/* Recipe Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}
                >
                  {recipe.difficulty}
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  {recipe.category}
                </span>
              </div>

              {(chefName || chef) && (
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={chefAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chefName || 'Chef')}&background=f97316&color=fff`}
                    alt={chefName || 'Chef'}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chefName || 'Chef')}&background=f97316&color=fff`;
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{chefName || 'Chef'}</p>
                    <p className="text-xs text-gray-500">{chefSpecialty || 'Chef'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons with Real-time States */}
            <div className="flex flex-wrap gap-2">
              {/* Like Button - Changes color and count in real-time */}
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  localIsLiked
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50`}
                title={localIsLiked ? 'Unlike recipe' : 'Like recipe'}
              >
                <Heart className={`w-4 h-4 transition-all ${localIsLiked ? 'fill-white' : ''}`} />
                <span className="text-sm font-medium">{localLikesCount}</span>
              </button>

              {/* Bookmark Button - Changes color in real-time */}
              <button
                onClick={handleBookmark}
                disabled={isBookmarking}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  localIsBookmarked
                    ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } disabled:opacity-50`}
                title={localIsBookmarked ? 'Remove bookmark' : 'Bookmark recipe'}
              >
                <BookmarkIcon className={`w-4 h-4 transition-all ${localIsBookmarked ? 'fill-white' : ''}`} />
              </button>

              {/* Share Button with Dropdown Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareMenu(!showShareMenu);
                  }}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Share recipe"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Share Dropdown Menu */}
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => shareRecipe('facebook')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                        Share on Facebook
                      </button>
                      <button
                        onClick={() => shareRecipe('twitter')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                      >
                        <Twitter className="w-4 h-4 text-sky-500" />
                        Share on Twitter
                      </button>
                      <button
                        onClick={() => shareRecipe('linkedin')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-blue-700" />
                        Share on LinkedIn
                      </button>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={() => shareRecipe('copy')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700">{recipe.description}</p>

          {/* Recipe Stats */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Clock className="w-6 h-6 mx-auto mb-1 text-orange-600" />
              <p className="text-sm text-gray-600">Total Time</p>
              <p className="font-semibold">{totalTime} min</p>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 mx-auto mb-1 text-orange-600" />
              <p className="text-sm text-gray-600">Servings</p>
              <p className="font-semibold">{recipe.servings}</p>
            </div>
            <div className="text-center">
              <ChefHat className="w-6 h-6 mx-auto mb-1 text-orange-600" />
              <p className="text-sm text-gray-600">Prep Time</p>
              <p className="font-semibold">{recipe.prepTime} min</p>
            </div>
            <div className="text-center">
              <Eye className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="text-sm text-gray-600">Views</p>
              <p className="font-semibold">{recipe.views || 0}</p>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-xl font-bold mb-4">Ingredients</h3>
            <div className="bg-orange-50 rounded-lg p-4">
              <ul className="space-y-2">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">
                      <span className="font-medium">
                        {ingredient.quantity} {ingredient.unit}
                      </span>{' '}
                      {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Instructions</h3>
              {recipe.instructions?.length > 5 && !showFullInstructions && (
                <button
                  onClick={() => setShowFullInstructions(true)}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Read More
                </button>
              )}
            </div>
            <ol className="space-y-4">
              {(showFullInstructions
                ? recipe.instructions
                : recipe.instructions?.slice(0, 5) || []
              ).map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xl font-bold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {recipe.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-xl font-bold">Comments ({comments.length})</h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isAuthenticated ? 'Add a comment...' : 'Login to comment...'}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={!isAuthenticated}
                />
                <button
                  type="submit"
                  disabled={!isAuthenticated || !newComment.trim() || isCreatingComment}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 mt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Login or sign up
                  </button>{' '}
                  to leave a comment
                </p>
              )}
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {commentsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment: any) => (
                  <div
                    key={comment._id || comment.id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg group"
                  >
                    <img
                      src={
                        comment.userAvatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}`
                      }
                      alt={comment.userName}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}`;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{comment.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {isAuthenticated && user?._id === comment.userId && editingCommentId !== comment._id && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment._id || comment.id);
                                setEditContent(comment.content);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setDeleteCommentId(comment._id || comment.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingCommentId === (comment._id || comment.id) ? (
                        <div className="mt-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditContent('');
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateComment(comment._id || comment.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-orange-600 hover:bg-orange-700 rounded"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteCommentId !== null}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={() => {
          if (deleteCommentId) {
            handleDeleteComment(deleteCommentId);
          }
        }}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}