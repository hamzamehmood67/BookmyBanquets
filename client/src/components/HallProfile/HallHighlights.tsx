import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Music, Wifi, ParkingCircle, Sparkles, Camera, Wine, UserCheck, CircleDollarSign, ShieldCheck, Star, CheckCircle, Heart, Coffee, Phone, Car } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

interface HallHighlightsProps {
  hallData: HallData;
}

// Icon mapping for common amenity types
const getAmenityIcon = (name: string) => {
  const iconName = name.toLowerCase();
  
  if (iconName.includes('catering') || iconName.includes('food') || iconName.includes('kitchen')) {
    return <Utensils className="h-6 w-6" />;
  }
  if (iconName.includes('sound') || iconName.includes('music') || iconName.includes('audio')) {
    return <Music className="h-6 w-6" />;
  }
  if (iconName.includes('wifi') || iconName.includes('internet') || iconName.includes('network')) {
    return <Wifi className="h-6 w-6" />;
  }
  if (iconName.includes('parking') || iconName.includes('valet')) {
    return <ParkingCircle className="h-6 w-6" />;
  }
  if (iconName.includes('decor') || iconName.includes('decoration')) {
    return <Sparkles className="h-6 w-6" />;
  }
  if (iconName.includes('photo') || iconName.includes('camera') || iconName.includes('video')) {
    return <Camera className="h-6 w-6" />;
  }
  if (iconName.includes('bar') || iconName.includes('wine') || iconName.includes('alcohol')) {
    return <Wine className="h-6 w-6" />;
  }
  if (iconName.includes('planner') || iconName.includes('coordinator') || iconName.includes('manager')) {
    return <UserCheck className="h-6 w-6" />;
  }
  if (iconName.includes('price') || iconName.includes('flexible') || iconName.includes('package')) {
    return <CircleDollarSign className="h-6 w-6" />;
  }
  if (iconName.includes('security') || iconName.includes('safe') || iconName.includes('secure')) {
    return <ShieldCheck className="h-6 w-6" />;
  }
  if (iconName.includes('coffee') || iconName.includes('tea') || iconName.includes('refreshment')) {
    return <Coffee className="h-6 w-6" />;
  }
  if (iconName.includes('phone') || iconName.includes('communication')) {
    return <Phone className="h-6 w-6" />;
  }
  if (iconName.includes('transport') || iconName.includes('car') || iconName.includes('vehicle')) {
    return <Car className="h-6 w-6" />;
  }
  
  // Default icons for common amenity categories
  return <Star className="h-6 w-6" />;
};

// Fallback features if no amenities from backend
const fallbackFeatures = [
  {
    icon: <Utensils className="h-6 w-6" />,
    title: "In-house Catering",
    description: "Gourmet cuisine with customizable menus for any occasion or dietary need."
  },
  {
    icon: <Music className="h-6 w-6" />,
    title: "Sound System",
    description: "State-of-the-art audio equipment with professional sound engineering."
  },
  {
    icon: <Wifi className="h-6 w-6" />,
    title: "High-speed WiFi",
    description: "Complimentary high-speed internet access throughout the venue."
  },
  {
    icon: <ParkingCircle className="h-6 w-6" />,
    title: "Valet Parking",
    description: "Complimentary valet parking service with 200+ parking spaces."
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Decor Services",
    description: "Professional decoration services to transform the space for your event."
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Safe & Secure",
    description: "24/7 security with CCTV surveillance and emergency protocols."
  }
];

const HallHighlights: React.FC<HallHighlightsProps> = ({ hallData }) => {
  const { user } = useAuth(); // Get user from auth context
  
  // Check if user is a customer
  const isCustomer = user?.role === 'customer';
  
  // Process amenities from backend or use fallback
  const features = hallData.amenities && hallData.amenities.length > 0 
    ? hallData.amenities.map(amenityHall => ({
        icon: getAmenityIcon(amenityHall.amenity.name),
        title: amenityHall.amenity.name,
        description: amenityHall.amenity.description || `Experience our premium ${amenityHall.amenity.name.toLowerCase()} service.`
      }))
    : fallbackFeatures;

  return (
    <section id="highlights" className="pt-10 -mt-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-12">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-medium text-[#9D2235] uppercase tracking-wider"
          >
            Hall Highlights
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-serif font-bold text-gray-900"
          >
            Premium Amenities & Services
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-gray-600"
          >
            Everything you need for a perfect event is available at {hallData.name}. Our comprehensive amenities ensure your special day is flawless.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#9D2235]/10 flex items-center justify-center text-[#9D2235] mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Show booking CTA only for customers */}
        {isCustomer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <a 
              href="#booking" 
              className="inline-flex items-center text-[#9D2235] font-medium hover:underline"
            >
              <span>Book now to secure these amenities</span>
              <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default HallHighlights;