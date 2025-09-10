import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

interface AboutHallProps {
  hallData: HallData;
}

const faqs = [
  {
    question: "How far in advance should I book the venue?",
    answer:
      "We recommend booking at least 6-12 months in advance for peak wedding seasons (April-June and September-November). For other times, 3-6 months notice is usually sufficient, but availability varies.",
  },
  {
    question: "Can I bring my own catering?",
    answer:
      "While we offer comprehensive in-house catering services, we do allow external catering for specific cultural or dietary requirements. Please note that there is a nominal outside catering fee, and all external caterers must be approved by our management.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "Bookings cancelled more than 90 days before the event receive a 75% refund of the deposit. Cancellations between 30-90 days receive a 50% refund. Unfortunately, we cannot offer refunds for cancellations made less than 30 days before the event date.",
  },
  {
    question: "Is decoration included in the venue price?",
    answer:
      "Basic decoration is included in our standard packages, which includes table settings, chair covers, and basic floral arrangements. For personalized or themed decorations, our in-house decorators can provide custom quotes based on your requirements.",
  },
  {
    question: "Do you have accommodation facilities?",
    answer:
      "While we don't have on-site accommodation, we have partnership arrangements with several nearby hotels offering preferential rates for our clients. Our event planners can help arrange accommodations for your guests.",
  },
];

const AboutHall: React.FC<AboutHallProps> = ({ hallData }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <section id="about" className="pt-10 -mt-10">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* About Section */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-sm font-medium text-[#9D2235] uppercase tracking-wider"
            >
              About Us
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-2 text-3xl font-serif font-bold text-gray-900"
            >
              About {hallData.name}
            </motion.h2>

            <div className="mt-6 space-y-4 text-gray-700">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {hallData.description || `${hallData.name} has been creating memorable celebrations for years. Our venue has hosted numerous successful events including glamorous weddings, corporate galas, and milestone celebrations.`}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Our spacious hall can accommodate up to {hallData.capacity} guests with elegant interiors and state-of-the-art facilities. Located in {hallData.address.city}, {hallData.address.state}, we provide the perfect setting for your special occasions with premium amenities and professional service.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                At {hallData.name}, we pride ourselves on our attention to detail and personalized service. Our team of experienced event professionals works closely with each client to ensure their vision becomes reality, handling everything from initial planning to day-of coordination.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <div className="p-4 bg-[#9D2235]/10 rounded-lg">
                <div className="font-bold text-xl text-[#9D2235]">{hallData.capacity}</div>
                <div className="text-sm text-gray-700">Max Capacity</div>
              </div>

              <div className="p-4 bg-[#9D2235]/10 rounded-lg">
                <div className="font-bold text-xl text-[#9D2235]">{hallData.amenities?.length || 0}+</div>
                <div className="text-sm text-gray-700">Amenities</div>
              </div>

              <div className="p-4 bg-[#9D2235]/10 rounded-lg">
                <div className="font-bold text-xl text-[#9D2235]">{hallData.reviews?.length || 0}</div>
                <div className="text-sm text-gray-700">Reviews</div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-sm font-medium text-[#9D2235] uppercase tracking-wider"
            >
              FAQs
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-2 text-3xl font-serif font-bold text-gray-900"
            >
              Frequently Asked Questions
            </motion.h2>

            <div className="mt-6 space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="border-b border-gray-200 pb-4"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full text-left font-medium text-gray-900 py-2 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedFaq === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-2 pb-3 text-gray-600">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-100"
            >
              <h3 className="font-medium text-gray-900">
                Have more questions?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Contact our event planning team for personalized assistance with
                any queries you may have about our venue or services.
              </p>
              <button onClick={() => navigate('/contact')} className="mt-4 px-4 py-2 bg-[#FF477E] text-white rounded-lg text-sm font-medium hover:bg-[#8a1e2f] transition-colors">
                Contact Us
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AboutHall;
