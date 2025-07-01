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

// Example lists data (would come from backend in a real app)
let exampleLists = [
  {
    title: "Best Travel Products",
    category: "Travel",
    items: [
      "Travel Pillow",
      "Universal Adapter",
      "Portable Charger",
      "Collapsible Water Bottle",
      "Noise Cancelling Headphones",
      "Compression Packing Cubes"
    ]
  },
  {
    title: "Top Kitchen Gadgets",
    category: "Kitchen",
    items: [
      "Spiralizer",
      "Instant Pot",
      "Milk Frother",
      "Digital Food Scale",
      "Garlic Press"
    ]
  },
  {
    title: "Favorite Books 2025",
    category: "Books",
    items: [
      "The Creative Act",
      "Project Hail Mary",
      "Atomic Habits",
      "Tomorrow, and Tomorrow, and Tomorrow"
    ]
  }
];

function getCategories() {
  const cats = new Set(exampleLists.map(l => l.category));
  return ["All", ...Array.from(cats)];
}

function renderCategoryFilters() {
  const filtersDiv = document.getElementById("category-filters");
  filtersDiv.innerHTML = "";
  getCategories().forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.onclick = () => renderExampleLists(cat);
    filtersDiv.appendChild(btn);
  });
}

function renderExampleLists(category = "All") {
  const grid = document.getElementById("example-lists");
  grid.innerHTML = "";
  let lists = category === "All" ? exampleLists : exampleLists.filter(l => l.category === category);
  if (lists.length === 0) {
    grid.innerHTML = `<div class='no-lists'>No lists in this category yet.</div>`;
    return;
  }
  lists.forEach(list => {
    const card = document.createElement("div");
    card.className = "list-card";
    card.innerHTML = `
      <h3>${list.title}</h3>
      <div class="category-label">${list.category}</div>
      <ul>${list.items.map(i => `<li>${i}</li>`).join("")}</ul>
    `;
    grid.appendChild(card);
  });
}

document.getElementById("example-list-form").onsubmit = function(e) {
  e.preventDefault();
  const title = document.getElementById("list-title").value.trim();
  const category = document.getElementById("list-category").value.trim();
  const items = document.getElementById("list-items").value.split(",").map(i => i.trim()).filter(Boolean);
  if (!title || !category || items.length === 0) return;
  exampleLists.push({ title, category, items });
  renderCategoryFilters();
  renderExampleLists(category);
  this.reset();
};

// Initial render
renderCategoryFilters();
renderExampleLists();
