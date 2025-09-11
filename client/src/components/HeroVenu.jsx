import { useState } from "react";
import { FiCalendar, FiMapPin, FiUsers, FiSearch } from "react-icons/fi";
import DatePicker from "react-datepicker";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [guestCount, setGuestCount] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Store search criteria in localStorage
    const searchCriteria = {
      location: location.trim(),
      eventDate: eventDate ? eventDate.toISOString() : null,
      guestCount: guestCount || null,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('searchCriteria', JSON.stringify(searchCriteria));
    
    // Navigate to search results page
    navigate('/search');
  };

  return (
    <section
      className="relative h-screen min-h-[600px] flex items-center justify-center bg-cover bg-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=1920)",
      }}
    >
      <div className="container-custom text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Find Your Perfect{" "}
            <span className="text-gold-500">Banquet Hall</span>
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
            Discover and book the most stunning banquet halls and event spaces
            for your special occasions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg"
        >
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMapPin className="text-gray-300" />
              </div>
              <input
                type="text"
                placeholder="Where?"
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="text-gray-300" />
              </div>
              <DatePicker
                selected={eventDate}
                onChange={(date) => setEventDate(date)}
                placeholderText="When?"
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                wrapperClassName="w-full"
                calendarClassName="bg-white text-navy-800"
                minDate={new Date()}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUsers className="text-gray-300" />
              </div>
              <input
                type="number"
                placeholder="Guests"
                className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                min="1"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary  font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <FiSearch className="mr-2" />
              Search
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-12 flex flex-wrap justify-center gap-6"
        >
          <div className="flex items-center">
            <span className="bg-[#FF477E] p-2 rounded-full">
              <FiMapPin className="h-5 w-5  text-white" />
            </span>
            <span className="ml-2">500+ Venues</span>
          </div>
          <div className="flex items-center">
            <span className="bg-[#FF477E] p-2 rounded-full">
              <FiUsers className="h-5 w-5  text-white" />
            </span>
            <span className="ml-2">10,000+ Happy Customers</span>
          </div>
          <div className="flex items-center">
            <span className="bg-[#FF477E] p-2 rounded-full">
              <FiCalendar className="h-5 w-5    text-white" />
            </span>
            <span className="ml-2">Instant Booking</span>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/40 to-transparent"></div>
    </section>
  );
};

export default Hero;
