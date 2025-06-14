import React from 'react';
import Header from '../../components/layout/Header';
import '../../styles/InfoPages.css';

// Following Single Responsibility Principle - BusinessPage only handles display of business information
const BusinessPage = () => {
  return (
    <div className="info-page-container">
      <Header />
      <div className="info-content-wrapper">
        <div className="info-content mobile-friendly">
          <h1 className="info-title">Business</h1>
          
          <section className="info-section">
            <h2 className="info-heading">Partner with Tymout</h2>
            <p className="info-text">
              Tymout helps businesses connect with local customers through authentic experiences.
              Our platform increases visibility and builds customer loyalty.
            </p>
          </section>
          
          <section className="info-section">
            <h2 className="info-heading">Benefits for Businesses</h2>
            <div className="benefits-container">
              <div className="benefit-item">
                <h3 className="benefit-title">Local Visibility</h3>
                <p className="benefit-text">Connect with customers interested in your business.</p>
              </div>
              
              <div className="benefit-item">
                <h3 className="benefit-title">Featured Events</h3>
                <p className="benefit-text">Create events that showcase your unique offerings.</p>
              </div>
              
              <div className="benefit-item">
                <h3 className="benefit-title">Customer Insights</h3>
                <p className="benefit-text">Gain data about preferences and interests.</p>
              </div>
              
              <div className="benefit-item">
                <h3 className="benefit-title">Community</h3>
                <p className="benefit-text">Build a loyal community around your brand.</p>
              </div>
            </div>
          </section>
          
          <section className="info-section">
            <h2 className="info-heading">How It Works</h2>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-number">1</div>
                <p className="step-text"><strong>Register</strong> your business</p>
              </div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <p className="step-text"><strong>Create</strong> unique experiences</p>
              </div>
              
              <div className="step-item">
                <div className="step-number">3</div>
                <p className="step-text"><strong>Connect</strong> with customers</p>
              </div>
              
              <div className="step-item">
                <div className="step-number">4</div>
                <p className="step-text"><strong>Build</strong> lasting relationships</p>
              </div>
            </div>
          </section>
          
          <section className="info-section">
            <h2 className="info-heading">Get Started</h2>
            <p className="info-text">
              Ready to grow with Tymout? Contact our team to learn more.
            </p>
            <div className="button-container">
              <button className="primary-button">Contact Business Team</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BusinessPage;
