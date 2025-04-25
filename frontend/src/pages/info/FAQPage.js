import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import '../../styles/InfoPages.css';

// Following Single Responsibility Principle - FAQPage only handles display of FAQ information
const FAQPage = () => {
  // State to track which FAQ items are expanded
  const [expandedItems, setExpandedItems] = useState({});

  // Toggle FAQ item expansion
  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // FAQ data - In a real implementation, this would likely come from an API or separate data file
  const faqItems = [
    {
      id: 1,
      question: "What is Tymout?",
      answer: "Tymout is a platform that connects people through curated, local experiences. Our mission is to help users build real connections in person, rather than just online."
    },
    {
      id: 2,
      question: "How do I create an account?",
      answer: "You can create an account by clicking the 'Signup' button on our homepage. You'll need to provide your name, email, and create a password. You can also sign up using your Google or Facebook account."
    },
    {
      id: 3,
      question: "Is Tymout free to use?",
      answer: "Basic Tymout accounts are free. You can browse experiences, create a profile, and message other users at no cost. Some premium features and certain experiences may have associated fees."
    },
    {
      id: 4,
      question: "How do I find experiences near me?",
      answer: "Once you're logged in, you can browse experiences in your area from the 'Explore' tab. You can filter experiences by category, date, and distance from your location."
    },
    {
      id: 5,
      question: "How can I host my own experience?",
      answer: "To host an experience, click on the 'Host' button in the header. You'll be guided through the process of creating your experience, setting dates, capacity, and other details."
    },
    {
      id: 6,
      question: "Is Tymout available in my area?",
      answer: "Tymout is expanding rapidly. Currently, we're active in major cities across India with plans to expand globally. Check our 'Explore' page to see experiences in your area."
    },
    {
      id: 7,
      question: "How does Tymout ensure user safety?",
      answer: "Safety is our priority. We verify user identities, provide in-app messaging so you don't have to share personal contact information, encourage public meeting places, and have a robust reporting system."
    },
    {
      id: 8,
      question: "What if I need to cancel my participation in an experience?",
      answer: "Our cancellation policy varies by experience. Generally, cancellations made 48 hours or more in advance are eligible for a full refund. Please check the specific experience details for cancellation terms."
    }
  ];

  return (
    <div className="info-page-container">
      <Header />
      <div className="info-content-wrapper">
        <div className="info-content">
          <h1>Frequently Asked Questions</h1>
          
          <section className="info-section">
            <p className="intro-text">
              Find answers to common questions about Tymout, our platform, and how it works.
              If you don't see your question here, please contact our support team.
            </p>
          </section>
          
          <section className="faq-section">
            <div className="faq-list">
              {faqItems.map(item => (
                <div key={item.id} className="faq-item">
                  <button 
                    className={`faq-question ${expandedItems[item.id] ? 'active' : ''}`}
                    onClick={() => toggleItem(item.id)}
                  >
                    {item.question}
                    <span className="faq-icon">{expandedItems[item.id] ? '−' : '+'}</span>
                  </button>
                  <div className={`faq-answer ${expandedItems[item.id] ? 'expanded' : ''}`}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          <section className="info-section">
            <h2>Still have questions?</h2>
            <p>
              Our support team is here to help. Reach out to us through our contact page,
              and we'll get back to you as soon as possible.
            </p>
            <button className="primary-button mt-4" onClick={() => window.location.href = '/contact'}>
              Contact Support
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
