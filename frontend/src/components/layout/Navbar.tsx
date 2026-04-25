import { NavLink, useNavigate } from 'react-router-dom';
import { ChefHat, Home, Users, LogIn, LayoutDashboard, UserCircle, LogOut, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <img src="/download.png" alt="RecipeNest Logo" className="w-[64px] h-[64px]" />
          </NavLink>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </NavLink>

            <NavLink
              to="/recipes"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline">Recipes</span>
            </NavLink>

            <NavLink
              to="/chefs"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Chefs</span>
            </NavLink>

            {/* Chef Dashboard Link */}
            {isAuthenticated && user?.role === 'chef' && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-700 text-white'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`
                }
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>
            )}

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
                      {user.role === 'foodlover' && (
                        <NavLink
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <UserCircle className="w-4 h-4" />
                          Profile
                        </NavLink>
                      )}
                      {user.role === 'superadmin' && (
                        <NavLink
                          to="/admin/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </NavLink>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                  </>
                )}
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}