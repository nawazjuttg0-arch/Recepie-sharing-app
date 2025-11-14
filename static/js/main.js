// TastyShare Main JavaScript Module

// Configuration
const Config = {
    // Always use relative URLs to avoid mixed content issues
    getApiUrl: function(path) {
        // Always return the path as-is (relative URL)
        // This ensures the browser uses the same protocol as the current page
        return path;
    }
};

// Utility Functions
function showToast(message, type = 'info', title = 'TastyShare') {
    const toastEl = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastBody = document.getElementById('toast-body');
    
    if (!toastEl) return;

    // Set toast content
    toastTitle.textContent = title;
    toastBody.textContent = message;

    // Set toast type styling
    toastEl.className = 'toast';
    const toastHeader = toastEl.querySelector('.toast-header');
    toastHeader.className = 'toast-header';
    
    switch (type) {
        case 'success':
            toastHeader.classList.add('bg-success', 'text-white');
            break;
        case 'error':
            toastHeader.classList.add('bg-danger', 'text-white');
            break;
        case 'warning':
            toastHeader.classList.add('bg-warning', 'text-dark');
            break;
        default:
            toastHeader.classList.add('bg-info', 'text-white');
    }

    // Show toast
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function showLoading(show = true) {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(minutes) {
    if (!minutes) return 'N/A';
    
    if (minutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    }
}

function generateStarRating(rating, maxRating = 5, showNumber = true) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star text-warning"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    
    const emptyStars = maxRating - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star text-muted"></i>';
    }
    
    if (showNumber) {
        stars += ` <span class="text-muted">(${rating.toFixed(1)})</span>`;
    }
    
    return stars;
}

function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getImageUrl(imagePath, fallback = '/static/images/recipe-placeholder.svg') {
    if (!imagePath) return fallback;
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
}

// Recipe Card Component
function createRecipeCard(recipe, options = {}) {
    const {
        showAuthor = true,
        showFavorite = true,
        cardClass = ''
    } = options;

    const imageUrl = getImageUrl(recipe.image_url);
    const authorInfo = showAuthor && recipe.author ? 
        `<small class="text-muted">by ${recipe.author.username}</small>` : '';
    
    const favoriteBtn = showFavorite && auth.isAuthenticated() ? 
        `<button class="btn btn-sm btn-outline-danger favorite-btn" 
                 data-recipe-id="${recipe.id}" 
                 data-favorited="${recipe.is_favorited || false}">
            <i class="fas fa-heart ${recipe.is_favorited ? '' : 'text-muted'}"></i>
         </button>` : '';

    const difficultyBadge = recipe.difficulty_level ? 
        `<span class="badge bg-secondary">${recipe.difficulty_level}</span>` : '';

    const categoryBadge = recipe.category ? 
        `<span class="badge bg-primary">${recipe.category}</span>` : '';

    return `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="card recipe-card h-100 ${cardClass}">
                <img src="${imageUrl}" class="card-img-top" alt="${recipe.title}" 
                     onerror="this.src='/static/images/recipe-placeholder.svg'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${recipe.title}</h5>
                    <p class="card-text text-truncate-3">${recipe.description}</p>
                    ${authorInfo}
                    
                    <div class="recipe-meta mt-auto">
                        <div class="d-flex flex-wrap gap-1 mb-2">
                            ${categoryBadge}
                            ${difficultyBadge}
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="rating">
                                ${generateStarRating(recipe.average_rating || 0, 5, false)}
                                <small class="text-muted">(${recipe.rating_count || 0})</small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                ${recipe.total_time ? `<small class="text-muted"><i class="fas fa-clock"></i> ${formatTime(recipe.total_time)}</small>` : ''}
                                ${favoriteBtn}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-2">
                        <a href="/recipe/${recipe.id}" class="btn btn-primary btn-sm">
                            <i class="fas fa-eye me-1"></i>View Recipe
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Pagination Component
function createPagination(pagination, onPageChange) {
    if (pagination.pages <= 1) return '';

    let paginationHtml = '<nav aria-label="Recipe pagination"><ul class="pagination justify-content-center">';
    
    // Previous button
    if (pagination.has_prev) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${pagination.page - 1}">
                    <i class="fas fa-chevron-left"></i> Previous
                </a>
            </li>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);
    
    if (startPage > 1) {
        paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`;
        if (startPage > 2) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === pagination.page ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
    }
    
    if (endPage < pagination.pages) {
        if (endPage < pagination.pages - 1) {
            paginationHtml += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHtml += `<li class="page-item"><a class="page-link" href="#" data-page="${pagination.pages}">${pagination.pages}</a></li>`;
    }
    
    // Next button
    if (pagination.has_next) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${pagination.page + 1}">
                    Next <i class="fas fa-chevron-right"></i>
                </a>
            </li>`;
    }
    
    paginationHtml += '</ul></nav>';
    
    // Add event listeners
    setTimeout(() => {
        document.querySelectorAll('.pagination .page-link[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.target.getAttribute('data-page'));
                if (page && onPageChange) {
                    onPageChange(page);
                }
            });
        });
    }, 100);
    
    return paginationHtml;
}

// Search and Filter Component
function createSearchFilter(options = {}) {
    const {
        showSearch = true,
        showCategory = true,
        showCuisine = true,
        showDietary = true,
        showDifficulty = true,
        showSort = true
    } = options;

    return `
        <div class="search-filter-bar">
            <form id="search-filter-form">
                <div class="row g-3">
                    ${showSearch ? `
                        <div class="col-md-4">
                            <div class="input-group">
                                <span class="input-group-text"><i class="fas fa-search"></i></span>
                                <input type="text" class="form-control" id="search" 
                                       placeholder="Search recipes..." name="search">
                            </div>
                        </div>
                    ` : ''}
                    
                    ${showCategory ? `
                        <div class="col-md-2">
                            <select class="form-select" id="category" name="category">
                                <option value="">All Categories</option>
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="dessert">Dessert</option>
                                <option value="snack">Snack</option>
                                <option value="appetizer">Appetizer</option>
                                <option value="beverage">Beverage</option>
                            </select>
                        </div>
                    ` : ''}
                    
                    ${showCuisine ? `
                        <div class="col-md-2">
                            <select class="form-select" id="cuisine-type" name="cuisine_type">
                                <option value="">All Cuisines</option>
                                <option value="american">American</option>
                                <option value="italian">Italian</option>
                                <option value="chinese">Chinese</option>
                                <option value="indian">Indian</option>
                                <option value="mexican">Mexican</option>
                                <option value="french">French</option>
                                <option value="thai">Thai</option>
                                <option value="japanese">Japanese</option>
                            </select>
                        </div>
                    ` : ''}
                    
                    ${showDietary ? `
                        <div class="col-md-2">
                            <select class="form-select" id="dietary-preference" name="dietary_preference">
                                <option value="">All Diets</option>
                                <option value="vegetarian">Vegetarian</option>
                                <option value="vegan">Vegan</option>
                                <option value="non-vegetarian">Non-Vegetarian</option>
                                <option value="gluten-free">Gluten-Free</option>
                                <option value="keto">Keto</option>
                            </select>
                        </div>
                    ` : ''}
                    
                    ${showDifficulty ? `
                        <div class="col-md-1">
                            <select class="form-select" id="difficulty" name="difficulty_level">
                                <option value="">All Levels</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    ` : ''}
                    
                    ${showSort ? `
                        <div class="col-md-1">
                            <select class="form-select" id="sort" name="sort_by">
                                <option value="created_at">Newest</option>
                                <option value="rating">Rating</option>
                                <option value="view_count">Popular</option>
                                <option value="title">Name</option>
                            </select>
                        </div>
                    ` : ''}
                </div>
            </form>
        </div>
    `;
}

// Favorite Toggle Handler
function handleFavoriteToggle() {
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.favorite-btn')) {
            e.preventDefault();
            
            if (!auth.isAuthenticated()) {
                showToast('Please login to add favorites', 'warning');
                return;
            }
            
            const btn = e.target.closest('.favorite-btn');
            const recipeId = btn.getAttribute('data-recipe-id');
            const isFavorited = btn.getAttribute('data-favorited') === 'true';
            
            try {
                btn.disabled = true;
                
                const response = await fetch(`/api/recipes/${recipeId}/favorite`, {
                    method: 'POST',
                    headers: auth.getAuthHeaders()
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    btn.setAttribute('data-favorited', data.is_favorited);
                    const icon = btn.querySelector('i');
                    icon.className = `fas fa-heart ${data.is_favorited ? '' : 'text-muted'}`;
                    
                    showToast(data.message, 'success');
                } else {
                    showToast(data.error || 'Failed to update favorite', 'error');
                }
            } catch (error) {
                console.error('Favorite toggle error:', error);
                showToast('Failed to update favorite', 'error');
            } finally {
                btn.disabled = false;
            }
        }
    });
}

// API Helper Functions
async function fetchWithAuth(url, options = {}) {
    // Ensure HTTPS URLs in production
    const apiUrl = Config.getApiUrl(url);
    
    // Debug logging
    if (window.location.hostname !== 'localhost') {
        console.log('Original URL:', url);
        console.log('API URL:', apiUrl);
        console.log('Current location:', window.location.href);
    }
    
    const defaultHeaders = auth.isAuthenticated() ? auth.getAuthHeaders() : {
        'Content-Type': 'application/json'
    };
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(apiUrl, config);
        
        if (response.status === 401 && auth.isAuthenticated()) {
            // Token expired, logout user
            auth.logout();
            window.location.href = '/login';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Form Validation Helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

function validateUsername(username) {
    return username.length >= 3 && username.length <= 80 && /^[a-zA-Z0-9_]+$/.test(username);
}

function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('is-invalid');
        const feedback = field.parentNode.querySelector('.invalid-feedback') || 
                        field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('is-invalid', 'is-valid');
        const feedback = field.parentNode.querySelector('.invalid-feedback') || 
                        field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
        }
    }
}

function clearAllErrors(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.querySelectorAll('.is-invalid, .is-valid').forEach(field => {
            field.classList.remove('is-invalid', 'is-valid');
        });
        form.querySelectorAll('.invalid-feedback').forEach(feedback => {
            feedback.textContent = '';
        });
    }
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize favorite toggle handler
    handleFavoriteToggle();
    
    // Add smooth scrolling to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading state to forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i>Loading...';
                
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 5000); // Re-enable after 5 seconds as fallback
            }
        });
    });
});

// Export utility functions for global use
window.Config = Config;
window.showToast = showToast;
window.showLoading = showLoading;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.generateStarRating = generateStarRating;
window.createRecipeCard = createRecipeCard;
window.createPagination = createPagination;
window.createSearchFilter = createSearchFilter;
window.fetchWithAuth = fetchWithAuth;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.validateUsername = validateUsername;
window.setFieldError = setFieldError;
window.clearFieldError = clearFieldError;
window.clearAllErrors = clearAllErrors;

// Dark Mode Functionality
class DarkModeManager {
    constructor() {
        this.darkModeKey = 'tastyshare-dark-mode';
        this.init();
    }

    init() {
        // Check for saved dark mode preference or default to system preference
        const savedMode = localStorage.getItem(this.darkModeKey);
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let isDarkMode;
        if (savedMode !== null) {
            isDarkMode = savedMode === 'true';
        } else {
            isDarkMode = systemPrefersDark;
        }

        this.setDarkMode(isDarkMode);
        this.setupToggleButton();
        this.watchSystemChanges();
    }

    setDarkMode(isDark) {
        const html = document.documentElement;
        const icon = document.getElementById('darkModeIcon');
        
        if (isDark) {
            html.setAttribute('data-bs-theme', 'dark');
            if (icon) icon.className = 'fas fa-sun';
        } else {
            html.setAttribute('data-bs-theme', 'light');
            if (icon) icon.className = 'fas fa-moon';
        }
        
        // Save preference
        localStorage.setItem(this.darkModeKey, isDark.toString());
    }

    toggleDarkMode() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-bs-theme');
        const isDark = currentTheme === 'dark';
        this.setDarkMode(!isDark);
    }

    setupToggleButton() {
        const toggleButton = document.getElementById('darkModeToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }
    }

    watchSystemChanges() {
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                // Only update if user hasn't manually set a preference
                if (localStorage.getItem(this.darkModeKey) === null) {
                    this.setDarkMode(e.matches);
                }
            });
        }
    }
}

// Initialize dark mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.darkModeManager = new DarkModeManager();
});

// Export for global use
window.DarkModeManager = DarkModeManager;
