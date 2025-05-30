// Script to defer non-critical JavaScript loading
(function() {
  // List of scripts to defer load
  const scriptsToDefer = [
    '/static/js/main.chunk.js',
    '/static/js/vendors~main.chunk.js'
  ];

  // Function to defer load a script
  const deferScript = (src) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.async = true;
    document.body.appendChild(script);
  };

  // Function to check if element is in viewport
  const isInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  // Load critical scripts immediately, defer others
  window.addEventListener('load', () => {
    // First focus on rendering the logo (LCP element)
    const logoContainer = document.querySelector('.logo-container.animating');
    if (logoContainer) {
      // Apply direct styles to ensure fast rendering
      logoContainer.style.willChange = 'transform';
      logoContainer.style.transform = 'translateZ(0)';
      logoContainer.style.backfaceVisibility = 'hidden';
      
      // Force a repaint to prioritize the logo
      logoContainer.style.display = 'block';
      logoContainer.offsetHeight; // Force reflow
    }
    
    // Then load deferred scripts
    setTimeout(() => {
      scriptsToDefer.forEach(script => deferScript(script));
    }, 100); // Small delay to prioritize rendering
  });

  // Optimize script loading based on interaction
  let hasInteracted = false;
  const onUserInteraction = () => {
    if (!hasInteracted) {
      hasInteracted = true;
      // Load any remaining deferred scripts
      scriptsToDefer.forEach(script => {
        if (!document.querySelector(`script[src="${script}"]`)) {
          deferScript(script);
        }
      });
      
      // Remove event listeners once triggered
      ['click', 'touchstart', 'scroll'].forEach(event => {
        document.removeEventListener(event, onUserInteraction);
      });
    }
  };

  // Add interaction listeners
  ['click', 'touchstart', 'scroll'].forEach(event => {
    document.addEventListener(event, onUserInteraction, { passive: true });
  });

  // Optimize the LCP element (logo)
  document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo-container.animating');
    if (logo) {
      // Add high priority fetch for the logo image
      const img = logo.querySelector('img');
      if (img && img.src) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = img.src;
        preloadLink.importance = 'high';
        document.head.appendChild(preloadLink);
      }
    }
  });
})();
