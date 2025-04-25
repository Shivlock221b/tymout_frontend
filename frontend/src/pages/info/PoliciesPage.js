import React from 'react';
import Header from '../../components/layout/Header';
import '../../styles/InfoPages.css';

// Following Single Responsibility Principle - PoliciesPage only handles display of policies information
const PoliciesPage = () => {
  return (
    <div className="info-page-container">
      <Header />
      <div className="info-content-wrapper">
        <div className="info-content">
          <h1>Policies</h1>
          <section className="info-section">
            <h2>Our Commitment</h2>
            <p>
              At Tymout, we are committed to transparency and fairness in all our operations.
              The following policies govern how we operate and what you can expect from us.
            </p>
          </section>
          
          <section className="info-section">
            <h2>Privacy Policy</h2>
            <p>
              We respect your privacy and are committed to protecting your personal data.
              Our Privacy Policy explains how we collect, use, and safeguard your information.
            </p>
            <h3>Data Collection</h3>
            <p>
              We collect information you provide directly to us, such as when you create an account,
              participate in experiences, or communicate with other users. We also collect certain 
              information automatically when you use our platform.
            </p>
            <h3>Data Usage</h3>
            <p>
              We use your data to provide and improve our services, personalize your experience,
              communicate with you, and ensure safety on our platform.
            </p>
            <h3>Data Protection</h3>
            <p>
              We implement robust security measures to protect your personal information from
              unauthorized access, alteration, or disclosure.
            </p>
          </section>
          
          <section className="info-section">
            <h2>Terms of Service</h2>
            <p>
              Our Terms of Service outline the rules and guidelines for using Tymout, including
              user responsibilities, prohibited activities, and our rights as a platform.
            </p>
            <h3>User Conduct</h3>
            <p>
              Users are expected to behave respectfully, provide accurate information, and
              adhere to our community guidelines.
            </p>
            <h3>Content Ownership</h3>
            <p>
              Users retain ownership of the content they create, but grant Tymout certain rights to
              use, display, and distribute that content on our platform.
            </p>
            <h3>Termination</h3>
            <p>
              We reserve the right to terminate or suspend accounts that violate our policies or
              engage in harmful behavior.
            </p>
          </section>
          
          <section className="info-section">
            <h2>Cancellation Policy</h2>
            <p>
              Our cancellation policy aims to balance flexibility for participants with respect for
              hosts' time and effort.
            </p>
            <h3>For Participants</h3>
            <p>
              Cancellations made 48 hours or more before an experience may be eligible for a full refund.
              Cancellations made within 48 hours may be eligible for a partial refund, depending on the
              host's policy.
            </p>
            <h3>For Hosts</h3>
            <p>
              Hosts who need to cancel experiences should do so as early as possible. Repeated cancellations
              may affect a host's status on our platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
