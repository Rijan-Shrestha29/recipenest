import { useParams } from "react-router-dom";
import { RecipePortfolio } from "../recipes/RecipePortfolio";
import {
  Award,
  Calendar,
  Mail,
  Instagram,
  Twitter,
  Facebook,
  Globe,
  ChefHat,
  Loader2,
} from "lucide-react";
import { useChef } from "../../hooks/useChefs";
import { useRecipes } from "../../hooks/useRecipes";

export function ChefProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: chefData, isLoading: chefLoading, error: chefError } = useChef(id || "");
  const { data: recipesData, isLoading: recipesLoading } = useRecipes({ chefId: id });

  if (chefLoading || recipesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading chef profile...</p>
        </div>
      </div>
    );
  }

  if (chefError || !chefData?.chef) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chef Not Found</h2>
          <p className="text-gray-600">The chef you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const chef = chefData.chef;
  const chefRecipes = recipesData?.recipes || [];
  const totalCategories = new Set(chefRecipes.map((r: any) => r.category)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-orange-400 to-orange-600 overflow-hidden">
        {chef.coverImage && (
          <img
            src={chef.coverImage}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 md:-mt-24 mb-8">
          <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={chef.profileImage || chef.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chef.name)}&background=f97316&color=fff`}
                  alt={chef.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chef.name)}&background=f97316&color=fff`;
                  }}
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {chef.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center text-orange-600">
                    <Award className="w-5 h-5 mr-2" />
                    <span className="font-medium">{chef.specialty || 'Chef'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{chef.experience || 0} years experience</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 text-lg">{chef.bio || `Experienced chef specializing in ${chef.specialty || 'various cuisines'}.`}</p>

                {/* Contact & Social */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:${chef.email}`}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Me
                  </a>

                  {chef.socialMedia?.instagram && (
                    <a
                      href={`https://instagram.com/${chef.socialMedia.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </a>
                  )}

                  {chef.socialMedia?.twitter && (
                    <a
                      href={`https://twitter.com/${chef.socialMedia.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </a>
                  )}

                  {chef.socialMedia?.facebook && (
                    <a
                      href={chef.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </a>
                  )}

                  {chef.socialMedia?.website && (
                    <a
                      href={chef.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {chefRecipes.length}
              </div>
              <div className="text-gray-600">Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {totalCategories}
              </div>
              <div className="text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {chef.experience || 0}
              </div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>

        {/* Recipe Portfolio */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Recipe Portfolio
          </h2>
          <RecipePortfolio recipes={chefRecipes} showChefName={false} chefId={id} />
        </div>
      </div>
    </div>
  );
}