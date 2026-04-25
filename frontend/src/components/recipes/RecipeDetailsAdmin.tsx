import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { ConfirmModal } from "../ui/ConfirmModal";
import { Recipe, Chef } from "../../types";
import { useAuthStore } from "../../store/authStore";
import {
  useToggleLike,
  useToggleBookmark,
  useRecipe,
} from "../../hooks/useRecipes";
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from "../../hooks/useComments";

interface RecipeDetailModalProps {
  recipe?: Recipe;
  recipeId?: string;
  chef?: Chef;
  isOpen: boolean;
  onClose: () => void;
  onLikeToggle?: () => void;
  onBookmarkToggle?: () => void;
}

export function RecipeDetailAdminModal({
  recipe: propRecipe,
  recipeId,
  chef: propChef,
  isOpen,
  onClose,
  onLikeToggle,
  onBookmarkToggle,
}: RecipeDetailModalProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [showFullInstructions, setShowFullInstructions] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);

  // Fetch recipe data if only recipeId is provided
  const { data: fetchedRecipeData, isLoading: recipeLoading } = useRecipe(
    isOpen && !propRecipe && recipeId ? recipeId : "",
  );

  // Use provided recipe or fetched recipe
  const recipe = propRecipe || fetchedRecipeData?.recipe;
  const chef = propChef || recipe?.chefId;

  // Only fetch comments when recipe id exists and modal is open
  const recipeIdToUse = recipe?._id || recipe?.id || recipeId;
  const {
    data: commentsData,
    refetch: refetchComments,
    isLoading: commentsLoading,
  } = useComments(isOpen && recipeIdToUse ? recipeIdToUse : "");

  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateComment();
  const { mutate: updateComment } = useUpdateComment();
  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: toggleLike, isPending: isLiking } = useToggleLike();
  const { mutate: toggleBookmark, isPending: isBookmarking } =
    useToggleBookmark();

  const comments = commentsData?.comments || [];
  const totalTime = (recipe?.prepTime || 0) + (recipe?.cookTime || 0);
  const isLiked = recipe?.isLiked || false;
  const isBookmarked = recipe?.isBookmarked || false;
  const likesCount = recipe?.likesCount || 0;

  useEffect(() => {
    if (isOpen && recipeIdToUse) {
      refetchComments();
    }
  }, [isOpen, recipeIdToUse, refetchComments]);

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
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Recipe Not Found"
        size="xl"
      >
        <div className="text-center py-12">
          <p className="text-gray-600">Recipe not found or has been removed.</p>
        </div>
      </Modal>
    );
  }

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.info("Please login to like recipes");
      navigate("/login");
      return;
    }
    toggleLike(recipeIdToUse, {
      onSuccess: () => {
        onLikeToggle?.();
      },
    });
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.info("Please login to bookmark recipes");
      navigate("/login");
      return;
    }
    toggleBookmark(recipeIdToUse, {
      onSuccess: () => {
        onBookmarkToggle?.();
      },
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Please login to comment");
      navigate("/login");
      return;
    }
    if (!newComment.trim()) return;

    createComment(
      { recipeId: recipeIdToUse, content: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          refetchComments();
        },
      },
    );
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment(commentId, {
      onSuccess: () => {
        setDeleteCommentId(null);
        refetchComments();
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
          setEditContent("");
          refetchComments();
        },
      },
    );
  };

  const shareRecipe = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this amazing recipe: ${recipe.title}`;
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      default:
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                e.currentTarget.src =
                  "https://via.placeholder.com/800x600?text=No+Image";
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
                    src={
                      chefAvatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(chefName || "Chef")}&background=f97316&color=fff`
                    }
                    alt={chefName || "Chef"}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chefName || "Chef")}&background=f97316&color=fff`;
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {chefName || "Chef"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chefSpecialty || "Chef"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {/* <div className="flex flex-wrap gap-2">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isLiked
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:opacity-50`}
                title="Like recipe"
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm font-medium">{likesCount}</span>
              </button>

              <button
                onClick={handleBookmark}
                disabled={isBookmarking}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked
                    ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } disabled:opacity-50`}
                title="Bookmark recipe"
              >
                <BookmarkIcon
                  className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                />
              </button>

              <div className="flex gap-1">
                <button
                  onClick={() => shareRecipe("facebook")}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Share on Facebook"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => shareRecipe("twitter")}
                  className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  title="Share on Twitter"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => shareRecipe("whatsapp")}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div> */}
          </div>

          <p className="text-gray-700">{recipe.description}</p>

          {/* Recipe Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
                      </span>{" "}
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
              <h3 className="text-xl font-bold">
                Comments ({comments.length})
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    isAuthenticated ? "Add a comment..." : "Login to comment..."
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={!isAuthenticated}
                />
                <button
                  type="submit"
                  disabled={
                    !isAuthenticated || !newComment.trim() || isCreatingComment
                  }
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 mt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Login or sign up
                  </button>{" "}
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
                          <p className="font-medium text-sm">
                            {comment.userName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {isAuthenticated &&
                          user?._id === comment.userId &&
                          editingCommentId !== comment.id && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingCommentId(
                                    comment._id || comment.id,
                                  );
                                  setEditContent(comment.content);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteCommentId(comment._id || comment.id)
                                }
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
                                setEditContent("");
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300 rounded"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateComment(comment._id || comment.id)
                              }
                              className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-orange-600 hover:bg-orange-700 rounded"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 text-sm">
                          {comment.content}
                        </p>
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
