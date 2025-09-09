import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
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

interface TestimonialsProps {
  hallData: HallData;
}

// Fallback testimonials if no reviews from backend
const fallbackTestimonials = [
  {
    id: 1,
    name: "Priya & Rahul Sharma",
    date: "June 2024",
    event: "Wedding Reception",
    rating: 5,
    image: "https://images.pexels.com/photos/3760511/pexels-photo-3760511.jpeg?auto=compress&cs=tinysrgb&w=120",
    text: "Our wedding reception was nothing short of magical. The staff went above and beyond to accommodate our requests. The venue looked stunning with their custom lighting, and our guests are still talking about the amazing food. Truly a perfect experience!",
  },
  {
    id: 2,
    name: "Neha & Vikram Malhotra",
    date: "April 2024",
    event: "Engagement Ceremony",
    rating: 5,
    image: "https://images.pexels.com/photos/5082976/pexels-photo-5082976.jpeg?auto=compress&cs=tinysrgb&w=120",
    text: "We had our engagement ceremony here and everything was flawless. The event coordinator helped us plan every detail. The decor was elegant, the food was exceptional, and the staff was incredibly attentive. We've already booked the venue for our wedding!",
  },
  {
    id: 3,
    name: "Ananya & Dev Patel",
    date: "March 2024",
    event: "Wedding & Reception",
    rating: 4,
    image: "https://images.pexels.com/photos/5082965/pexels-photo-5082965.jpeg?auto=compress&cs=tinysrgb&w=120",
    text: "We hosted both our wedding ceremony and reception here. The transitions between events were seamless, and they helped us create two completely different atmospheres in the same space. The only minor issue was parking during peak hours, but the staff handled it professionally.",
  },
];

const Testimonials: React.FC<TestimonialsProps> = ({ hallData }) => {
  const { user } = useAuth(); // Get user from auth context
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  
  // Check if user is a customer
  const isCustomer = user?.role === 'customer';

  useEffect(() => {
    // Process reviews from backend
    if (hallData.reviews && hallData.reviews.length > 0) {
      const processedReviews = hallData.reviews.map((review, index) => ({
        id: index + 1,
        name: review.user?.name || "Anonymous Customer",
        date: "Recent", // Since we don't have date in review schema
        event: "Event", // Since we don't have event type in review schema
        rating: review.rating,
        image: `https://images.pexels.com/photos/${3760511 + index}/pexels-photo-${3760511 + index}.jpeg?auto=compress&cs=tinysrgb&w=120`, // Generate placeholder images
        text: review.comment,
      }));
      setTestimonials(processedReviews);
    }
  }, [hallData.reviews]);

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 8000);

    return () => clearInterval(interval);
  }, [autoplay, activeIndex]);

  if (testimonials.length === 0) {
    return null; // Don't render if no testimonials
  }

  return (
    <section id="testimonials" className="pt-10 -mt-10">
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
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-serif font-bold text-gray-900"
          >
            What Our Clients Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 max-w-2xl mx-auto text-gray-600"
          >
            Read reviews from couples who celebrated their special occasions at {hallData.name}.
          </motion.p>
        </div>

        <div className="relative">
          <div
            className="absolute -left-4 top-1/2 -translate-y-1/2"
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div
            className="absolute -right-4 top-1/2 -translate-y-1/2"
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div
            className="px-8 overflow-hidden"
            onMouseEnter={() => setAutoplay(false)}
            onMouseLeave={() => setAutoplay(true)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-lg p-8 md:p-10 relative"
              >
                <div className="absolute top-10 right-10 text-[#9D2235]/10">
                  <Quote size={80} />
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                  {/* Left - Profile */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#9D2235] to-[#FF477E] flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {testimonials[activeIndex].name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Right - Content */}
                  <div className="flex-1">
                    <div className="flex mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          className={`${
                            i < testimonials[activeIndex].rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 text-lg mb-6">
                      "{testimonials[activeIndex].text}"
                    </p>

                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {testimonials[activeIndex].name}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
                        <span>{testimonials[activeIndex].event}</span>
                        <span>•</span>
                        <span>{testimonials[activeIndex].date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index);
                setAutoplay(false);
                setTimeout(() => setAutoplay(true), 10000);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeIndex === index ? "bg-[#9D2235] w-8" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Show booking CTA only for customers */}
        {isCustomer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-10 text-center"
          >
            <a
              href="#booking"
              className="inline-flex items-center text-[#9D2235] font-medium hover:underline"
            >
              <span>Ready to create your own memorable experience?</span>
              <svg
                className="ml-1 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </a>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default Testimonials;