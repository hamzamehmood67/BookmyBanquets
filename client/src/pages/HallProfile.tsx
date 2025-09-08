import React from 'react';
import HeroGallery from '../components/HallProfile/HeroGallery';
import HallInfo from '../components/HallProfile/HallInfo';
import HallHighlights from '../components/HallProfile/HallHighlights';
import AboutHall from '../components/HallProfile/AboutHall';
import Testimonials from '../components/HallProfile/Testimonials';
import BookingSection from '../components/HallProfile/BookingSection';
import { motion } from 'framer-motion';

const HallProfile: React.FC = () => {
  return (
    <motion.div 
      className="min-h-screen bg-neutral-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      
      <main>
        <HeroGallery />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-8"
        >
          <HallInfo />
          
          <div className="my-12">
            <HallHighlights />
          </div>
          
          <div className="my-12">
            <AboutHall />
          </div>
          
          <div className="my-12">
            <Testimonials />
          </div>
          
          <div className="my-16">
            <BookingSection />
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default HallProfile;