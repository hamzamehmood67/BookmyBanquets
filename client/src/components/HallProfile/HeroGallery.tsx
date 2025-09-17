import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface HeroGalleryProps {
  hallData: HallData;
}

// Fallback images if hall has no images
const fallbackImages = [
  {
    url: "https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg",
    caption: "Elegant Grand Ballroom"
  },
  {
    url: "https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg",
    caption: "Exquisite Dining Experience"
  },
  {
    url: "https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg",
    caption: "Serene Outdoor Ceremony Area"
  },
  {
    url: "https://images.pexels.com/photos/1045541/pexels-photo-1045541.jpeg",
    caption: "Spectacular Evening Events"
  },
  {
    url: "https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg",
    caption: "Luxurious Reception Setup"
  }
];

const HeroGallery: React.FC<HeroGalleryProps> = ({ hallData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState(fallbackImages);

  useEffect(() => {
    // Process hall images from backend
    if (hallData?.imageURLs) {
      const imageUrls = hallData.imageURLs.split(',').filter(url => url.trim());
      if (imageUrls.length > 0) {
        const processedImages = imageUrls.map((url, index) => ({
          url: url.trim(),
          caption: `${hallData.name} - View ${index + 1}`
        }));
        setImages(processedImages);
        // Reset currentIndex if it's out of bounds
        setCurrentIndex(0);
      }
    }
  }, [hallData]);

  useEffect(() => {
    const preloadImages = () => {
      images.forEach((image) => {
        const img = new Image();
        img.src = image.url;
      });
      setLoading(false);
    };
    
    preloadImages();

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [images]); // Add images as dependency

  const goToPrevious = () => {
    if (images.length === 0) return;
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    if (images.length === 0) return;
    setCurrentIndex(prevIndex => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    if (images.length === 0 || index >= images.length) return;
    setCurrentIndex(index);
  };

  return (
    <div className="relative h-[100vh] min-h-[550px] overflow-hidden">
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-16 h-16 border-4 border-[#9D2235] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Gallery Images */}
      {images.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
          <div 
            className="absolute inset-0 bg-center bg-cover" 
            style={{ backgroundImage: `url(${images[currentIndex]?.url || fallbackImages[0].url})` }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-4xl"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-serif font-bold mb-4 text-white drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {hallData.name}
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {images[currentIndex]?.caption || fallbackImages[0].caption}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.a
                href="#booking"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full bg-[#FF477E] text-white font-medium text-lg transition-all hover:bg-[#8a1e2f]"
              >
                Book Now
              </motion.a>
              <motion.a
                href="#info"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium text-lg transition-all hover:bg-white/30"
              >
                Explore
              </motion.a>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-black/50"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button 
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-black/50"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      {images.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentIndex === index ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroGallery;