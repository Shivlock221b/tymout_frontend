import React from 'react';
import Header from '../../components/layout/Header';
import '../../styles/InfoPages.css';

// Following Single Responsibility Principle - CreatorsPage only handles display of creators information
const CreatorsPage = () => {
  return (
    <div className="info-page-container">
      <Header />
      <div className="info-content-wrapper">
        <div className="info-content">
          <h1>Creators</h1>
          <section className="info-section">
            <h2>The Team Behind Tymout</h2>
            <p>
              Tymout was created by a passionate team dedicated to fostering authentic connections
              in an increasingly digital world. We believe that meaningful experiences happen in real life,
              and our platform is designed to facilitate these connections.
            </p>
          </section>
          
          <section className="info-section">
            <h2>Our Story</h2>
            <p>
              Founded in 2023, Tymout began with a simple idea: to create a platform that brings people
              together through shared experiences rather than just digital interactions. Our team saw a need
              for more meaningful connections in a world where digital communication often replaces
              in-person interaction.
            </p>
            <p>
              What started as a small project has grown into a platform that helps thousands of people
              create lasting memories and form genuine connections with others in their communities.
            </p>
          </section>
          
          <section className="info-section">
            <h2>Meet the Founders</h2>
            <div className="team-grid">
              {/* Team member profiles would be dynamically populated in a real implementation */}
              <div className="team-member">
                <div className="team-member-photo placeholder-image"></div>
                <h3>Jane Doe</h3>
                <p>Chief Executive Officer</p>
              </div>
              <div className="team-member">
                <div className="team-member-photo placeholder-image"></div>
                <h3>John Smith</h3>
                <p>Chief Technology Officer</p>
              </div>
              <div className="team-member">
                <div className="team-member-photo placeholder-image"></div>
                <h3>Alex Johnson</h3>
                <p>Chief Design Officer</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreatorsPage;
