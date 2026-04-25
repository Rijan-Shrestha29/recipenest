import { Link } from 'react-router-dom';
import { ChefHat, BookOpen, Users, ArrowRight, Star } from 'lucide-react';
import { useState } from 'react';
import { RecipeCard } from '../recipes/RecipeCard';
import { RecipeDetailModal } from '../recipes/RecipeDetailModal';
import { useTrendingRecipes } from '../../hooks/useRecipes';
import { useChefs } from '../../hooks/useChefs';

export function HomePage() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const { data: recipesData, isLoading: recipesLoading } = useTrendingRecipes();
  const { data: chefsData, isLoading: chefsLoading } = useChefs();

  const recipes = recipesData?.recipes || [];
  const chefs = chefsData?.chefs || [];
  const featuredRecipes = recipes.slice(0, 6);

  const selectedChef = chefs.find((chef) => chef._id === selectedRecipe?.chefId._id);

  if (recipesLoading || chefsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <ChefHat className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to RecipeNest
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Discover amazing recipes from talented chefs around the world.
              Share your culinary creations and connect with food lovers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chefs"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-lg"
              >
                Explore Chefs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/chef/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-700 text-white rounded-lg font-semibold hover:bg-orange-800 transition-colors border-2 border-white/20"
              >
                Join as Chef
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RecipeNest?
            </h2>
            <p className="text-xl text-gray-600">
              The perfect platform for culinary enthusiasts and professional chefs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Recipe Portfolio
              </h3>
              <p className="text-gray-600">
                Create and showcase your recipe collection with detailed
                ingredients, instructions, and beautiful photos.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Connect with Chefs
              </h3>
              <p className="text-gray-600">
                Discover talented chefs, follow their profiles, and learn from
                the best in the culinary world.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <ChefHat className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Chef Dashboard
              </h3>
              <p className="text-gray-600">
                Manage your recipes, update your profile, and track your
                culinary journey all in one place.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {chefs.length}+
              </div>
              <div className="text-gray-600">Expert Chefs</div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {recipes.length}+
              </div>
              <div className="text-gray-600">Delicious Recipes</div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {new Set(recipes.map((r) => r.category)).size}+
              </div>
              <div className="text-gray-600">Cuisine Types</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Recipes */}
      {featuredRecipes.length > 0 && (
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Featured Recipes
                </h2>
                <p className="text-xl text-gray-600">
                  Explore our most popular dishes
                </p>
              </div>
              <Link
                to="/recipes"
                className="hidden md:inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onViewDetails={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>

            <div className="text-center mt-12 md:hidden">
              <Link
                to="/recipes"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
              >
                View All Recipes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Share Your Culinary Passion?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join our community of talented chefs and start building your recipe
            portfolio today.
          </p>
          <Link
            to="/chef/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-lg"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          chef={selectedChef}
          isOpen={!!selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onLikeToggle={() => {
            // Refetch recipes to update like count
          }}
          onBookmarkToggle={() => {
            // Refetch recipes to update bookmark status
          }}
        />
      )}
    </div>
  );
}