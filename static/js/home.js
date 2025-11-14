// Home Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadFeaturedRecipes();
    loadSiteStats();
    updateAuthButtons();
});

async function loadFeaturedRecipes() {
    try {
        const response = await fetchWithAuth('/api/recipes?sort_by=rating&per_page=6');
        const data = await response.json();
        
        const container = document.getElementById('featured-recipes');
        
        if (data.recipes && data.recipes.length > 0) {
            container.innerHTML = data.recipes.map(recipe => 
                createRecipeCard(recipe, { cardClass: 'fade-in' })
            ).join('');
        } else {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="py-5">
                        <i class="fas fa-utensils text-muted" style="font-size: 4rem;"></i>
                        <h4 class="mt-3 text-muted">No recipes yet</h4>
                        <p class="text-muted">Be the first to share a delicious recipe!</p>
                        <a href="/add-recipe" class="btn btn-primary" id="first-recipe-btn" style="display: none;">
                            <i class="fas fa-plus me-2"></i>Add First Recipe
                        </a>
                    </div>
                </div>
            `;
            
            // Show add recipe button if authenticated
            if (auth.isAuthenticated()) {
                const firstRecipeBtn = document.getElementById('first-recipe-btn');
                if (firstRecipeBtn) {
                    firstRecipeBtn.style.display = 'inline-block';
                }
            }
        }
    } catch (error) {
        console.error('Error loading featured recipes:', error);
        const container = document.getElementById('featured-recipes');
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load featured recipes. Please try again later.
                </div>
            </div>
        `;
    }
}

async function loadSiteStats() {
    try {
        // Fetch real statistics from the API
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
            throw new Error(`Failed to load stats: ${response.status}`);
        }
        
        const stats = await response.json();
        
        // Animate the counters with real data
        animateCounter('stats-recipes', stats.recipes);
        animateCounter('stats-users', stats.users);
        animateCounter('stats-reviews', stats.reviews);
        animateCounter('stats-views', stats.views);
        
    } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to showing 0 if API fails
        animateCounter('stats-recipes', 0);
        animateCounter('stats-users', 0);
        animateCounter('stats-reviews', 0);
        animateCounter('stats-views', 0);
    }
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function updateAuthButtons() {
    const heroRegisterBtn = document.getElementById('hero-register-btn');
    const ctaRegisterBtn = document.getElementById('cta-register-btn');
    
    if (auth.isAuthenticated()) {
        // Hide register buttons for authenticated users
        if (heroRegisterBtn) {
            heroRegisterBtn.style.display = 'none';
        }
        if (ctaRegisterBtn) {
            ctaRegisterBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Add Recipe';
            ctaRegisterBtn.href = '/add-recipe';
        }
    }
}

// Add scroll animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-icon, .stat-item, .recipe-card').forEach(el => {
        observer.observe(el);
    });
}

// Initialize scroll animations after page load
window.addEventListener('load', addScrollAnimations);
