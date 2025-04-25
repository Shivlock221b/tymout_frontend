import React from 'react';
import Header from '../../components/layout/Header';
import '../../styles/InfoPages.css';

// Following Single Responsibility Principle - AboutPage only handles display of about information
const AboutPage = () => {
  return (
    <div className="info-page-container">
      <Header />
      <div className="info-content-wrapper">
        <div className="info-content">
          <h1>About Tymout</h1>
          <section className="info-section">
            <h2>Our Mission</h2>
            <p>
              At Tymout, our mission is to create meaningful connections through shared experiences.
              In an increasingly digital world, we believe that real, in-person connections are more 
              valuable than ever. We're dedicated to bringing people together through curated, local
              experiences that foster genuine relationships.
            </p>
          </section>
          
          <section className="info-section">
            <h2>Our Story</h2>
            <p>
              Tymout was born from a simple observation: despite being more connected digitally 
              than ever before, many people feel increasingly isolated in their day-to-day lives.
              Our founders experienced this paradox firsthand and set out to create a platform 
              that bridges the gap between online connections and real-world relationships.
            </p>
            <p>
              Since our launch, we've helped thousands of people discover new experiences, make 
              meaningful connections, and build communities around shared interests. What started 
              as a small project has grown into a thriving platform that spans across major cities.
            </p>
          </section>
          
          <section className="info-section">
            <h2>Our Values</h2>
            <div className="feature-list">
              <div className="feature-item">
                <h3>Authenticity</h3>
                <p>
                  We believe in real connections between real people. We encourage our users 
                  to be their authentic selves and foster an environment where genuine 
                  interactions can flourish.
                </p>
              </div>
              
              <div className="feature-item">
                <h3>Community</h3>
                <p>
                  We're building more than just a platform—we're building communities. 
                  We strive to create spaces where people feel welcome, included, and valued.
                </p>
              </div>
              
              <div className="feature-item">
                <h3>Diversity</h3>
                <p>
                  We celebrate the unique perspectives, backgrounds, and experiences that make 
                  each person special. Our platform is designed to be inclusive and accessible to all.
                </p>
              </div>
              
              <div className="feature-item">
                <h3>Trust</h3>
                <p>
                  Safety and trust are fundamental to our platform. We work tirelessly to 
                  create a secure environment where users can connect with confidence.
                </p>
              </div>
            </div>
          </section>
          
          <section className="info-section">
            <h2>Join Our Community</h2>
            <p>
              Whether you're looking to explore your city in new ways, meet like-minded individuals, 
              or share your passions with others, Tymout is the place for you. Join our growing 
              community today and start creating memories that last a lifetime.
            </p>
            <div className="flex justify-center mt-8">
              <button 
                className="primary-button mr-4" 
                onClick={() => window.location.href = '/signup'}
              >
                Sign Up
              </button>
              <button 
                className="secondary-button" 
                onClick={() => window.location.href = '/login'}
              >
                Log In
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
