/**
 * counter.js – Animated stats counters with Intersection Observer
 * Triggers counting when stats section is visible
 */

(function() {
  const counters = document.querySelectorAll('.counter');
  
  if (counters.length === 0) return;
  
  const options = {
    threshold: 0.4,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'), 10);
        let current = 0;
        const increment = target / 80; // smooth step
        
        function updateNumber() {
          current += increment;
          if (current < target) {
            counter.innerText = Math.ceil(current);
            requestAnimationFrame(updateNumber);
          } else {
            counter.innerText = target;
          }
        }
        updateNumber();
        observer.unobserve(counter);
      }
    });
  }, options);
  
  counters.forEach(counter => {
    observer.observe(counter);
  });
})();