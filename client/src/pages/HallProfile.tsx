import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import HeroGallery from '../components/HallProfile/HeroGallery';
import HallInfo from '../components/HallProfile/HallInfo';
import HallHighlights from '../components/HallProfile/HallHighlights';
import AboutHall from '../components/HallProfile/AboutHall';
import Testimonials from '../components/HallProfile/Testimonials';
import BookingSection from '../components/HallProfile/BookingSection';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

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

const HallProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth(); // Get user from auth context
  const [hallData, setHallData] = useState<HallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = 'http://localhost:3000/api/v1';

  // Check if user is a customer
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    const fetchHallData = async () => {
      if (!id) {
        setError('Hall ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API}/hall/${id}`);
        setHallData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching hall data:', err);
        setError('Failed to load hall details');
      } finally {
        setLoading(false);
      }
    };

    fetchHallData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !hallData) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hall Not Found</h2>
          <p className="text-gray-600">{error || 'The requested hall could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-neutral-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      
      <main>
        <HeroGallery hallData={hallData} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-8"
        >
          <HallInfo hallData={hallData} />
          
          <div className="my-12">
            <HallHighlights hallData={hallData} />
          </div>
          
          <div className="my-12">
            <AboutHall hallData={hallData} />
          </div>
          
          <div className="my-12">
            <Testimonials hallData={hallData} />
          </div>
          
          {/* Only show booking section for customers */}
          {isCustomer && (
            <div className="my-16">
              <BookingSection hallData={hallData} />
            </div>
          )}
          
          {/* Show message for non-customers */}
          {user && !isCustomer && (
            <div className="my-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-[#9D2235]/10 to-[#FF477E]/10 rounded-2xl p-8 text-center border border-[#9D2235]/20"
              >
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                  Hall Manager View
                </h3>
                <p className="text-gray-600 mb-4">
                  You're viewing this hall as a hall manager. Booking functionality is available for customers only.
                </p>
                <div className="text-sm text-[#9D2235] font-medium">
                  Switch to a customer account to make bookings
                </div>
              </motion.div>
            </div>
          )}
          
          {/* Show login prompt for guests */}
          {!user && (
            <div className="my-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-[#9D2235]/10 to-[#FF477E]/10 rounded-2xl p-8 text-center border border-[#9D2235]/20"
              >
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
                  Ready to Book?
                </h3>
                <p className="text-gray-600 mb-6">
                  Please log in or create a customer account to check availability and make a booking.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="/login"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-[#9D2235] text-white rounded-full font-medium hover:bg-[#8a1e2f] transition-all"
                  >
                    Login
                  </motion.a>
                  <motion.a
                    href="/register"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white border-2 border-[#9D2235] text-[#9D2235] rounded-full font-medium hover:bg-[#9D2235] hover:text-white transition-all"
                  >
                    Sign Up
                  </motion.a>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </motion.div>
  );
};

export default HallProfile;