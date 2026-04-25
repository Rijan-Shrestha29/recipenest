import { useEffect, useState } from 'react';
import { Shield, Users, ChefHat, FileText, MessageSquare, LogOut, AlertTriangle, Check, X, Clock, Eye, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { SuspensionReasonDialog } from '../../components/ui/SuspensionReasonDialog';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/adminService';
import { RecipeDetailModal } from '../../components/recipes/RecipeDetailModal';
import { useNavigate } from 'react-router-dom';
import { RecipeDetailAdminModal } from '../recipes/RecipeDetailsAdmin';

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { user: admin, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'chefs' | 'users' | 'recipes' | 'comments'>('pending');
  
  // Data states
  const [pendingRecipes, setPendingRecipes] = useState<any[]>([]);
  const [allRecipes, setAllRecipes] = useState<any[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');
  
  // Suspension dialog states
  const [showSuspensionDialog, setShowSuspensionDialog] = useState(false);
  const [suspensionTarget, setSuspensionTarget] = useState<{ id: string; name: string; type: 'Chef' | 'User' } | null>(null);
  
  // Loading
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    if (!admin || admin.role !== 'superadmin') {
      navigate('/login');
      return;
    }
    loadData();
  }, [admin, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRecipesRes, chefsRes, usersRes, commentsRes] = await Promise.all([
        adminService.getPendingRecipes(),
        adminService.getAllRecipes(),
        adminService.getAllUsers(),
        adminService.getAllUsers(),
        adminService.getAllComments()
      ]);
      
      // Handle different response structures
      setPendingRecipes(pendingRes.recipes || pendingRes || []);
      setAllRecipes(allRecipesRes.recipes || allRecipesRes || []);
      setChefs((chefsRes.users || chefsRes || []).filter((u: any) => u.role === 'chef'));
      setUsers((usersRes.users || usersRes || []).filter((u: any) => u.role === 'foodlover'));
      setComments(commentsRes.comments || commentsRes || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleApproveRecipe = async (recipeId: string) => {
    try {
      await adminService.approveRecipe(recipeId);
      toast.success('Recipe approved successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve recipe');
    }
  };

  const handleRejectRecipe = async (recipeId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await adminService.rejectRecipe(recipeId, reason);
      toast.success('Recipe rejected');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject recipe');
    }
  };

  const handleDeleteRecipe = (recipeId: string, title: string) => {
    setConfirmTitle('Delete Recipe');
    setConfirmMessage(`Are you sure you want to permanently delete "${title}"? This action cannot be undone.`);
    setConfirmAction(() => async () => {
      try {
        await adminService.deleteRecipe(recipeId);
        toast.success('Recipe deleted successfully');
        loadData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete recipe');
      }
    });
    setShowConfirmModal(true);
  };

  const handleSuspendUser = (userId: string, name: string, type: 'Chef' | 'User') => {
    setSuspensionTarget({ id: userId, name, type });
    setShowSuspensionDialog(true);
  };

  const handleUnsuspendUser = async (userId: string, name: string) => {
    try {
      await adminService.unsuspendUser(userId);
      toast.success(`${name} has been unsuspended`);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unsuspend user');
    }
  };

  const handleDeleteComment = (commentId: string, content: string) => {
    setConfirmTitle('Delete Comment');
    setConfirmMessage(`Are you sure you want to delete this comment? "${content.substring(0, 50)}..."`);
    setConfirmAction(() => async () => {
      try {
        await adminService.deleteComment(commentId);
        toast.success('Comment deleted successfully');
        loadData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete comment');
      }
    });
    setShowConfirmModal(true);
  };

  const openViewModal = (recipe: any) => {
    setSelectedRecipe(recipe);
    setIsViewModalOpen(true);
  };

  const getChefName = (chef: any) => {
    if (!chef) return 'Unknown Chef';
    if (typeof chef === 'object') return chef.name || chef.displayName || 'Unknown Chef';
    return 'Unknown Chef';
  };

  const getChefAvatar = (chef: any) => {
    if (!chef) return null;
    if (typeof chef === 'object') return chef.avatar || chef.profileImage;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/download.png" alt="RecipeNest Logo" className="w-[64px] h-[64px]" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-600">RecipeNest Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-600">{admin.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Recipes</p>
                <p className="text-2xl font-bold text-orange-600">{pendingRecipes.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Chefs</p>
                <p className="text-2xl font-bold text-blue-600">{chefs.length}</p>
              </div>
              <ChefHat className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-green-600">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recipes</p>
                <p className="text-2xl font-bold text-purple-600">{allRecipes.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-pink-600">{comments.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-1 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'pending' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pending Approvals ({pendingRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab('chefs')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'chefs' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Chefs ({chefs.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'users' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'recipes' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Recipes ({allRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'comments' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Comments ({comments.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Pending Recipes Tab */}
          {activeTab === 'pending' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Pending Recipe Approvals</h2>
              {pendingRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No pending recipes to review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRecipes.map((recipe) => {
                    const recipeId = recipe._id || recipe.id;
                    const chefInfo = recipe.chefId;
                    return (
                      <div key={recipeId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-4">
                          <img 
                            src={recipe.image} 
                            alt={recipe.title} 
                            className="w-32 h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/128x128?text=No+Image';
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <div>
                                <h3 className="font-bold text-lg">{recipe.title}</h3>
                                <p className="text-gray-600 text-sm mt-1 max-w-2xl">{recipe.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openViewModal(recipe)}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleApproveRecipe(recipeId)}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectRecipe(recipeId)}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <ChefHat className="w-4 h-4" />
                                Chef: {getChefName(chefInfo)}
                              </span>
                              <span>{recipe.category}</span>
                              <span>{recipe.difficulty}</span>
                              <span>{recipe.prepTime + recipe.cookTime} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Chefs Tab */}
          {activeTab === 'chefs' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Chef Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Chef</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Specialty</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chefs.map((chef) => {
                      const chefId = chef._id || chef.id;
                      return (
                        <tr key={chefId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={chef.avatar || chef.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(chef.name)}`}
                                alt={chef.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="font-medium">{chef.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{chef.email}</td>
                          <td className="py-3 px-4">{chef.specialty || 'N/A'}</td>
                          <td className="py-3 px-4">
                            {chef.isSuspended ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Suspended</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {chef.isSuspended ? (
                              <button
                                onClick={() => handleUnsuspendUser(chefId, chef.name)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(chefId, chef.name, 'Chef')}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                              >
                                Suspend
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Joined</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const userId = user._id || user.id;
                      return (
                        <tr key={userId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            {user.isSuspended ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Suspended</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {user.isSuspended ? (
                              <button
                                onClick={() => handleUnsuspendUser(userId, user.name)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspendUser(userId, user.name, 'User')}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                              >
                                Suspend
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All Recipes Tab */}
          {activeTab === 'recipes' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">All Recipes</h2>
              <div className="space-y-4">
                {allRecipes.map((recipe) => {
                  const recipeId = recipe._id || recipe.id;
                  const chefInfo = recipe.chefId;
                  return (
                    <div key={recipeId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">
                        <img 
                          src={recipe.image} 
                          alt={recipe.title} 
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/96x96?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg">{recipe.title}</h3>
                                {recipe.approvalStatus === 'approved' && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Approved</span>
                                )}
                                {recipe.approvalStatus === 'pending' && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">Pending</span>
                                )}
                                {recipe.approvalStatus === 'rejected' && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">Rejected</span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mt-1">{recipe.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openViewModal(recipe)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteRecipe(recipeId, recipe.title)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <ChefHat className="w-4 h-4" />
                              Chef: {getChefName(chefInfo)}
                            </span>
                            <span>{recipe.category}</span>
                            <span>{recipe.difficulty}</span>
                            <span>{recipe.prepTime + recipe.cookTime} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Comment Moderation</h2>
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No comments to moderate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => {
                    const commentId = comment._id || comment.id;
                    return (
                      <div key={commentId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <img
                            src={comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}`}
                            alt={comment.userName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <div>
                                <p className="font-medium">{comment.userName}</p>
                                <p className="text-sm text-gray-500">on {comment.recipeTitle || 'a recipe'}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteComment(commentId, comment.content)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-1"
                              >
                                <X className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                            <p className="text-gray-700 mt-2">{comment.content}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(comment.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recipe View Modal */}
      {selectedRecipe && (
        <RecipeDetailAdminModal
          recipe={selectedRecipe}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRecipe(null);
          }}
          onLikeToggle={() => {}}
          onBookmarkToggle={() => {}}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={async () => {
          if (confirmAction) {
            await confirmAction();
          }
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Suspension Reason Dialog */}
      <SuspensionReasonDialog
        isOpen={showSuspensionDialog}
        userName={suspensionTarget?.name || ''}
        userType={suspensionTarget?.type || 'User'}
        onConfirm={async (reason) => {
          if (suspensionTarget) {
            try {
              await adminService.suspendUser(suspensionTarget.id, reason);
              toast.success(`${suspensionTarget.name} has been suspended`);
              loadData();
            } catch (error: any) {
              toast.error(error.response?.data?.message || 'Failed to suspend user');
            }
          }
          setShowSuspensionDialog(false);
          setSuspensionTarget(null);
        }}
        onClose={() => {
          setShowSuspensionDialog(false);
          setSuspensionTarget(null);
        }}
      />
    </div>
  );
}