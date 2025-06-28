// Simple smooth scroll for nav links
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// CTA button scrolls to examples
const ctaBtn = document.getElementById('cta-btn');
if (ctaBtn) {
  ctaBtn.addEventListener('click', () => {
    document.getElementById('examples').scrollIntoView({ behavior: 'smooth' });
  });
}

// Interactive Example Lists: Expand/collapse list details
const listCards = document.querySelectorAll('.list-card');
listCards.forEach(card => {
  const viewMore = card.querySelector('a');
  const list = card.querySelector('ul');
  if (viewMore && list) {
    // Hide all but the first 3 items by default (if more than 3)
    const items = list.querySelectorAll('li');
    if (items.length > 3) {
      for (let i = 3; i < items.length; i++) {
        items[i].style.display = 'none';
      }
      viewMore.style.display = 'inline-block';
      let expanded = false;
      viewMore.addEventListener('click', function(e) {
        e.preventDefault();
        expanded = !expanded;
        for (let i = 3; i < items.length; i++) {
          items[i].style.display = expanded ? '' : 'none';
        }
        viewMore.textContent = expanded ? 'Show Less' : 'View More';
      });
    } else {
      viewMore.style.display = 'none';
    }
  }
});
