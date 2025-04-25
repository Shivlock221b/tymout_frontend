import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../styles/HomePage.css';

// Following Single Responsibility Principle - HomePage handles layout and UI
const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);

  // Only hide footer when this component mounts, keep header visible
  useEffect(() => {
    // Add a class to the body to hide the footer but keep header
    document.body.classList.add('homepage-active');
    
    // Add class to make header always look glassy/blurred
    document.body.classList.add('homepage-header-glassy');
    
    // Prepare the local hero images
    const heroImages = [];
    for (let i = 0; i <= 6; i++) {
      heroImages.push(`/hero/hero${i}.jpg`);
    }
    setImages(heroImages);
    setLoading(false);
    
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('homepage-active');
      document.body.classList.remove('homepage-header-glassy');
    };
  }, []);

  // Configuration for the carousel
  const carouselSettings = {
    autoPlay: true,             // Enable autoplay
    interval: 1500,             // Time between slide transitions (ms)
    infiniteLoop: true,         // Loop back to the first slide after the last
    showArrows: false,          // Hide navigation arrows
    showStatus: false,          // Hide status indicator (e.g., "1 of 3")
    showThumbs: false,          // Hide thumbnail navigation
    showIndicators: true,       // Show indicators dots at the bottom
    stopOnHover: false,         // Continue playing even when user hovers
    swipeable: true,            // Allow swiping on touch devices
    emulateTouch: true,         // Allow mouse drag on non-touch devices
    transitionTime: 0,          // Transition speed in ms
    useKeyboardArrows: true     // Allow keyboard navigation
  };

  return (
    <>
      {/* Include header at the top of the page */}
      <Header />
      
      <div className="homepage-fullscreen">
        {loading ? (
          <div className="loading-container">
            {/* Loading state - intentionally empty for clean UI */}
          </div>
        ) : (
          <div className="image-carousel-container">
            <div className="image-carousel-fullscreen">
              {images.length > 0 ? (
                <div className="relative w-full h-full">
                  <Carousel {...carouselSettings}>
                    {images.map((imageUrl, index) => (
                      <div key={index} className="h-full">
                        <img 
                          src={imageUrl} 
                          alt={`Hero image ${index}`} 
                          className="hero-image-fullscreen"
                          style={{ objectFit: 'cover', filter: 'none' }}
                        />
                      </div>
                    ))}
                  </Carousel>
                  
                  {/* Hero text overlay - positioned absolutely on top of the carousel */}
                  <div className="hero-text-overlay absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center z-10">
                    <h1>Real. Together</h1>
                    <h2>Your Chance to make Real connections<br />through curated, local experiences</h2>
                    <div className="hero-buttons">
                      <button className="hero-button login-button" onClick={() => window.location.href = '/login'}>Login</button>
                      <button className="hero-button signup-button" onClick={() => window.location.href = '/signup'}>Signup</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-images">
                  <p>No images available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
