import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, addDays, isWeekend } from "date-fns";
import { Calendar, CheckCircle, Users, Clock, AlertCircle } from "lucide-react";
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

interface BookingSectionProps {
  hallData: HallData;
}

// Mock data for available dates
const unavailableDates = [
  new Date(2025, 5, 15), // June 15, 2025
  new Date(2025, 5, 16),
  new Date(2025, 5, 17),
  new Date(2025, 5, 22),
  new Date(2025, 5, 23),
  new Date(2025, 6, 5), // July 5, 2025
  new Date(2025, 6, 6),
  new Date(2025, 6, 12),
  new Date(2025, 6, 13),
];

// Default time slots (will be updated from backend)
const defaultTimeSlots = [
  { id: "morning", label: "Morning (10:00 AM - 2:00 PM)", available: true },
  { id: "afternoon", label: "Afternoon (3:00 PM - 7:00 PM)", available: true },
  { id: "evening", label: "Evening (7:30 PM - 11:30 PM)", available: true },
];

// Define time slot options with pricing
const getTimeSlotDetails = (slotId: string, basePrice: number) => {
  const slots = {
    morning: {
      label: "Morning (10:00 AM - 2:00 PM)",
      duration: 4,
      priceMultiplier: 0.8
    },
    afternoon: {
      label: "Afternoon (3:00 PM - 7:00 PM)", 
      duration: 4,
      priceMultiplier: 1.0
    },
    evening: {
      label: "Evening (7:30 PM - 11:30 PM)",
      duration: 4,
      priceMultiplier: 1.2
    }
  };
  
  const slot = slots[slotId as keyof typeof slots];
  return {
    ...slot,
    price: Math.round(basePrice * slot.priceMultiplier)
  };
};

const BookingSection: React.FC<BookingSectionProps> = ({ hallData }) => {
  const { user } = useAuth();
  const today = new Date();
  const maxDate = addDays(today, 365); // Allow bookings up to 1 year in advance
  const API = 'http://localhost:3000/api/v1';

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [timeSlots, setTimeSlots] = useState(defaultTimeSlots);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "wedding",
    specialRequests: "",
  });
  const [formStep, setFormStep] = useState(1);

  // Check available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate);
    }
  }, [selectedDate]);

  const checkAvailability = async (date: Date) => {
    setLoading(true);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const response = await axios.get(`${API}/booking/availability`, {
        params: {
          hallId: hallData.hallId,
          date: dateString
        }
      });
      
      if (response.data.status === 'success') {
        setTimeSlots(response.data.availableTimeSlots);
        // Reset selected time slot if it's no longer available
        if (selectedTimeSlot) {
          const selectedSlotAvailable = response.data.availableTimeSlots.find(
            (slot: any) => slot.id === selectedTimeSlot
          )?.available;
          if (!selectedSlotAvailable) {
            setSelectedTimeSlot(null);
          }
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      // Fallback to default time slots
      setTimeSlots(defaultTimeSlots);
    } finally {
      setLoading(false);
    }
  };

  const isDateUnavailable = (date: Date): boolean => {
    return unavailableDates.some(
      (unavailableDate) =>
        unavailableDate.getDate() === date.getDate() &&
        unavailableDate.getMonth() === date.getMonth() &&
        unavailableDate.getFullYear() === date.getFullYear()
    );
  };

  const generateCalendarDays = (): React.ReactNode[] => {
    const days = [];
    const startDate = new Date();

    for (let i = 0; i < 30; i++) {
      const currentDate = addDays(startDate, i);
      const dateString = format(currentDate, "yyyy-MM-dd");
      const formattedDate = format(currentDate, "d");
      const formattedDay = format(currentDate, "EEE");
      const unavailable = isDateUnavailable(currentDate);
      const weekend = isWeekend(currentDate);

      days.push(
        <div
          key={dateString}
          onClick={() => !unavailable && setSelectedDate(currentDate)}
          className={`
            p-3 rounded-lg cursor-pointer text-center transition-all
            ${
              selectedDate && format(selectedDate, "yyyy-MM-dd") === dateString
                ? "bg-[#FF477E] text-white"
                : unavailable
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : weekend
                ? "bg-[#9D2235]/10 hover:bg-[#9D2235]/20"
                : "bg-white hover:bg-gray-50"
            }
            ${unavailable ? "opacity-50" : "opacity-100"}
          `}
        >
          <div className="text-xs font-medium">{formattedDay}</div>
          <div className={`text-lg ${unavailable ? "" : "font-semibold"}`}>
            {formattedDate}
          </div>
          {unavailable && <span className="text-xs block mt-1">Booked</span>}
        </div>
      );
    }

    return days;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuestCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestCount(parseInt(e.target.value) || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select date and time slot');
      return;
    }

    if (!user) {
      alert('Please login to make a booking');
      return;
    }

    setSubmitting(true);

    try {
      const timeSlotDetails = getTimeSlotDetails(selectedTimeSlot, hallData.price);
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please login to make a booking');
        return;
      }

      const bookingData = {
        hallId: hallData.hallId,
        startDate: selectedDate.toISOString(),
        endDate: selectedDate.toISOString(),
        timeSlot: selectedTimeSlot,
        timeSlotLabel: timeSlotDetails.label,
        duration: timeSlotDetails.duration,
        price: timeSlotDetails.price,
        guests: guestCount,
        bookingDetails: JSON.stringify({
          eventType: contactInfo.eventType,
          specialRequests: contactInfo.specialRequests,
          contactName: contactInfo.name,
          contactEmail: contactInfo.email,
          contactPhone: contactInfo.phone,
          timeSlot: selectedTimeSlot,
          timeSlotLabel: timeSlotDetails.label
        }),
        days: 1
      };

      console.log('Booking data to be sent:', bookingData);
      
      const response = await axios.post(`${API}/booking`, bookingData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success') {
        console.log('Booking created:', response.data);
        setFormStep(3);
      }
    } catch (error: any) {
      console.error('Booking failed:', error);
      
      let errorMessage = 'Failed to create booking. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (formStep === 1 && selectedDate && selectedTimeSlot) {
      setFormStep(2);
    }
  };

  const handlePrevStep = () => {
    setFormStep(formStep - 1);
  };

  return (
    <section id="booking" className="pt-10 -mt-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6 md:p-8 bg-[#FF477E]">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-serif font-bold text-white"
          >
            Book Your Special Day
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-white/90"
          >
            Check availability and reserve your date at {hallData.name}
          </motion.p>
        </div>

        <div className="p-6 md:p-8">
          {/* Booking Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full ${
                  formStep >= 1 ? "bg-[#FF477E]" : "bg-gray-200"
                } flex items-center justify-center text-white font-medium`}
              >
                1
              </div>
              <div
                className={`h-1 flex-1 mx-2 ${
                  formStep >= 2 ? "bg-[#FF477E]" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full ${
                  formStep >= 2 ? "bg-[#FF477E]" : "bg-gray-200"
                } flex items-center justify-center text-white font-medium`}
              >
                2
              </div>
              <div
                className={`h-1 flex-1 mx-2 ${
                  formStep >= 3 ? "bg-[#FF477E]" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full ${
                  formStep >= 3 ? "bg-[#FF477E]" : "bg-gray-200"
                } flex items-center justify-center text-white font-medium`}
              >
                3
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Date Selection</span>
              <span>Details</span>
              <span>Confirmation</span>
            </div>
          </div>

          {formStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-[#FF477E] mr-2" />
                  Select Your Date
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
                    {generateCalendarDays()}
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#9D2235]/10 mr-2"></div>
                      <span>Weekend</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gray-100 opacity-50 mr-2"></div>
                      <span>Unavailable</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-[#FF477E] mr-2"></div>
                      <span>Selected</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDate && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Clock className="h-5 w-5 text-[#9D2235] mr-2" />
                    Select Time Slot
                    {loading && (
                      <div className="ml-2 w-4 h-4 border-2 border-[#9D2235] border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </h3>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        onClick={() =>
                          slot.available && setSelectedTimeSlot(slot.id)
                        }
                        className={`
                          p-4 rounded-lg border transition-all cursor-pointer
                          ${
                            !slot.available
                              ? "bg-gray-50 border-gray-200 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300"
                          }
                          ${
                            selectedTimeSlot === slot.id
                              ? "border-[#FF477E] bg-[#9D2235]/5"
                              : ""
                          }
                        `}
                      >
                        <div className="flex justify-between mb-1">
                          <span
                            className={`font-medium ${
                              !slot.available
                                ? "text-gray-400"
                                : "text-gray-800"
                            }`}
                          >
                            {slot.label}
                          </span>
                          {!slot.available && (
                            <span className="text-xs bg-gray-200 rounded px-2 py-0.5 text-gray-600">
                              Booked
                            </span>
                          )}
                        </div>

                        {!slot.available && (
                          <p className="text-xs text-gray-500 mt-1">
                            This time slot is not available on{" "}
                            {format(selectedDate, "MMMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <div></div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextStep}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className={`
                    px-6 py-3 rounded-lg font-medium 
                    ${
                      !selectedDate || !selectedTimeSlot
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#FF477E] text-white"
                    }
                  `}
                >
                  Continue to Details
                </motion.button>
              </div>
            </motion.div>
          )}

          {formStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Selected Date & Time
                  </h3>
                  <div className="bg-[#9D2235]/5 p-4 rounded-lg flex items-center">
                    <CheckCircle className="h-5 w-5 text-[#FF477E] mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {
                          timeSlots.find((slot) => slot.id === selectedTimeSlot)
                            ?.label
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Booking Summary
                  </h3>
                  <div className="bg-[#9D2235]/5 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Date:</span>
                        <p className="font-medium">{selectedDate && format(selectedDate, "MMMM d, yyyy")}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Time:</span>
                        <p className="font-medium">{timeSlots.find(slot => slot.id === selectedTimeSlot)?.label}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Duration:</span>
                        <p className="font-medium">{selectedTimeSlot ? getTimeSlotDetails(selectedTimeSlot, hallData.price).duration : 0} hours</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Price:</span>
                        <p className="font-medium text-[#9D2235]">
                          PKR {selectedTimeSlot ? getTimeSlotDetails(selectedTimeSlot, hallData.price).price.toLocaleString() : hallData.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={contactInfo.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9D2235] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={contactInfo.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={contactInfo.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="eventType"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Event Type *
                        </label>
                        <select
                          id="eventType"
                          name="eventType"
                          value={contactInfo.eventType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                        >
                          <option value="wedding">Wedding</option>
                          <option value="reception">Wedding Reception</option>
                          <option value="engagement">Engagement</option>
                          <option value="birthday">Birthday Celebration</option>
                          <option value="corporate">Corporate Event</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="guestCount"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Expected Guest Count *
                        </label>
                        <input
                          type="number"
                          id="guestCount"
                          name="guestCount"
                          value={guestCount}
                          onChange={handleGuestCountChange}
                          min="1"
                          max={hallData.capacity}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9D2235] focus:border-transparent"
                          placeholder={`Enter number of guests (max: ${hallData.capacity})`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum capacity: {hallData.capacity} guests
                        </p>
                      </div>
                  </div>
                  
                  <div className="mt-6">
                    <label
                      htmlFor="specialRequests"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Special Requests or Notes
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={contactInfo.specialRequests}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9D2235] focus:border-transparent"
                      placeholder="Any specific requirements or additional information we should know?"
                    ></textarea>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-8 flex">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">
                      Booking is subject to confirmation
                    </p>
                    <p className="mt-1">
                      This reservation request will be reviewed by our team.
                      We'll contact you within 24 hours to confirm availability
                      and process your booking.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Back to Date Selection
                  </button>

                  <motion.button
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    type="submit"
                    disabled={
                      submitting ||
                      !contactInfo.name ||
                      !contactInfo.email ||
                      !contactInfo.phone ||
                      guestCount < 1 ||
                      guestCount > hallData.capacity
                    }
                    className={`
                      px-6 py-3 rounded-lg font-medium flex items-center gap-2
                      ${
                        submitting ||
                        !contactInfo.name ||
                        !contactInfo.email ||
                        !contactInfo.phone ||
                        guestCount < 1 ||
                        guestCount > hallData.capacity
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#9D2235] text-white hover:bg-[#8a1e2f]"
                      }
                    `}
                  >
                    {submitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {submitting ? 'Submitting...' : 'Submit Booking Request'}
                  </motion.button>
                </div>
                </div>
              </form>
            </motion.div>
          )}

          {formStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="py-8"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Booking Request Received!
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Thank you for your booking request. Our team will review your
                  request and contact you within 24 hours to confirm your
                  reservation.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 max-w-lg mx-auto mb-8">
                  <h4 className="font-semibold text-gray-800 mb-4">
                    Booking Summary
                  </h4>

                  <div className="space-y-3 text-left">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {
                          timeSlots.find((slot) => slot.id === selectedTimeSlot)
                            ?.label
                        }
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {selectedTimeSlot ? getTimeSlotDetails(selectedTimeSlot, hallData.price).duration : 0} hours
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Count:</span>
                      <span className="font-medium">{guestCount} guests</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Type:</span>
                      <span className="font-medium capitalize">{contactInfo.eventType}</span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="text-gray-600">Total Price:</span>
                      <span className="font-bold text-[#9D2235]">
                        PKR {selectedTimeSlot ? getTimeSlotDetails(selectedTimeSlot, hallData.price).price.toLocaleString() : hallData.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="text-gray-600">Reference Number:</span>
                      <span className="font-medium">
                        BK
                        {Math.floor(Math.random() * 10000)
                          .toString()
                          .padStart(4, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormStep(1)}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Make Another Booking
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-[#9D2235] rounded-lg font-medium text-white"
                  >
                    Contact Support
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default BookingSection;
