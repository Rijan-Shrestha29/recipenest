import { useState, useMemo } from 'react';
import { Recipe } from '../../types';
import { RecipeCard } from './RecipeCard';
import { RecipeDetailModal } from './RecipeDetailModal';
import { Filter, ArrowUpDown, Search, Loader2, ChefHat } from 'lucide-react';
import { useChef } from '../../hooks/useChefs';

interface RecipePortfolioProps {
  recipes: Recipe[];
  showChefName?: boolean;
  chefId?: string;
}

export function RecipePortfolio({ recipes, showChefName = true, chefId }: RecipePortfolioProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'prepTime' | 'difficulty'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get unique categories and difficulties from the recipes prop
  const categories = useMemo(() => 
    Array.from(new Set(recipes.map(r => r.category))),
    [recipes]
  );
  
  const difficulties = ['Easy', 'Medium', 'Hard'];

  // Filter and sort recipes
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !categoryFilter || recipe.category === categoryFilter;
      const matchesDifficulty = !difficultyFilter || recipe.difficulty === difficultyFilter;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'prepTime':
          comparison = (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
          break;
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [recipes, searchTerm, categoryFilter, difficultyFilter, sortBy, sortOrder]);

  // Fetch chef data for the selected recipe using the hook
  const { data: selectedChef, isLoading: chefLoading } = useChef(selectedRecipe?.chefId?._id || '');


  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setDifficultyFilter('');
  };

  const hasActiveFilters = searchTerm || categoryFilter || difficultyFilter;

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No recipes available yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Difficulties</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="title">Sort by Title</option>
              <option value="prepTime">Sort by Time</option>
              <option value="difficulty">Sort by Difficulty</option>
            </select>
            
            <button
              onClick={toggleSortOrder}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ArrowUpDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm('')} className="hover:text-orange-900">×</button>
              </span>
            )}
            {categoryFilter && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                {categoryFilter}
                <button onClick={() => setCategoryFilter('')} className="hover:text-orange-900">×</button>
              </span>
            )}
            {difficultyFilter && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                {difficultyFilter}
                <button onClick={() => setDifficultyFilter('')} className="hover:text-orange-900">×</button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredAndSortedRecipes.length} of {recipes.length} recipes
        </p>
      </div>

      {/* Recipe Grid */}
      {filteredAndSortedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              selectedChefId={chefId}
              chefName={showChefName ? recipe.chefName : undefined}
              onViewDetails={() => setSelectedRecipe(recipe)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No recipes found matching your filters</p>
          <button
            onClick={clearAllFilters}
            className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          chef={chefLoading ? undefined : selectedChef?.chef}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onLikeToggle={() => {}}
          onBookmarkToggle={() => {}}
        />
      )}
    </div>
  );
}