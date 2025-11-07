// API configuration
const API_KEY = '1';
const API_URL = 'https://www.themealdb.com/api/json/v1/' + API_KEY;

// Timer state
let timerInterval = null;
let timeRemaining = 0;
let isTimerRunning = false;

function navigateTo(page) {
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');

  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(link => link.classList.remove('active'));

  const targetPage = document.getElementById(page);
  if (targetPage) {
    targetPage.classList.add('active');

    const targetLink = document.querySelector(`.nav-link[href="#${page}"]`);
    if (targetLink) {
      targetLink.classList.add('active');
    }
  }

  if (page === 'recommended') {
    loadRecommendedRecipes();
  }
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.getAttribute('href').substring(1);
    navigateTo(page);
  });
});

async function searchRecipes() {
  const searchTerm = document.getElementById('search-input').value.trim();

  if (!searchTerm) {
    alert('Please enter a search term');
    return;
  }

  const loading = document.getElementById('loading');
  const recipesGrid = document.getElementById('recipes-grid');

  loading.style.display = 'block';
  recipesGrid.innerHTML = '';

  try {
    const response = await fetch(`${API_URL}/search.php?s=${searchTerm}`);
    const data = await response.json();

    loading.style.display = 'none';

    if (data.meals) {
      displayRecipes(data.meals, 'recipes-grid');
    } else {
      recipesGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 48px;">No recipes found. Try a different search term.</p>';
    }
  } catch (error) {
    loading.style.display = 'none';
    const errorMessage = error.message || 'Error loading recipes. Please try again.';
    recipesGrid.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 48px;">${errorMessage}</p>`;
    console.error('Error fetching recipes:', error);
  }
}

document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchRecipes();
  }
});

async function loadRecommendedRecipes() {
  const recommendedGrid = document.getElementById('recommended-grid');

  if (recommendedGrid.children.length > 0) {
    return;
  }

  recommendedGrid.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading recommendations...</p></div>';

  try {
    const categories = ['Chicken', 'Pasta', 'Beef', 'Dessert', 'Vegetarian', 'Seafood', 'Indian', 'Chinese'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    let response;
    if (randomCategory === 'Indian') {
      response = await fetch(`${API_URL}/filter.php?a=Indian`);
    } else if (randomCategory === 'Chinese') {
      response = await fetch(`${API_URL}/filter.php?a=Chinese`);
    } else {
      response = await fetch(`${API_URL}/search.php?s=${randomCategory}`);
    }
    
    const data = await response.json();

    if (data.meals) {
      const randomRecipes = data.meals.sort(() => 0.5 - Math.random()).slice(0, 6);
      displayRecipes(randomRecipes, 'recommended-grid');
    } else {
      recommendedGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 48px;">No recommendations available at the moment.</p>';
    }
  } catch (error) {
    recommendedGrid.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 48px;">Error loading recommendations. Please try again.</p>';
    console.error('Error fetching recommended recipes:', error);
  }
}

async function loadCuisineRecommendations(cuisine) {
  const recommendedGrid = document.getElementById('recommended-grid');
  
  recommendedGrid.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading ' + cuisine + ' recipes...</p></div>';

  try {
    let response;
    if (cuisine === 'Indian') {
      response = await fetch(`${API_URL}/filter.php?a=Indian`);
    } else if (cuisine === 'Chinese') {
      response = await fetch(`${API_URL}/filter.php?a=Chinese`);
    } else {
      response = await fetch(`${API_URL}/search.php?s=${cuisine}`);
    }
    
    const data = await response.json();

    if (data.meals) {
      const randomRecipes = data.meals.sort(() => 0.5 - Math.random()).slice(0, 6);
      displayRecipes(randomRecipes, 'recommended-grid');
    } else {
      recommendedGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 48px;">No ' + cuisine + ' recipes found.</p>';
    }
  } catch (error) {
    recommendedGrid.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 48px;">Error loading ' + cuisine + ' recipes. Please try again.</p>';
    console.error('Error fetching ' + cuisine + ' recipes:', error);
  }
}

function displayRecipes(recipes, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => showRecipeDetails(recipe);

    const ingredients = getIngredients(recipe);
    const time = '30 min';

    card.innerHTML = `
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-image" />
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.strMeal}</h3>
        <div class="recipe-meta">
          <span>⏱️ ${time}</span>
          <span>🍽️ ${recipe.strCategory}</span>
          <span>🌍 ${recipe.strArea}</span>
        </div>
        <p class="recipe-description">${ingredients.length} ingredients</p>
      </div>
    `;

    container.appendChild(card);
  });
}

function getIngredients(recipe) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({ ingredient, measure });
    }
  }
  return ingredients;
}

function showRecipeDetails(recipe) {
  const modal = document.getElementById('recipe-modal');
  const modalBody = document.getElementById('modal-body');

  const ingredients = getIngredients(recipe);

  const ingredientsList = ingredients.map(item =>
    `<li>${item.measure} ${item.ingredient}</li>`
  ).join('');

  const instructions = recipe.strInstructions
    .split('.')
    .filter(step => step.trim().length > 0)
    .map((step, index) => `<li>${step.trim()}.</li>`)
    .join('');

  modalBody.innerHTML = `
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="modal-recipe-image" />
    <h2 class="modal-recipe-title">${recipe.strMeal}</h2>
    <div class="modal-recipe-meta">
      <div class="meta-item">
        <span>🍽️</span>
        <span>${recipe.strCategory}</span>
      </div>
      <div class="meta-item">
        <span>🌍</span>
        <span>${recipe.strArea}</span>
      </div>
      <div class="meta-item">
        <span>⏱️</span>
        <span>30 minutes</span>
      </div>
    </div>

    <div class="modal-section">
      <h3>Ingredients</h3>
      <ul>${ingredientsList}</ul>
    </div>

    <div class="modal-section">
      <h3>Instructions</h3>
      <ol>${instructions}</ol>
    </div>

    ${recipe.strYoutube ? `
      <div class="modal-section">
        <h3>Video Tutorial</h3>
        <p><a href="${recipe.strYoutube}" target="_blank" style="color: var(--primary-color);">Watch on YouTube</a></p>
      </div>
    ` : ''}
  `;

  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('recipe-modal');
  modal.classList.remove('active');
}

window.onclick = function(event) {
  const modal = document.getElementById('recipe-modal');
  if (event.target === modal) {
    closeModal();
  }
};

function toggleTimer() {
  const widget = document.getElementById('timer-widget');
  const toggleBtn = document.querySelector('.timer-toggle');

  widget.classList.toggle('collapsed');
  toggleBtn.textContent = widget.classList.contains('collapsed') ? '+' : '−';
}

function startTimer() {
  if (isTimerRunning) return;

  const hours = parseInt(document.getElementById('input-hours').value) || 0;
  const minutes = parseInt(document.getElementById('input-minutes').value) || 0;
  const seconds = parseInt(document.getElementById('input-seconds').value) || 0;

  timeRemaining = hours * 3600 + minutes * 60 + seconds;

  if (timeRemaining <= 0) {
    alert('Please set a time greater than 0');
    return;
  }

  isTimerRunning = true;

  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateTimerDisplay();
    } else {
      pauseTimer();
      playTimerAlert();
      alert('Time is up!');
    }
  }, 1000);
}

function pauseTimer() {
  isTimerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  pauseTimer();
  timeRemaining = 0;
  updateTimerDisplay();
  document.getElementById('input-hours').value = 0;
  document.getElementById('input-minutes').value = 0;
  document.getElementById('input-seconds').value = 0;
}

function updateTimerDisplay() {
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  document.getElementById('timer-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('timer-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('timer-seconds').textContent = String(seconds).padStart(2, '0');
}

function playTimerAlert() {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.5);
}

function handleContactSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;

  alert(`Thank you for contacting us, ${name}! We'll get back to you soon at ${email}.`);

  event.target.reset();
}

window.navigateTo = navigateTo;
window.searchRecipes = searchRecipes;
window.closeModal = closeModal;
window.toggleTimer = toggleTimer;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.handleContactSubmit = handleContactSubmit;
window.loadCuisineRecommendations = loadCuisineRecommendations;
window.loadRecommendedRecipes = loadRecommendedRecipes;

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');

  function changeActiveLink() {
    let current = 'home';
    pages.forEach(page => {
      const pageTop = page.offsetTop;
      if (pageYOffset >= pageTop - 60) {
        current = page.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === current) {
        link.classList.add('active');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetPage = document.getElementById(targetId);
      
      window.scrollTo({
        top: targetPage.offsetTop - 50,
        behavior: 'smooth'
      });

      // Manually update active class on click
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  window.addEventListener('scroll', changeActiveLink);

  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  navToggle.addEventListener('click', () => {
    nav.classList.toggle('nav--visible');
  });
});
