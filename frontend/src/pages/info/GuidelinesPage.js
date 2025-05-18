import React from 'react';
import Header from '../../components/layout/Header';
import '../../styles/InfoPages.css';

// Following Single Responsibility Principle - GuidelinesPage only handles display of guidelines information
const GuidelinesPage = () => {
  return (
    <div className="info-page-container">
      <Header />
      <div className="info-content-wrapper">
        <div className="info-content">
          <h1>Community Guidelines</h1>
          <section className="info-section">
            <h2>Our Values</h2>
            <p>
              At Tymout, we believe in fostering a safe, respectful, and inclusive community. 
              These guidelines outline the expectations we have for all members of our platform.
            </p>
          </section>
          
          <section className="info-section">
            <h2>Be Authentic</h2>
            <p>
              We value real connections and authentic interactions. Be yourself and represent yourself 
              honestly in your profile and communications.
            </p>
            <ul className="guideline-list">
              <li>Use your real name and provide accurate information about yourself</li>
              <li>Upload recent photos that clearly show your face</li>
              <li>Be honest about your interests and intentions</li>
            </ul>
          </section>
          
          <section className="info-section">
            <h2>Be Respectful</h2>
            <p>
              Treat others with respect, kindness, and consideration, just as you would in person.
            </p>
            <ul className="guideline-list">
              <li>Communicate in a friendly and respectful manner</li>
              <li>Respect personal boundaries and privacy</li>
              <li>Consider cultural differences and diverse perspectives</li>
              <li>Avoid offensive language, harassment, or discrimination</li>
            </ul>
          </section>
          
          <section className="info-section">
            <h2>Be Safe</h2>
            <p>
              Your safety is our priority. Take precautions when meeting new people.
            </p>
            <ul className="guideline-list">
              <li>Meet in public places for first-time meetups</li>
              <li>Inform someone you trust about your plans</li>
              <li>Trust your instincts and leave if you feel uncomfortable</li>
              <li>Report suspicious behavior to Tymout immediately</li>
            </ul>
          </section>
          
          <section className="info-section">
            <h2>Be Reliable</h2>
            <p>
              Honor your commitments and be considerate of others' time.
            </p>
            <ul className="guideline-list">
              <li>Show up to experiences you've committed to attending</li>
              <li>Be on time for scheduled meetups</li>
              <li>Communicate promptly if your plans change</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;
