import { useEffect, useState } from "react";
import Slider from "react-slick";
import { FiStar, FiMapPin, FiUsers, FiHeart, FiClock } from "react-icons/fi";
import { motion } from "framer-motion";
import axios from "axios";

const API = "http://13.53.187.108:3000/api/v1";

const firstImage = (imageURLs) => {
  if (!imageURLs) return "/placeholder.svg?height=300&width=500";
  if (Array.isArray(imageURLs)) return imageURLs[0] || "/placeholder.svg?height=300&width=500";
  const first = String(imageURLs)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)[0];
  return first || "/placeholder.svg?height=300&width=500";
};

const pkr = (n) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n || 0);

const FeaturedVenues = () => {
  const [favoriteVenues, setFavoriteVenues] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleFavorite = (venueId) => {
    setFavoriteVenues((prev) =>
      prev.includes(venueId) ? prev.filter((id) => id !== venueId) : [...prev, venueId]
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        // If your route name differs, adjust here (e.g. /hall/public/list)
        const { data } = await axios.get(`${API}/hall`);

        // Accept {venues:[...]} or {halls:[...]} or raw array
        const rows = Array.isArray(data) ? data : (data?.venues ?? data?.halls ?? []);

        // Sort newest first if backend provides createdAt; otherwise keep order
        const sorted = [...rows].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });

        const latestFive = sorted.slice(0, 5);

        const mapped = latestFive.map((h) => ({
          id: h.id || h.hallId,
          name: h.name,
          location: h.location ?? (h.address ? `${h.address.city ?? ""}, ${h.address.state ?? ""}` : ""),
          image: firstImage(h.image ?? h.imageURLs),
          price: pkr(h.price),
          capacity: `${h.capacity} guests`,
          rating: Number(h.rating ?? 0),
          reviewCount: Number(h.reviewCount ?? 0),
          featured: true, // latest five are marked as featured
        }));

        setVenues(mapped);
      } catch (e) {
        console.error("Failed to load featured venues:", e);
        setVenues([]); // empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section id="venues" className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Featured Banquet Halls</h2>
          <p className="section-subtitle mx-auto">
            Discover our handpicked selection of the latest and most exquisite venues
          </p>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-[#FF477E] animate-spin" />
          </div>
        ) : venues.length === 0 ? (
          <div className="py-16 text-center text-gray-600">No featured venues available right now.</div>
        ) : (
          <Slider {...sliderSettings} className="featured-venues-slider">
            {venues.map((venue) => (
              <div key={venue.id} className="px-3 pb-6">
                <motion.div className="venue-card h-full" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                  <div className="relative">
                    <img src={venue.image} alt={venue.name} className="w-full h-64 object-cover" />
                    <button
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                      onClick={() => toggleFavorite(venue.id)}
                    >
                      <FiHeart
                        className={`h-5 w-5 ${
                          favoriteVenues.includes(venue.id) ? "text-red-500 fill-red-500" : "text-gray-400"
                        }`}
                      />
                    </button>
                    {venue.featured && (
                      <div className="absolute top-4 left-4 bg-gold-500 px-3 py-1 text-xs font-semibold text-white rounded-full">
                        Featured
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-navy-800">{venue.name}</h3>
                      <div className="flex items-center">
                        <FiStar className="text-gold-500 mr-1" />
                        <span className="text-sm font-medium">{venue.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({venue.reviewCount})</span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-500 mb-4">
                      <FiMapPin className="mr-1" />
                      <span className="text-sm">{venue.location}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-navy-500">
                        <FiUsers className="mr-1" />
                        <span className="text-sm">{venue.capacity}</span>
                      </div>
                      <div className="flex items-center text-navy-500">
                        <FiClock className="mr-1" />
                        <span className="text-sm">Available Now</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-navy-800">
                        <span className="font-semibold text-lg">{venue.price}</span>
                        <span className="text-gray-500 text-sm"> / day</span>
                      </div>
                      <a href={`/hall/${venue.id}`} className="btn-outline text-sm py-2">
                        View Details
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        )}

        <div className="text-center mt-12">
          <a href="venues" className="btn-primary">
            View All Venues
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVenues;
