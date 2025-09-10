import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Clock, Star, ThumbsUp } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

interface HallData {
  hallId: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  imageURLs: string;
  status: string;
  address: {
    addressLine: string;
    city: string;
    state: string;
    country: string;
  };
  amenities: Array<{
    amenity: {
      amenityId: string;
      name: string;
      description: string;
    };
  }>;
  reviews: Array<{
    reviewId: string;
    rating: number;
    comment: string;
    user: {
      name: string;
    };
  }>;
}

interface HallInfoProps {
  hallData: HallData;
}

const HallInfo: React.FC<HallInfoProps> = ({ hallData }) => {
  const { user } = useAuth(); // Get user from auth context
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, reviewCount: 0 });
  const [bookingStats, setBookingStats] = useState({ totalBookings: 0, thisMonthBookings: 0 });
  
  const API = 'http://localhost:3000/api/v1';
  
  // Check if user is a customer
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    // Calculate review statistics
    if (hallData.reviews && hallData.reviews.length > 0) {
      const totalRating = hallData.reviews.reduce((sum, review) => sum + review.rating, 0);
      const avgRating = totalRating / hallData.reviews.length;
      setReviewStats({
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: hallData.reviews.length
      });
    }

    // Fetch booking statistics (optional - can be hardcoded for now)
    const fetchBookingStats = async () => {
      try {
        const response = await axios.get(`${API}/hall/${hallData.hallId}/bookings`);
        const bookings = response.data;
        const thisMonth = new Date();
        const thisMonthBookings = bookings.filter((booking: any) => {
          const bookingDate = new Date(booking.startDate);
          return bookingDate.getMonth() === thisMonth.getMonth() && 
                 bookingDate.getFullYear() === thisMonth.getFullYear();
        }).length;
        
        setBookingStats({
          totalBookings: bookings.length,
          thisMonthBookings
        });
      } catch (error) {
        // If we can't fetch bookings (likely due to permissions), use fallback data
        console.log('Using fallback booking stats');
      }
    };

    fetchBookingStats();
  }, [hallData]);

  // Format price range based on hall price
  const getPriceRange = (price: number) => {
    if (price < 100000) return "₹₹";
    if (price < 200000) return "₹₹₹";
    return "₹₹₹₹";
  };

  // Determine category based on price and amenities count
  const getCategory = (price: number, amenitiesCount: number) => {
    if (price > 300000 || amenitiesCount > 8) return "Luxury";
    if (price > 150000 || amenitiesCount > 5) return "Premium";
    return "Standard";
  };

  const hallDetails = {
    name: hallData.name,
    rating: reviewStats.avgRating || 4.5, // Fallback rating if no reviews
    reviews: reviewStats.reviewCount,
    category: getCategory(hallData.price, hallData.amenities?.length || 0),
    capacity: {
      min: Math.max(50, Math.floor(hallData.capacity * 0.6)), // Assume 60% minimum capacity
      max: hallData.capacity,
    },
    address: `${hallData.address.addressLine}, ${hallData.address.city}, ${hallData.address.state}`,
    timings: "10:00 AM - 11:00 PM", // Hardcoded as not available in backend
    priceRange: getPriceRange(hallData.price),
    quickStats: [
      { 
        label: "Capacity", 
        value: `${hallData.capacity}`, 
        subtext: "Max guests" 
      },
      { 
        label: "Price", 
        value: `PKR ${(hallData.price / 1000).toFixed(0)}K`, 
        subtext: "Starting from" 
      },
      { 
        label: "Amenities", 
        value: `${hallData.amenities?.length || 0}+`, 
        subtext: "Available" 
      },
    ],
  };

  return (
    <div id="info" className="pt-10 -mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left Section: Basic Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-serif font-bold text-gray-900">
                  {hallDetails.name}
                </h2>
                <div className="flex items-center mt-2 text-sm">
                  <Star className="h-5 w-5 text-yellow-500 mr-1 fill-yellow-500" />
                  <span className="font-semibold text-gray-800">
                    {hallDetails.rating}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600">
                    {hallDetails.reviews} reviews
                  </span>
                  <span className="ml-3 px-2 py-0.5 bg-[#9D2235]/10 text-[#9D2235] rounded-full font-medium">
                    {hallDetails.category}
                  </span>
                </div>
              </div>

          
            </div>

            {/* Key Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-gray-700">
                <Users className="h-5 w-5 text-[#9D2235] mr-3" />
                <span>
                  Capacity:{" "}
                  <span className="font-medium">
                    {hallDetails.capacity.min} - {hallDetails.capacity.max}{" "}
                    guests
                  </span>
                </span>
              </div>

              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 text-[#9D2235] mr-3" />
                <span>{hallDetails.address}</span>
              </div>

              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 text-[#9D2235] mr-3" />
                <span>
                  Timings:{" "}
                  <span className="font-medium">{hallDetails.timings}</span>
                </span>
              </div>
            </div>

            {/* CTA for Mobile - Only for customers */}
            {isCustomer && (
              <div className="mt-6 lg:hidden">
                <motion.a
                  href="#booking"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full py-3 bg-[#FF477E] text-white text-center font-medium rounded-full hover:bg-[#8a1e2f] transition-all"
                >
                  Check Availability
                </motion.a>
              </div>
            )}
          </div>

          {/* Right Section: Quick Stats */}
          <div className="w-full lg:w-auto">
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              {hallDetails.quickStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="bg-gray-50 rounded-xl p-4 text-center"
                >
                  <div className="text-xl md:text-2xl font-bold text-[#9D2235]">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500">{stat.subtext}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA for Desktop - Only for customers */}
            {isCustomer && (
              <div className="hidden lg:block mt-6">
                <motion.a
                  href="#booking"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="block w-full py-3 bg-[#FF477E] text-white text-center font-medium rounded-full hover:bg-[#8a1e2f] transition-all"
                >
                  Check Availability
                </motion.a>
              </div>
            )}
          </div>
        </div>

        {/* Success Rate Bar */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center">
            <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {reviewStats.reviewCount > 0 
                ? `${Math.round((reviewStats.avgRating / 5) * 100)}% of customers recommend this venue`
                : 'No reviews yet'
              }
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ 
                width: reviewStats.reviewCount > 0 
                  ? `${Math.round((reviewStats.avgRating / 5) * 100)}%`
                  : "0%" 
              }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="bg-green-500 h-2.5 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HallInfo;