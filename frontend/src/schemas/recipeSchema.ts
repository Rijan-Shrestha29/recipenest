import { z } from 'zod';

export const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().min(1, 'Unit is required'),
});

export const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'], {
    errorMap: () => ({ message: 'Please select a difficulty level' }),
  }),
  prepTime: z.number().min(1, 'Prep time must be at least 1 minute').max(1440, 'Prep time too long'),
  cookTime: z.number().min(1, 'Cook time must be at least 1 minute').max(1440, 'Cook time too long'),
  servings: z.number().min(1, 'Servings must be at least 1').max(100, 'Too many servings'),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string().min(5, 'Instruction must be at least 5 characters')).min(1, 'At least one instruction is required'),
  image: z.string().url('Must be a valid URL'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Too many tags'),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;
