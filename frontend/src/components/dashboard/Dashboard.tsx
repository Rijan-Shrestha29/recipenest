import { useState, useEffect } from 'react';
import { ChefHat, BookOpen, User, LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { RecipeManagement } from './RecipeManagement';
import { ProfileEdit } from './ProfileEdit';

type TabType = 'recipes' | 'profile';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('recipes');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, chefDetails } = useAuthStore();

  // Redirect if not authenticated or not a chef
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user && user.role !== 'chef') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'chef') {
    return null;
  }

  // Get chef-specific data from either user object or chefDetails
  const chefBio = (user as any).bio || chefDetails?.bio || '';
  const chefSpecialty = (user as any).specialty || chefDetails?.specialty || 'Chef';
  const chefExperience = (user as any).experience || chefDetails?.experience || 0;
  const chefProfileImage = (user as any).profileImage || chefDetails?.profileImage || user.avatar;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/download.png" alt="RecipeNest Logo" className="w-[64px] h-[64px]" />
              <h1 className="text-xl font-bold text-gray-900">Chef Dashboard</h1>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <img
              src={chefProfileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff`}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff`;
              }}
            />
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
              <p className="text-orange-100">{chefSpecialty} Specialist • {chefExperience} years experience</p>
              {chefBio && <p className="text-orange-100 text-sm mt-1 max-w-2xl">{chefBio.substring(0, 100)}...</p>}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Recipes</p>
                <p className="text-3xl font-bold text-gray-900" id="totalRecipes">0</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Experience</p>
                <p className="text-3xl font-bold text-gray-900">{chefExperience} years</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Specialty</p>
                <p className="text-xl font-bold text-gray-900 truncate">{chefSpecialty}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('recipes')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'recipes'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BookOpen className="w-5 h-5 inline-block mr-2" />
                Recipe Management
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5 inline-block mr-2" />
                Profile Settings
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'recipes' && <RecipeManagement />}
            {activeTab === 'profile' && <ProfileEdit />}
          </div>
        </div>
      </div>
    </div>
  );
}