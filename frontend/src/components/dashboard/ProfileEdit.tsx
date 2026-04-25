import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Save, Upload, Loader2, Camera, Key } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import { userService } from '../../services/userService';
import { uploadService } from '../../services/uploadService';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';

const chefProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  specialty: z.string().min(2, 'Specialty is required'),
  experience: z.number().min(0, 'Experience must be positive'),
  profileImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  coverImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  socialMedia: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  }),
});

type ChefProfileFormData = z.infer<typeof chefProfileSchema>;

export function ProfileEdit() {
  const { user, setUser, chefDetails } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ChefProfileFormData>({
    resolver: zodResolver(chefProfileSchema),
  });

  const profileImage = watch('profileImage');
  const coverImage = watch('coverImage');

  useEffect(() => {
    if (user && user.role === 'chef') {
      reset({
        name: user.name,
        email: user.email,
        bio: (user as any).bio || chefDetails?.bio || '',
        specialty: (user as any).specialty || chefDetails?.specialty || '',
        experience: (user as any).experience || chefDetails?.experience || 0,
        profileImage: (user as any).profileImage || chefDetails?.profileImage || user.avatar || '',
        coverImage: (user as any).coverImage || chefDetails?.coverImage || '',
        socialMedia: {
          instagram: (user as any).socialMedia?.instagram || chefDetails?.socialMedia?.instagram || '',
          twitter: (user as any).socialMedia?.twitter || chefDetails?.socialMedia?.twitter || '',
          facebook: (user as any).socialMedia?.facebook || chefDetails?.socialMedia?.facebook || '',
          website: (user as any).socialMedia?.website || chefDetails?.socialMedia?.website || '',
        },
      });
    }
  }, [user, chefDetails, reset]);

  const autoSaveProfile = async (updatedData: Partial<ChefProfileFormData>) => {
    try {
      await userService.updateChefProfile({
        bio: updatedData.bio,
        specialty: updatedData.specialty,
        experience: updatedData.experience,
        profileImage: updatedData.profileImage,
        coverImage: updatedData.coverImage,
        socialMedia: updatedData.socialMedia,
      });
      
      if (user) {
        const updatedUser = {
          ...user,
          ...updatedData,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('Auto-save error:', error);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingProfile(true);
    try {
      const response = await uploadService.uploadAvatar(file);
      if (response.success) {
        const imageUrl = response.data.url;
        setValue('profileImage', imageUrl);
        
        // Auto-save after upload
        await autoSaveProfile({ profileImage: imageUrl });
        toast.success('Profile image uploaded and saved automatically!');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile image');
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingCover(true);
    try {
      const response = await uploadService.uploadCoverImage(file);
      if (response.success) {
        const imageUrl = response.data.url;
        setValue('coverImage', imageUrl);
        
        // Auto-save after upload
        await autoSaveProfile({ coverImage: imageUrl });
        toast.success('Cover image uploaded and saved automatically!');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const onSubmit = async (data: ChefProfileFormData) => {
    if (!user || user.role !== 'chef') return;

    setIsSubmitting(true);

    try {
      await userService.updateProfile({
        name: data.name,
        avatar: data.profileImage,
      });

      await userService.updateChefProfile({
        bio: data.bio,
        specialty: data.specialty,
        experience: data.experience,
        profileImage: data.profileImage,
        coverImage: data.coverImage,
        socialMedia: data.socialMedia,
      });

      const updatedUser = {
        ...user,
        name: data.name,
        email: data.email,
        bio: data.bio,
        specialty: data.specialty,
        experience: data.experience,
        profileImage: data.profileImage,
        coverImage: data.coverImage,
        socialMedia: data.socialMedia,
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'chef') return null;

  return (
    <>
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
          <p className="text-gray-600">Update your profile information and preferences</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <div className="relative">
              {coverImage ? (
                <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/1200x400?text=Cover+Image';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="absolute bottom-2 right-2 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                  >
                    {isUploadingCover ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className="h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
                >
                  {isUploadingCover ? (
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload cover image</p>
                      <p className="text-xs text-gray-400">Recommended size: 1200x400px</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
              />
            </div>
            <Input
              label="Cover Image URL (or upload above)"
              placeholder="https://example.com/cover.jpg"
              error={errors.coverImage?.message}
              {...register('coverImage')}
              className="mt-2"
            />
          </div>

          {/* Profile Image Preview with Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
              <div className="relative">
                <img
                  src={profileImage || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff`}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff`;
                  }}
                />
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  disabled={isUploadingProfile}
                  className="absolute bottom-0 right-0 p-1.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isUploadingProfile ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                </button>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Upload a profile picture or enter a URL below</p>
                <Input
                  placeholder="https://example.com/profile.jpg"
                  error={errors.profileImage?.message}
                  {...register('profileImage')}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email *"
              type="email"
              placeholder="chef@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <Textarea
            label="Bio *"
            placeholder="Tell us about yourself and your culinary journey..."
            rows={4}
            error={errors.bio?.message}
            {...register('bio')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Specialty *"
              placeholder="e.g., Italian Cuisine"
              error={errors.specialty?.message}
              {...register('specialty')}
            />

            <Input
              label="Years of Experience *"
              type="number"
              min="0"
              placeholder="10"
              error={errors.experience?.message}
              {...register('experience', { valueAsNumber: true })}
            />
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

          {/* Social Media */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Instagram Handle"
                placeholder="@yourhandle"
                error={errors.socialMedia?.instagram?.message}
                {...register('socialMedia.instagram')}
              />

              <Input
                label="Twitter Handle"
                placeholder="@yourhandle"
                error={errors.socialMedia?.twitter?.message}
                {...register('socialMedia.twitter')}
              />

              <Input
                label="Facebook Page"
                placeholder="Your Page Name"
                error={errors.socialMedia?.facebook?.message}
                {...register('socialMedia.facebook')}
              />

              <Input
                label="Website URL"
                placeholder="https://yourwebsite.com"
                error={errors.socialMedia?.website?.message}
                {...register('socialMedia.website')}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}