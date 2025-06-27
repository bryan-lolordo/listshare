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
