import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import '../../styles/InfoPages.css';

// Following Single Responsibility Principle - ContactPage only handles contact form and display
const ContactPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  // Success state for form submission
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to a backend API
    console.log('Form submitted:', formData);
    // Show success message
    setIsSubmitted(true);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };
  
  return (
    <div className="info-page-container">
      <Header />
      <div className="info-content-wrapper">
        <div className="info-content">
          <h1>Contact Us</h1>
          
          <section className="info-section">
            <p className="intro-text">
              Have questions, feedback, or need assistance? We're here to help!
              Fill out the form below, and our team will get back to you as soon as possible.
            </p>
          </section>
          
          <section className="info-section">
            <div className="contact-container">
              <div className="contact-info">
                <h2>Get in Touch</h2>
                <div className="contact-method">
                  <h3>Email</h3>
                  <p>support@tymout.com</p>
                </div>
                <div className="contact-method">
                  <h3>Office</h3>
                  <p>123 Experience Street<br />Bangalore, Karnataka 560001<br />India</p>
                </div>
                <div className="contact-method">
                  <h3>Support Hours</h3>
                  <p>Monday - Friday: 9:00 AM - 6:00 PM IST</p>
                </div>
              </div>
              
              <div className="contact-form">
                {isSubmitted ? (
                  <div className="success-message">
                    <h2>Thank You!</h2>
                    <p>Your message has been sent successfully. We'll get back to you soon.</p>
                    <button 
                      className="primary-button mt-4"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    
                    <button type="submit" className="primary-button">
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
