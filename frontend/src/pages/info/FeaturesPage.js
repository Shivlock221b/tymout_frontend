import React from 'react';
import Header from '../../components/layout/Header';
import '../../styles/InfoPages.css';

// Following Single Responsibility Principle - FeaturesPage only handles display of features information
const FeaturesPage = () => {
  return (
    <div className="info-page-container">
      <Header />
      <div className="info-content-wrapper">
        <div className="info-content">
          <h1>Features</h1>
          <section className="info-section">
            <h2>Discover Amazing Experiences</h2>
            <p>
              Tymout connects you with authentic local experiences tailored to your interests.
              Our platform is designed to help you create meaningful connections through shared activities.
            </p>
          </section>
          
          <section className="info-section">
            <h2>Key Features</h2>
            <ul className="feature-list">
              <li>
                <h3>Curated Local Experiences</h3>
                <p>Discover handpicked events and activities in your area.</p>
              </li>
              <li>
                <h3>Real-time Matching</h3>
                <p>Connect with like-minded individuals who share your interests.</p>
              </li>
              <li>
                <h3>Secure Messaging</h3>
                <p>Communicate safely within our platform before meeting in person.</p>
              </li>
              <li>
                <h3>Verified Profiles</h3>
                <p>Trust and safety are our priorities with our robust verification system.</p>
              </li>
              <li>
                <h3>Host Your Own Events</h3>
                <p>Create and manage your own experiences to share with the community.</p>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
