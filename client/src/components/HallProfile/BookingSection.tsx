import React, { useState } from "react";
import { motion } from "framer-motion";
import { format, addDays, isWeekend } from "date-fns";
import { Calendar, CheckCircle, Users, Clock, AlertCircle } from "lucide-react";

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

// Available time slots
const timeSlots = [
  { id: "morning", label: "Morning (10:00 AM - 2:00 PM)", available: true },
  { id: "afternoon", label: "Afternoon (3:00 PM - 7:00 PM)", available: true },
  { id: "evening", label: "Evening (7:30 PM - 11:30 PM)", available: false },
];

// Generate package options based on hall data
const generatePackageOptions = (hallData: HallData) => [
  {
    id: "basic",
    name: "Essential Package",
    price: `PKR ${Math.round(hallData.price * 0.8 / 1000)}K`,
    features: [
      "Hall rental for 4 hours",
      "Basic decor setup",
      "Sound system",
      `Tables and chairs for up to ${Math.round(hallData.capacity * 0.6)} guests`,
      "Basic lighting setup",
      "Parking for 100 vehicles",
    ],
  },
  {
    id: "premium",
    name: "Premium Package",
    price: `PKR ${Math.round(hallData.price / 1000)}K`,
    features: [
      "Hall rental for 6 hours",
      "Premium decor with floral arrangements",
      "Sound system with DJ",
      `Tables and chairs for up to ${Math.round(hallData.capacity * 0.8)} guests`,
      "Advanced lighting with custom colors",
      "Valet parking for 150 vehicles",
      `Basic food menu for ${Math.round(hallData.capacity * 0.8)} guests`,
    ],
  },
  {
    id: "luxury",
    name: "Royal Package",
    price: `PKR ${Math.round(hallData.price * 1.4 / 1000)}K`,
    features: [
      "Hall rental for 8 hours",
      "Luxury decor with premium flowers",
      "Professional sound system with DJ and MC",
      `Premium seating for up to ${hallData.capacity} guests`,
      "Premium lighting with special effects",
      "Valet parking for 200 vehicles",
      `Premium food menu for ${hallData.capacity} guests`,
      "Complimentary honeymoon suite",
      "Photography and videography",
    ],
  },
];

const BookingSection: React.FC<BookingSectionProps> = ({ hallData }) => {
  const today = new Date();
  const maxDate = addDays(today, 365); // Allow bookings up to 1 year in advance

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<string>(`100-${Math.min(200, hallData.capacity)}`);
  const packageOptions = generatePackageOptions(hallData);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "wedding",
    specialRequests: "",
  });
  const [formStep, setFormStep] = useState(1);

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

  const handleGuestCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGuestCount(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the form submission to your backend
    console.log({
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      packageOption: selectedPackage,
      guestCount,
      ...contactInfo,
    });

    // Move to confirmation step
    setFormStep(3);
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
                    <Clock className="h-5 w-5 text-[#FF477E] mr-2" />
                    Select Time Slot
                  </h3>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Contact Information
                    </h3>

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
                        <select
                          id="guestCount"
                          name="guestCount"
                          value={guestCount}
                          onChange={handleGuestCountChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                        >
                          <option value="50-100">50-100 guests</option>
                          <option value={`100-${Math.min(200, hallData.capacity)}`}>100-{Math.min(200, hallData.capacity)} guests</option>
                          {hallData.capacity > 200 && <option value={`200-${Math.min(300, hallData.capacity)}`}>200-{Math.min(300, hallData.capacity)} guests</option>}
                          {hallData.capacity > 300 && <option value={`300-${Math.min(400, hallData.capacity)}`}>300-{Math.min(400, hallData.capacity)} guests</option>}
                          {hallData.capacity > 400 && <option value={`400-${hallData.capacity}`}>400-{hallData.capacity} guests</option>}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Select Package
                    </h3>

                    <div className="space-y-4">
                      {packageOptions.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg.id)}
                          className={`
                            border rounded-lg p-4 cursor-pointer transition-all
                            ${
                              selectedPackage === pkg.id
                                ? "border-[#FF477E] bg-[#9D2235]/5"
                                : "border-gray-200 hover:border-gray-300"
                            }
                          `}
                        >
                          <div className="flex justify-between">
                            <h4 className="font-semibold text-gray-800">
                              {pkg.name}
                            </h4>
                            <span className="font-medium text-[#FF477E]">
                              {pkg.price}
                            </span>
                          </div>

                          <ul className="mt-3 space-y-1">
                            {pkg.features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-start text-sm text-gray-600"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
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
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF477E] focus:border-transparent"
                        placeholder="Any specific requirements or additional information we should know?"
                      ></textarea>
                    </div>
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={
                      !contactInfo.name ||
                      !contactInfo.email ||
                      !contactInfo.phone ||
                      !selectedPackage
                    }
                    className={`
                      px-6 py-3 rounded-lg font-medium 
                      ${
                        !contactInfo.name ||
                        !contactInfo.email ||
                        !contactInfo.phone ||
                        !selectedPackage
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#FF477E] text-white"
                      }
                    `}
                  >
                    Submit Booking Request
                  </motion.button>
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
                      <span className="text-gray-600">Package:</span>
                      <span className="font-medium">
                        {
                          packageOptions.find(
                            (pkg) => pkg.id === selectedPackage
                          )?.name
                        }
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Count:</span>
                      <span className="font-medium">{guestCount} guests</span>
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
                    className="px-6 py-3 bg-[#FF477E] rounded-lg font-medium text-white"
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
