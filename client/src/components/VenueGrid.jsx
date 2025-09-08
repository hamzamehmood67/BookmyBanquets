import { useState } from "react";
import { motion } from "framer-motion";
import { FiHeart, FiMapPin, FiUsers, FiClock, FiStar } from "react-icons/fi";

const itemsPerPage = 6;

const VenueGrid = ({ venues = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [favoriteVenues, setFavoriteVenues] = useState([]);

  const totalPages = Math.ceil(venues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVenues = venues.slice(startIndex, startIndex + itemsPerPage);

  const toggleFavorite = (id) => {
    setFavoriteVenues((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  return (
    <div className="px-4 sm:px-8 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 -mx-3">
        {currentVenues.map((venue) => (
          <div key={venue.id} className="px-3 pb-6">
            <motion.div
              className="venue-card h-full"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-64 object-cover"
                />
                <button
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                  onClick={() => toggleFavorite(venue.id)}
                >
                  <FiHeart
                    className={`h-5 w-5 ${
                      favoriteVenues.includes(venue.id)
                        ? "text-red-500 fill-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
                {venue.featured && (
                  <div className="absolute top-4 left-4 bg-gold-500 px-3 py-1 text-xs font-semibold text-white rounded-full">
                    Featured
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-navy-800">
                    {venue.name}
                  </h3>
                  <div className="flex items-center">
                    <FiStar className="text-gold-500 mr-1" />
                    <span className="text-sm font-medium">{venue.rating}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({venue.reviewCount})
                    </span>
                  </div>
                </div>
                <div className="flex items-center text-gray-500 mb-4">
                  <FiMapPin className="mr-1" />
                  <span className="text-sm">{venue.location}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-navy-500">
                    <FiUsers className="mr-1" />
                    <span className="text-sm">{venue.capacity}</span>
                  </div>
                  <div className="flex items-center text-navy-500">
                    <FiClock className="mr-1" />
                    <span className="text-sm">Available Now</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-navy-800">
                    <span className="font-semibold text-lg">{venue.price}</span>
                    <span className="text-gray-500 text-sm"></span>
                  </div>
                  <a
                    href={`/hall/${venue.id}`}
                    className="btn-outline text-sm py-2"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-10 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`px-4 py-2 rounded border ${
              currentPage === num
                ? "bg-pink-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VenueGrid;
