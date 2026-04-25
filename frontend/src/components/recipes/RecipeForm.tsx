import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recipeSchema, RecipeFormData } from '../../schemas/recipeSchema';
import { Input, Textarea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus, X, Upload, Loader2, Image } from 'lucide-react';
import { Recipe } from '../../types';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { uploadService } from '../../services/uploadService';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  isLoading?: boolean;
}

const categories = [
  'Main Course',
  'Appetizer',
  'Dessert',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Beverage'
];

export function RecipeForm({ recipe, onSubmit, isLoading }: RecipeFormProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: recipe ? {
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image: recipe.image,
      tags: recipe.tags,
    } : {
      ingredients: [{ name: '', quantity: '', unit: '' }],
      instructions: [''],
      tags: [],
    }
  });

  const imageUrl = watch('image');

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions',
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control,
    name: 'tags',
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const response = await uploadService.uploadRecipeImage(file);
      if (response.success) {
        setValue('image', response.data.url);
        toast.success('Recipe image uploaded successfully!');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Recipe Title *"
          placeholder="e.g., Homemade Pizza"
          error={errors.title?.message}
          {...register('title')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Image *</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                className={`flex-1 px-4 py-2 border ${errors.image ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                {...register('image')}
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImage}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {imageUrl && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/128x128?text=No+Image';
                  }}
                />
              </div>
            )}
            {errors.image && (
              <p className="text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>
        </div>
      </div>

      <Textarea
        label="Description *"
        placeholder="Describe your recipe..."
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Category and Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Category *"
          options={categories.map(cat => ({ value: cat, label: cat }))}
          error={errors.category?.message}
          {...register('category')}
        />

        <Select
          label="Difficulty *"
          options={[
            { value: 'Easy', label: 'Easy' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Hard', label: 'Hard' },
          ]}
          error={errors.difficulty?.message}
          {...register('difficulty')}
        />

        <Input
          label="Servings *"
          type="number"
          min="1"
          placeholder="4"
          error={errors.servings?.message}
          {...register('servings', { valueAsNumber: true })}
        />
      </div>

      {/* Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Prep Time (minutes) *"
          type="number"
          min="1"
          placeholder="30"
          error={errors.prepTime?.message}
          {...register('prepTime', { valueAsNumber: true })}
        />

        <Input
          label="Cook Time (minutes) *"
          type="number"
          min="1"
          placeholder="45"
          error={errors.cookTime?.message}
          {...register('cookTime', { valueAsNumber: true })}
        />
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Ingredients *
          </label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => appendIngredient({ name: '', quantity: '', unit: '' })}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Ingredient
          </Button>
        </div>
        
        <div className="space-y-3">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                placeholder="Ingredient name"
                error={errors.ingredients?.[index]?.name?.message}
                {...register(`ingredients.${index}.name`)}
              />
              <Input
                placeholder="Qty"
                className="w-24"
                error={errors.ingredients?.[index]?.quantity?.message}
                {...register(`ingredients.${index}.quantity`)}
              />
              <Input
                placeholder="Unit"
                className="w-24"
                error={errors.ingredients?.[index]?.unit?.message}
                {...register(`ingredients.${index}.unit`)}
              />
              {ingredientFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.ingredients?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.ingredients.message}</p>
        )}
      </div>

      {/* Instructions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Instructions *
          </label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => appendInstruction('')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Step
          </Button>
        </div>
        
        <div className="space-y-3">
          {instructionFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm mt-2">
                {index + 1}
              </span>
              <Textarea
                placeholder={`Step ${index + 1}`}
                rows={2}
                error={errors.instructions?.[index]?.message}
                {...register(`instructions.${index}`)}
              />
              {instructionFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.instructions?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.instructions.message}</p>
        )}
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Tags *
          </label>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => appendTag('')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Tag
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tagFields.map((field, index) => (
            <div key={field.id} className="flex gap-1">
              <Input
                placeholder="e.g., Italian"
                error={errors.tags?.[index]?.message}
                {...register(`tags.${index}`)}
              />
              {tagFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.tags?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {recipe ? 'Update Recipe' : 'Create Recipe'}
        </Button>
      </div>
    </form>
  );
}