import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userProfileSchema, UserProfileFormData } from '../../schemas/userSchema';
import { Button } from '../ui/Button';
import { Save, User, Mail, Image as ImageIcon, Bookmark, Heart, MessageCircle, Loader2, Upload, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { RecipeCard } from '../recipes/RecipeCard';
import { RecipeDetailModal } from '../recipes/RecipeDetailModal';
import { Recipe } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { userService } from '../../services/userService';
import { bookmarkService } from '../../services/bookmarkService';
import { uploadService } from '../../services/uploadService';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';

export function UserProfile() {
  const { user, updateUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<Recipe[]>([]);
  const [userStats, setUserStats] = useState({
    recipesCount: 0,
    commentsCount: 0,
    likesCount: 0,
    bookmarksCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
    },
  });

  const avatarUrl = watch('avatar');

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || '');
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const statsResponse = await userService.getUserStats();
      if (statsResponse.success) {
        setUserStats(statsResponse.stats);
      }

      const bookmarksResponse = await bookmarkService.getMyBookmarks();
      if (bookmarksResponse.success) {
        setBookmarkedRecipes(bookmarksResponse.bookmarks || []);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploading(true);
    try {
      const response = await uploadService.uploadAvatar(file);
      if (response.success) {
        const imageUrl = response.data.url;
        setAvatarPreview(imageUrl);
        setValue('avatar', imageUrl);
        
        // Auto-save after upload
        await autoSaveProfile({ ...user, avatar: imageUrl });
        toast.success('Avatar uploaded and saved automatically!');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const autoSaveProfile = async (updatedData: any) => {
    try {
      const response = await userService.updateProfile({
        name: updatedData.name,
        avatar: updatedData.avatar,
      });

      if (response.success) {
        const updatedUser = {
          ...user,
          ...updatedData,
        };
        updateUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Auto-save error:', error);
    }
  };

  const onSubmit = async (data: UserProfileFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const response = await userService.updateProfile({
        name: data.name,
        avatar: data.avatar,
      });

      if (response.success) {
        const updatedUser = {
          ...user,
          name: data.name,
          avatar: data.avatar || user.avatar,
        };
        updateUser(updatedUser);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Please log in to view your profile settings.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Update your personal information and manage your bookmarks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Settings - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-6 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Avatar Section with Upload */}
                  <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-100">
                    <div className="relative group">
                      <img
                        src={avatarPreview || avatarUrl || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff`}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute bottom-0 right-0 p-1.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors disabled:opacity-50"
                        title="Upload avatar"
                      >
                        {isUploading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="w-full">
                      <h3 className="font-semibold text-gray-900 text-center mb-2">Profile Picture</h3>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="https://example.com/avatar.jpg"
                          className={`block w-full pl-10 pr-3 py-2 border ${errors.avatar ? 'border-red-300' : 'border-gray-300'} rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out`}
                          {...register('avatar')}
                        />
                      </div>
                      {errors.avatar && (
                        <p className="mt-1 text-sm text-red-600">{errors.avatar.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Enter a URL or click the upload button to upload an image
                      </p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          type="text"
                          className={`block w-full pl-10 pr-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out`}
                          placeholder="Your Name"
                          {...register('name')}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={user.email}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 text-gray-500 placeholder-gray-500 focus:outline-none sm:text-sm cursor-not-allowed"
                          disabled
                          readOnly
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Email address cannot be changed. Contact support for assistance.
                      </p>
                    </div>
                  </div>

                  {/* Change Password Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsChangePasswordOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Key className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>

                  {/* Stats Section */}
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Your Activity</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Bookmark className="w-4 h-4" />
                          <span>Bookmarks</span>
                        </div>
                        <span className="font-semibold text-gray-900">{userStats.bookmarksCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>Likes Given</span>
                        </div>
                        <span className="font-semibold text-gray-900">{userStats.likesCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MessageCircle className="w-4 h-4 text-blue-500" />
                          <span>Comments</span>
                        </div>
                        <span className="font-semibold text-gray-900">{userStats.commentsCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Bookmarked Recipes - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Bookmark className="w-6 h-6 text-orange-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bookmarked Recipes</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {userStats.bookmarksCount} {userStats.bookmarksCount === 1 ? 'recipe' : 'recipes'} saved
                    </p>
                  </div>
                </div>

                {bookmarkedRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookmarkedRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe._id || recipe.id}
                        recipe={recipe}
                        onViewDetails={() => setSelectedRecipe(recipe)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Bookmark className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarked recipes yet</h3>
                    <p className="text-gray-600">
                      Start exploring recipes and bookmark your favorites to see them here!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedRecipe && (
          <RecipeDetailModal
            recipe={selectedRecipe}
            isOpen={!!selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onLikeToggle={fetchUserData}
            onBookmarkToggle={fetchUserData}
          />
        )}
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}