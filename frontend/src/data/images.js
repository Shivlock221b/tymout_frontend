/**
 * Mock image data for the application
 * Following the requirement that mock data should be in separate files
 */

export const images = {
  // Hero images
  hero: {
    // Attempt to load from S3 first
    s3: "https://tymouttest.s3.ap-south-1.amazonaws.com/home/hero-image.jpg",
    
    // High-quality fallback images from public URLs
    fallback: [
      // Community gathering image
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      
      // People at a cafe table
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      
      // Friends having dinner
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    ]
  },
  
  // Other image categories
  tables: {
    // Table images (to be populated)
    default: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  
  events: {
    // Event images (to be populated)
    default: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  }
};
