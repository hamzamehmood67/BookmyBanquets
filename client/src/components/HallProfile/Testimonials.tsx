import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight, Edit3, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

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
  
  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comment: ''
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  
  // Check if user is a customer
  const isCustomer = user?.role === 'customer';
  
  const API = 'http://13.53.187.108:3000/api/v1';

  // Function to fetch latest reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/hall/${hallData.hallId}/reviews`);
      const reviews = response.data?.data || response.data || [];
      
      if (reviews.length > 0) {
        const processedReviews = reviews.map((review: any, index: number) => ({
          id: review.reviewId || index + 1,
          name: review.user?.name || "Anonymous Customer",
          date: "Recent", // Since we don't have date in review schema
          event: "Verified Customer", // Since we don't have event type in review schema
          rating: review.rating || 5,
          image: `https://images.pexels.com/photos/${3760511 + index}/pexels-photo-${3760511 + index}.jpeg?auto=compress&cs=tinysrgb&w=120`, // Generate placeholder images
          text: review.comment || "",
        }));
        setTestimonials(processedReviews);
        // Reset active index if it's out of bounds
        if (activeIndex >= processedReviews.length) {
          setActiveIndex(0);
        }
      } else {
        // Use fallback testimonials if no reviews
        setTestimonials(fallbackTestimonials);
        setActiveIndex(0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Use fallback testimonials on error
      setTestimonials(fallbackTestimonials);
      setActiveIndex(0);
    }
  };

  useEffect(() => {
    // Process reviews from backend
    if (hallData.reviews && hallData.reviews.length > 0) {
      const processedReviews = hallData.reviews.map((review, index) => ({
        id: index + 1,
        name: review.user?.name || "Anonymous Customer",
        date: "Recent", // Since we don't have date in review schema
        event: "Verified Customer", // Since we don't have event type in review schema
        rating: review.rating || 5,
        image: `https://images.pexels.com/photos/${3760511 + index}/pexels-photo-${3760511 + index}.jpeg?auto=compress&cs=tinysrgb&w=120`, // Generate placeholder images
        text: review.comment || "",
      }));
      setTestimonials(processedReviews);
      // Reset active index if it's out of bounds
      if (activeIndex >= processedReviews.length) {
        setActiveIndex(0);
      }
    } else {
      // Fetch reviews separately if not included in hall data
      fetchReviews();
    }
  }, [hallData.reviews, hallData.hallId]);

  // Handle activeIndex bounds when testimonials array changes
  useEffect(() => {
    if (testimonials.length > 0 && activeIndex >= testimonials.length) {
      setActiveIndex(0);
    }
  }, [testimonials.length, activeIndex]);

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

  const openReviewModal = () => {
    setIsReviewModalOpen(true);
    setReviewData({ rating: 0, comment: '' });
    setReviewError('');
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewData({ rating: 0, comment: '' });
    setReviewError('');
  };

  const handleRatingClick = (rating: number) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      setReviewError('You must be logged in to submit a review');
      return;
    }

    if (reviewData.rating === 0) {
      setReviewError('Please select a rating');
      return;
    }

    if (!reviewData.comment.trim()) {
      setReviewError('Please write a comment');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setReviewError('Authentication required. Please log in again.');
        return;
      }

      const response = await axios.post(
        `${API}/hall/${hallData.hallId}/review`,
        {
          rating: reviewData.rating,
          comment: reviewData.comment.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Success - close modal and refresh reviews
        closeReviewModal();
        
        // Refresh reviews to show the new review
        await fetchReviews();
        
        // Show success message (you might want to add a toast notification here)
        console.log('Review submitted successfully!');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      if (error.response?.status === 403) {
        setReviewError('You must book this hall to leave a review');
      } else if (error.response?.status === 401) {
        setReviewError('Authentication required. Please log in again.');
      } else {
        setReviewError(
          error.response?.data?.message || 
          'Failed to submit review. Please try again.'
        );
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 8000);

    return () => clearInterval(interval);
  }, [autoplay, activeIndex]);

  if (testimonials.length === 0 || !testimonials[activeIndex]) {
    return null; // Don't render if no testimonials or current testimonial is invalid
  }

  // Safety check for current testimonial
  const currentTestimonial = testimonials[activeIndex];
  if (!currentTestimonial) {
    return null;
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
          
          {/* Write Review Button for Customers */}
          {isCustomer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6"
            >
              <button
                onClick={openReviewModal}
                className="inline-flex items-center px-6 py-3 bg-[#FF477E] text-white rounded-full font-medium hover:bg-[#8a1e2f] transition-all transform hover:scale-105"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                Write a Review
              </button>
            </motion.div>
          )}
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
                        {currentTestimonial.name?.charAt(0) || 'A'}
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
                            i < (currentTestimonial.rating || 0)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 text-lg mb-6">
                      "{currentTestimonial.text || ''}"
                    </p>

                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {currentTestimonial.name || 'Anonymous Customer'}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
                        <span>{currentTestimonial.event || 'Verified Customer'}</span>
                        <span>•</span>
                        <span>{currentTestimonial.date || 'Recent'}</span>
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

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg w-full mx-4"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#9D2235] to-[#FF477E] relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Write a Review</h3>
                </div>
                <button
                  onClick={closeReviewModal}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-white/90 text-sm mt-1 ml-11">
                Share your experience at {hallData.name}
              </p>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6">
              {reviewError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{reviewError}</p>
                </div>
              )}

              {/* Rating Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      className="p-1 transition-all hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`${
                          star <= reviewData.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300 hover:text-yellow-300"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                {reviewData.rating > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {reviewData.rating === 1 && "Poor"}
                    {reviewData.rating === 2 && "Fair"}
                    {reviewData.rating === 3 && "Good"}
                    {reviewData.rating === 4 && "Very Good"}
                    {reviewData.rating === 5 && "Excellent"}
                  </p>
                )}
              </div>

              {/* Comment Section */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us about your experience
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9D2235] focus:border-transparent resize-none"
                  placeholder="Share details about your event, the service, food quality, ambiance, and overall experience..."
                  maxLength={500}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Help other customers by sharing your honest feedback
                  </p>
                  <p className="text-xs text-gray-400">
                    {reviewData.comment.length}/500
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeReviewModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmittingReview}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  disabled={isSubmittingReview || reviewData.rating === 0 || !reviewData.comment.trim()}
                  className="px-6 py-2 bg-[#9D2235] text-white rounded-lg hover:bg-[#8a1e2f] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;