// Preload critical resources to improve LCP and prevent layout shifts
(function() {
  // Preload critical CSS
  const preloadCSS = (href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  };

  // Preload critical images
  const preloadImage = (src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  };

  // Preload critical fonts
  const preloadFont = (href) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = href;
    document.head.appendChild(link);
  };

  // Add layout stability attributes to elements that might cause shifts
  const addLayoutStability = () => {
    // Set explicit dimensions for images to prevent layout shifts
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
        // Only if natural dimensions are available
        if (img.naturalWidth && img.naturalHeight) {
          img.setAttribute('width', img.naturalWidth);
          img.setAttribute('height', img.naturalHeight);
        }
      }
    });

    // Add min-height to containers that might cause layout shifts
    document.querySelectorAll('footer, .flex.items-center, .logo-container').forEach(el => {
      if (!el.style.minHeight) {
        el.style.contain = 'layout';
      }
    });
  };

  // Execute when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addLayoutStability);
  } else {
    addLayoutStability();
  }

  // Preload critical assets
  // Main CSS
  preloadCSS('/static/css/main.chunk.css');
  
  // Logo (assuming it's the LCP element based on the test)
  if (document.querySelector('.logo-container img')) {
    preloadImage(document.querySelector('.logo-container img').src);
  }
  
  // Add intersection observer for lazy loading
  if ('IntersectionObserver' in window) {
    const lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          lazyLoadObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      lazyLoadObserver.observe(img);
    });
  }
})();
