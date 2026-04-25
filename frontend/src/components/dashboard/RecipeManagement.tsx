import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { RecipeForm } from '../../components/recipes/RecipeForm';
import { RecipeFormData } from '../../schemas/recipeSchema';
import { Plus, Edit, Trash2, Eye, Search, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { RecipeDetailModal } from '../../components/recipes/RecipeDetailModal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { recipeService } from '../../services/recipeService';
import { Recipe } from '@/types';
import { RecipeDetailAdminModal } from '../recipes/RecipeDetailsAdmin';

interface RecipeWithStats extends Recipe {
  views?: number;
  likes?: number;
}

export function RecipeManagement() {
  const { user } = useAuthStore();
  const [recipes, setRecipes] = useState<RecipeWithStats[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalViews: 0,
    totalLikes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch chef's recipes using the new endpoint
  const fetchMyRecipes = async () => {
    setIsLoading(true);
    try {
      const response = await recipeService.getMyRecipes();
      
      if (response.success) {
        setRecipes(response.recipes || []);
        setStats({
          pending: response.stats?.pending || 0,
          approved: response.stats?.approved || 0,
          rejected: response.stats?.rejected || 0,
          totalViews: response.stats?.totalViews || 0,
          totalLikes: response.stats?.totalLikes || 0
        });
      } else {
        toast.error(response.message || 'Failed to load recipes');
      }
    } catch (error: any) {
      console.error('Failed to fetch recipes:', error);
      toast.error(error.response?.data?.message || 'Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'chef') {
      fetchMyRecipes();
    }
  }, [user]);

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = !categoryFilter || recipe.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || recipe.approvalStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = Array.from(new Set(recipes.map(r => r.category).filter(Boolean)));

  const handleCreate = async (data: RecipeFormData) => {
    if (!user) return;

    setIsCreating(true);
    try {
      await recipeService.createRecipe(data);
      toast.success('Recipe created successfully! It will be visible after admin approval.');
      setIsCreateModalOpen(false);
      await fetchMyRecipes();
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Failed to create recipe');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (data: RecipeFormData) => {
    if (!selectedRecipe) return;

    setIsUpdating(true);
    try {
      await recipeService.updateRecipe(selectedRecipe.id, data);
      toast.success('Recipe updated successfully!');
      setIsEditModalOpen(false);
      setSelectedRecipe(null);
      await fetchMyRecipes();
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update recipe');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingRecipe(true);
    try {
      await recipeService.deleteRecipe(id);
      toast.success('Recipe deleted successfully!');
      setDeleteRecipeId(null);
      await fetchMyRecipes();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete recipe');
    } finally {
      setDeletingRecipe(false);
    }
  };

  const openEditModal = (recipe: RecipeWithStats) => {
    setSelectedRecipe(recipe);
    setIsEditModalOpen(true);
  };

  const openViewModal = (recipe: RecipeWithStats) => {
    setSelectedRecipe(recipe);
    setIsViewModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your recipes...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Recipes</h2>
          <p className="text-gray-600">Manage and organize your recipe collection</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchMyRecipes}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add New Recipe
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div 
          className={`bg-yellow-50 rounded-lg p-4 border-2 transition-all cursor-pointer ${statusFilter === 'pending' ? 'border-yellow-500 shadow-md' : 'border-yellow-200'}`}
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-xs text-yellow-700 mt-1">Awaiting approval</p>
        </div>

        <div 
          className={`bg-green-50 rounded-lg p-4 border-2 transition-all cursor-pointer ${statusFilter === 'approved' ? 'border-green-500 shadow-md' : 'border-green-200'}`}
          onClick={() => setStatusFilter(statusFilter === 'approved' ? 'all' : 'approved')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-xs text-green-700 mt-1">Published & visible</p>
        </div>

        <div 
          className={`bg-red-50 rounded-lg p-4 border-2 transition-all cursor-pointer ${statusFilter === 'rejected' ? 'border-red-500 shadow-md' : 'border-red-200'}`}
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? 'all' : 'rejected')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-xs text-red-700 mt-1">Needs revision</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">Total Views</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalViews}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xs text-blue-700 mt-1">All time views</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 text-sm font-medium">Total Likes</p>
              <p className="text-2xl font-bold text-purple-900">{stats.totalLikes}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xs text-purple-700 mt-1">Across all recipes</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {(statusFilter !== 'all' || categoryFilter || searchTerm) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Recipe Table */}
      {filteredRecipes && filteredRecipes.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecipes.map((recipe) => (
                  <tr key={recipe.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/100x100?text=No+Image';
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{recipe.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{recipe.description}</div>
                          {recipe.rejectionReason && recipe.approvalStatus === 'rejected' && (
                            <div className="text-xs text-red-600 mt-1">
                              Reason: {recipe.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {recipe.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(recipe.approvalStatus)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(recipe.approvalStatus)}`}>
                          {recipe.approvalStatus === 'approved' ? 'Approved' :
                           recipe.approvalStatus === 'pending' ? 'Pending' : 'Rejected'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {recipe.views || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(recipe)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {recipe.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => openEditModal(recipe)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteRecipeId(recipe.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter || statusFilter !== 'all' 
              ? 'No recipes found matching your filters' 
              : 'You haven\'t created any recipes yet'}
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Recipe
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Recipe"
        size="xl"
      >
        <RecipeForm
          onSubmit={handleCreate}
          isLoading={isCreating}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecipe(null);
        }}
        title="Edit Recipe"
        size="xl"
      >
        {selectedRecipe && (
          <RecipeForm
            recipe={selectedRecipe}
            onSubmit={handleUpdate}
            isLoading={isUpdating}
          />
        )}
      </Modal>

      {/* View Modal */}
      {selectedRecipe && (
        <RecipeDetailAdminModal
          recipe={selectedRecipe}
          chef={user}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRecipe(null);
          }}
          onLikeToggle={() => {}}
          onBookmarkToggle={() => {}}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteRecipeId !== null}
        onClose={() => setDeleteRecipeId(null)}
        title="Confirm Delete"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        onConfirm={() => {
          if (deleteRecipeId) handleDelete(deleteRecipeId);
          setDeleteRecipeId(null);
        }}
        isLoading={deletingRecipe}
      />
    </div>
  );
}