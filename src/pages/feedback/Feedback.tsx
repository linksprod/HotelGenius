
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { useHotelConfig } from '@/hooks/useHotelConfig';

// Import the new components
import HeroSection from './components/HeroSection';
import FeedbackForm from './components/FeedbackForm';
import TripAdvisorSection from './components/TripAdvisorSection';
import FAQSection from './components/FAQSection';
import ContactCard from './components/ContactCard';

const Feedback = () => {
  const { t } = useTranslation();
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
  const { config, isLoading } = useHotelConfig();

  // Scroll to top when page is accessed
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load the hero image from the configuration
  useEffect(() => {
    console.log("Config loaded:", config);
    if (config && config.feedback_hero_image && config.feedback_hero_image.trim() !== '') {
      console.log("Setting hero image to:", config.feedback_hero_image);
      setHeroImage(config.feedback_hero_image);
    }
  }, [config]);

  // Log for debugging
  useEffect(() => {
    console.log("Current heroImage state in Feedback page:", heroImage);
  }, [heroImage]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with key to force re-render when image changes */}
        <HeroSection key={heroImage} heroImage={heroImage} />

        {/* Feedback Form */}
        <FeedbackForm />

        {/* TripAdvisor Integration Section */}
        <TripAdvisorSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Contact Card */}
        <ContactCard />
      </div>
    </Layout>
  );
};

export default Feedback;
