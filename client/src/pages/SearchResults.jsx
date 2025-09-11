import { useState, useEffect } from "react";
import { FiMapPin, FiUsers, FiStar, FiFilter, FiX, FiSearch, FiHeart, FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchResults = () => {
  const [halls, setHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000000 },
    location: "",
    minRating: 0,
    capacity: 0
  });

  const navigate = useNavigate();

  // Load search criteria from localStorage
  useEffect(() => {
    const savedCriteria = localStorage.getItem('searchCriteria');
    if (savedCriteria) {
      const criteria = JSON.parse(savedCriteria);
      setSearchCriteria(criteria);
      
      // Set initial filters based on search criteria
      if (criteria.location) {
        setFilters(prev => ({ ...prev, location: criteria.location }));
      }
      if (criteria.guestCount) {
        setFilters(prev => ({ ...prev, capacity: parseInt(criteria.guestCount) }));
      }
    }
  }, []);

  // Fetch halls data
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/v1/hall');
        
        // Handle different response formats
        let hallsData = [];
        if (response.data?.venues) {
          hallsData = response.data.venues;
        } else if (Array.isArray(response.data)) {
          hallsData = response.data;
        } else if (response.data?.data) {
          hallsData = response.data.data;
        }

        // Transform data to match our needs
        const transformedHalls = hallsData.map(hall => ({
          id: hall.id,
          name: hall.name,
          location: hall.location,
          price: hall.price,
          capacity: hall.capacity,
          rating: hall.rating || 0,
          reviewCount: hall.reviewCount || 0,
          images: hall.image ? hall.image.split(',').map(img => img.trim()) : [],
          featured: hall.featured || false,
          description: hall.description || "",
          amenities: hall.amenities || []
        }));

        setHalls(transformedHalls);
        setFilteredHalls(transformedHalls);
      } catch (err) {
        console.error('Error fetching halls:', err);
        setError('Failed to fetch halls');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...halls];

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(hall => 
        hall.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(hall => 
      hall.price >= filters.priceRange.min && hall.price <= filters.priceRange.max
    );

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(hall => hall.rating >= filters.minRating);
    }

    // Filter by capacity
    if (filters.capacity > 0) {
      filtered = filtered.filter(hall => hall.capacity >= filters.capacity);
    }

    setFilteredHalls(filtered);
  }, [halls, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 1000000 },
      location: "",
      minRating: 0,
      capacity: 0
    });
  };

  const handleHallClick = (hallId) => {
    navigate(`/hall/${hallId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-10" >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
              {searchCriteria && (
                <p className="text-gray-600 mt-2">
                  {searchCriteria.location && `in ${searchCriteria.location}`}
                  {searchCriteria.guestCount && ` • ${searchCriteria.guestCount} guests`}
                  {searchCriteria.eventDate && ` • ${new Date(searchCriteria.eventDate).toLocaleDateString()}`}
                </p>
              )}
            </div>
            <p className="text-lg text-gray-700">
              {filteredHalls.length} halls found
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-center px-4 py-2 bg-[#FF477E] text-white rounded-lg font-medium"
            >
              <FiFilter className="mr-2" />
              {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters Sidebar */}
          <motion.div 
            className={`lg:w-80 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-[#FF477E] text-sm font-medium hover:text-[#FF477E]/80"
                >
                  Clear All
                </button>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Location
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter city or area"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min || ''}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        min: parseInt(e.target.value) || 0
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max === 1000000 ? '' : filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        max: parseInt(e.target.value) || 1000000
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPrice(filters.priceRange.min)} - {filters.priceRange.max === 1000000 ? 'Any' : formatPrice(filters.priceRange.max)}
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Minimum Rating
                </label>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.minRating === rating}
                        onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                        className="text-[#FF477E] focus:ring-[#FF477E]"
                      />
                      <div className="ml-3 flex items-center">
                        {renderStars(rating)}
                        <span className="ml-2 text-sm text-gray-600">& above</span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      value={0}
                      checked={filters.minRating === 0}
                      onChange={(e) => handleFilterChange('minRating', 0)}
                      className="text-[#FF477E] focus:ring-[#FF477E]"
                    />
                    <span className="ml-3 text-sm text-gray-600">Any Rating</span>
                  </label>
                </div>
              </div>

              {/* Capacity Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Minimum Capacity
                </label>
                <div className="relative">
                  <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Enter minimum guests"
                    value={filters.capacity || ''}
                    onChange={(e) => handleFilterChange('capacity', parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Content */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-3"></div>
                      <div className="h-3 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg mb-2">⚠️ {error}</div>
                <p className="text-gray-600">Please try refreshing the page</p>
              </div>
            ) : filteredHalls.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No halls found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-[#FF477E] text-white rounded-lg font-medium hover:bg-[#FF477E]/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {filteredHalls.map((hall, index) => (
                  <motion.div
                    key={hall.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleHallClick(hall.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={hall.images[0] || 'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg'}
                        alt={hall.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {hall.featured && (
                        <div className="absolute top-3 left-3 bg-[#FF477E] text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                      <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        <FiHeart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#FF477E] transition-colors">
                        {hall.name}
                      </h3>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <FiMapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">{hall.location}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-3">
                        <FiUsers className="w-4 h-4 mr-2" />
                        <span className="text-sm">Up to {hall.capacity} guests</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {renderStars(hall.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            ({hall.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-[#FF477E]">
                            {formatPrice(hall.price)}
                          </span>
                          <span className="text-sm text-gray-600">/event</span>
                        </div>
                        <button className="px-4 py-2 bg-[#FF477E] text-white rounded-lg font-medium hover:bg-[#FF477E]/90 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
