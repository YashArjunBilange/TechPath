/**
 * Blog Functionality - Search & Filter
 */

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const articleCards = document.querySelectorAll('.article-card');
  const articlesGrid = document.getElementById('articles-grid');

  let currentFilter = 'all';

  // Filter button click handlers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      // Set current filter
      currentFilter = this.dataset.filter;
      // Apply filters
      filterArticles();
    });
  });

  // Search input handler
  searchInput.addEventListener('input', function() {
    filterArticles();
  });

  // Filter articles based on search and category
  function filterArticles() {
    const searchTerm = searchInput.value.toLowerCase();
    let visibleCount = 0;

    articleCards.forEach(card => {
      const category = card.dataset.category;
      const title = card.querySelector('.article-title').textContent.toLowerCase();
      const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();

      // Check category
      const categoryMatch = currentFilter === 'all' || category === currentFilter;

      // Check search term
      const searchMatch = title.includes(searchTerm) || excerpt.includes(searchTerm);

      // Show or hide card
      if (categoryMatch && searchMatch) {
        card.classList.remove('hidden');
        card.style.display = '';
        visibleCount++;
      } else {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    });

    // Show no articles message if needed
    showNoArticlesMessage(visibleCount);
  }

  // Show message when no articles match
  function showNoArticlesMessage(count) {
    let noArticlesMsg = articlesGrid.querySelector('.no-articles');
    
    if (count === 0) {
      if (!noArticlesMsg) {
        noArticlesMsg = document.createElement('div');
        noArticlesMsg.className = 'no-articles';
        noArticlesMsg.innerHTML = `
          <i class="fas fa-search"></i>
          <h3>No articles found</h3>
          <p>Try adjusting your search or filter criteria</p>
        `;
        articlesGrid.appendChild(noArticlesMsg);
      }
    } else {
      if (noArticlesMsg) {
        noArticlesMsg.remove();
      }
    }
  }

  // Newsletter form submission
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      
      // Simple feedback (in production, this would send to backend)
      const btn = this.querySelector('button');
      const originalText = btn.innerHTML;
      
      btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
      btn.style.background = '#10b981';
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = 'white';
        this.reset();
      }, 2000);
    });
  }

  // Add animation to article cards on load
  articleCards.forEach((card, index) => {
    card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
  });
});

// Add fadeInUp animation to stylesheet dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
