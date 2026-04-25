import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowLeft, UserPlus, AlertCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../store/authStore";
import { ForgotPasswordModal } from "../../components/auth/ForgotPasswordModal";

export function UnifiedLogin() {
  const navigate = useNavigate();
  const { login, isLoading, error: storeError, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // This prevents page refresh
    setError("");
    if (clearError) clearError();
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result && result.success) {
        toast.success("Welcome back!");
        
        if (result.user.role === "superadmin") {
          navigate("/admin/dashboard");
        } else if (result.user.role === "chef") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        // If login returns success: false
        setError(result?.message || "Invalid email or password");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      // Just set the error message, DO NOT clear form data
      setError(err.message || "Invalid email or password");
      // The formData remains unchanged with user's input
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
    if (error) setError("");
    if (storeError && clearError) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value });
    if (error) setError("");
    if (storeError && clearError) clearError();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
          {/* Back to Home */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back!
            </h1>
            <p className="text-gray-600">Sign in to RecipeNest</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || storeError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error || storeError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Signup Links */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Don't have an account?</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/chef/signup")}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
              >
                <UserPlus className="w-5 h-5" />
                Sign up as Chef
              </button>
              <button
                onClick={() => navigate("/foodlover/signup")}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                <UserPlus className="w-5 h-5" />
                Sign up as Food Lover
              </button>
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </>
  );
}