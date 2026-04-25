import { Recipe } from '../../types';
import { Clock, Users, ChefHat } from 'lucide-react';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: Recipe;
  chefName?: string;
  onViewDetails?: () => void;
  selectedChefId?: string;
}

export function RecipeCard({ recipe, chefName, onViewDetails, selectedChefId }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const totalTime = recipe.prepTime + recipe.cookTime;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onClick={onViewDetails}
    >
      {/* Recipe Image */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {!imageError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
            <ChefHat className="w-16 h-16 text-orange-400" />
          </div>
        )}
        
        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {recipe.title}
        </h3>

        {chefName && (
          <p className="text-sm text-orange-600 mb-2">by {chefName}</p>
        )}

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Recipe Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{totalTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
