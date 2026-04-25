import { useEffect } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'; // Remove BrowserRouter
import { Toaster } from 'sonner';
import { useUIStore } from './store/uiStore';
import { HomePage } from './components/home/HomePage';
import { Navbar } from './components/layout/Navbar';
import { RecipesPage } from './components/recipes/RecipesPage';
import { ChefList } from './components/chefs/ChefList';
import { ChefProfile } from './components/chefs/ChefProfile';
import { UnifiedLogin } from './components/auth/UnifiedLogin';
import { ChefSignupPage } from './components/auth/ChefSignupPage';
import { FoodLoverSignupPage } from './components/auth/FoodLoverSignupPage';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { Dashboard } from './components/dashboard/Dashboard';
import { UserProfile } from './components/user/UserProfile';

// Layout component with Outlet
function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet /> {/* This is crucial - nested routes render here */}
    </div>
  );
}

function App() {
  const { isDarkMode } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes location={location} key={location.pathname}>
         {/* Auth Routes (No Navbar) */}
        <Route path="/login" element={<UnifiedLogin />} />
        <Route path="/chef/signup" element={<ChefSignupPage />} />
        <Route path="/foodlover/signup" element={<FoodLoverSignupPage />} />
        {/* Layout route with nested routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/chefs" element={<ChefList />} />
          <Route path="/chefs/:id" element={<ChefProfile />} />
        </Route>

        {/* Protected User Profile Route */}
        <Route
          path="/profile"
          element={
            <>
            <Navbar/>
                <UserProfile />
                </>
          }
        />

        {/* Protected Chef Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            
              <Dashboard />
          }
        />

        {/* Protected Super Admin Dashboard Route */}
        <Route
          path="/admin/dashboard"
          element={
              <SuperAdminDashboard />
          }
        />
        
        {/* 404 - Not Found */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page not found</p>
              <a href="/" className="text-orange-600 hover:text-orange-700 font-semibold">
                Go back home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;