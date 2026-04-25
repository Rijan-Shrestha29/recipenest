import { Chef } from '../../types';
import { Award, Instagram, Twitter, Facebook, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChefCardProps {
  chef: Chef;
}

export function ChefCard({ chef }: ChefCardProps) {
  return (
    <Link 
      to={`/chefs/${chef._id}`}
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
    >
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600 relative overflow-hidden">
        {chef.coverImage && (
          <img 
            src={chef.coverImage} 
            alt="" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Profile Image */}
      <div className="relative px-6 pb-6">
        <div className="absolute -top-12 left-6">
          <img
            src={chef.profileImage || chef.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chef.name)}&background=f97316&color=fff`}
            alt={chef.name}
            className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chef.name)}&background=f97316&color=fff`;
            }}
          />
        </div>

        <div className="pt-16">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{chef.name}</h3>
          
          <div className="flex items-center text-orange-600 text-sm mb-3">
            <Award className="w-4 h-4 mr-1" />
            <span>{chef.specialty || 'Chef'}</span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {chef.bio || `Experienced chef specializing in ${chef.specialty || 'various cuisines'}.`}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {chef.experience || 0} years experience
            </div>

            <div className="flex gap-2">
              {chef.socialMedia?.instagram && (
                <a 
                  href={`https://instagram.com/${chef.socialMedia.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {chef.socialMedia?.twitter && (
                <a 
                  href={`https://twitter.com/${chef.socialMedia.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {chef.socialMedia?.facebook && (
                <a 
                  href={chef.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {chef.socialMedia?.website && (
                <a 
                  href={chef.socialMedia.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}