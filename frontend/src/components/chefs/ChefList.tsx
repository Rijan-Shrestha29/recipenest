import { useState } from 'react';
import { ChefCard } from './ChefCard';
import { Search, ChefHat, Users, Loader2 } from 'lucide-react';
import { useChefs } from '../../hooks/useChefs';

export function ChefList() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: chefsData, isLoading, error } = useChefs();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading talented chefs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error loading chefs</div>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  const chefs = chefsData?.chefs || [];
  
  const filteredChefs = chefs.filter((chef: any) =>
    chef.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chef.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chef.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const totalExperience = chefs.reduce((sum: number, chef: any) => sum + (chef.experience || 0), 0);
  const uniqueSpecialties = new Set(chefs.map((c: any) => c.specialty)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ChefHat className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Meet Our Talented Chefs</h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Discover culinary experts from around the world, each bringing their unique flavors and expertise
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{chefs.length}</div>
            <div className="text-gray-600">Expert Chefs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{totalExperience}+</div>
            <div className="text-gray-600">Years Combined Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{uniqueSpecialties}</div>
            <div className="text-gray-600">Cuisine Specialties</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search chefs by name, specialty, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Chefs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredChefs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredChefs.map((chef: any) => (
              <ChefCard key={chef._id} chef={chef} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No chefs found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
}