// Recipe Detail Page JavaScript

class RecipeDetailManager {
    constructor(recipeId) {
        this.recipeId = recipeId;
        this.recipe = null;
        this.isLoggedIn = false;
        this.init();
    }

    async init() {
        // Check auth status after page loads
        this.isLoggedIn = window.auth && window.auth.isAuthenticated();
        
        await this.loadRecipe();
        await this.loadReviews();
        this.setupEventListeners();
    }

    async loadRecipe() {
        try {
            showLoading(true);
            
            const response = await fetchWithAuth(`/api/recipes/${this.recipeId}`);
            
            if (!response.ok) {
                throw new Error(`Recipe not found: ${response.status}`);
            }
            
            const data = await response.json();
            this.recipe = data.recipe; // The API returns {recipe: {...}}
            console.log('Loaded recipe:', this.recipe); // Debug log
            this.renderRecipe();
            
        } catch (error) {
            console.error('Error loading recipe:', error);
            this.showError('Failed to load recipe. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    renderRecipe() {
        if (!this.recipe) return;

        // Update page title
        document.title = `${this.recipe.title} - TastyShare`;
        
        // Show recipe content
        const loadingContainer = document.getElementById('loading-container');
        const recipeContent = document.getElementById('recipe-content');
        
        if (loadingContainer) loadingContainer.style.display = 'none';
        if (recipeContent) recipeContent.style.display = 'block';

        // Update breadcrumb
        const breadcrumbTitle = document.getElementById('breadcrumb-title');
        if (breadcrumbTitle) breadcrumbTitle.textContent = this.recipe.title;

        // Update basic info
        this.updateElement('recipe-title', this.recipe.title);
        this.updateElement('recipe-description', this.recipe.description);
        
        // Update meta info
        this.updateRating();
        this.updateViews();
        this.updateDate();
        this.updateBadges();
        
        // Update recipe details
        this.updateRecipeImage();
        this.updateTimings();
        this.updateIngredients();
        this.updateInstructions();
        this.updateNutrition();
        this.updateAuthor();
        
        // Update user-specific elements
        if (this.isLoggedIn) {
            this.updateFavoriteButton();
            this.updateUserActions();
        }
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element && content) {
            element.textContent = content;
        }
    }

    updateRating() {
        const ratingElement = document.getElementById('recipe-rating');
        if (ratingElement) {
            const rating = this.recipe.average_rating || 0;
            const reviewCount = this.recipe.review_count || 0;
            
            ratingElement.innerHTML = `
                ${generateStarRating(rating)}
                <span class="ms-2 text-muted">(${reviewCount} reviews)</span>
            `;
        }
    }

    updateViews() {
        const viewsElement = document.getElementById('recipe-views');
        if (viewsElement && this.recipe.view_count) {
            viewsElement.innerHTML = `<i class="fas fa-eye me-1"></i>${this.recipe.view_count} views`;
        }
    }

    updateDate() {
        const dateElement = document.getElementById('recipe-date');
        if (dateElement && this.recipe.created_at) {
            dateElement.innerHTML = `<i class="fas fa-calendar me-1"></i>${formatDate(this.recipe.created_at)}`;
        }
    }

    updateBadges() {
        const badgesElement = document.getElementById('recipe-badges');
        if (!badgesElement) return;

        let badges = [];
        
        if (this.recipe.category) {
            badges.push(`<span class="badge bg-primary">${this.recipe.category}</span>`);
        }
        
        if (this.recipe.cuisine_type) {
            badges.push(`<span class="badge bg-info">${this.recipe.cuisine_type}</span>`);
        }
        
        if (this.recipe.dietary_preference) {
            badges.push(`<span class="badge bg-success">${this.recipe.dietary_preference}</span>`);
        }
        
        if (this.recipe.difficulty_level) {
            const difficultyColor = {
                'Easy': 'bg-success',
                'Medium': 'bg-warning',
                'Hard': 'bg-danger'
            };
            badges.push(`<span class="badge ${difficultyColor[this.recipe.difficulty_level] || 'bg-secondary'}">${this.recipe.difficulty_level}</span>`);
        }
        
        badgesElement.innerHTML = badges.join(' ');
    }

    updateRecipeImage() {
        const imageElement = document.getElementById('recipe-image');
        if (imageElement) {
            if (this.recipe.image_url) {
                imageElement.src = this.recipe.image_url;
                imageElement.alt = this.recipe.title;
            } else {
                // Use placeholder image when no image is provided
                imageElement.src = '/static/images/recipe-placeholder.jpg';
                imageElement.alt = this.recipe.title || 'Recipe Image';
            }
        }
    }

    updateTimings() {
        // Prep time
        if (this.recipe.prep_time) {
            const prepContainer = document.getElementById('prep-time-container');
            const prepTime = document.getElementById('prep-time');
            if (prepContainer) prepContainer.style.display = 'block';
            if (prepTime) prepTime.textContent = `${this.recipe.prep_time} min`;
        }
        
        // Cook time
        if (this.recipe.cook_time) {
            const cookContainer = document.getElementById('cook-time-container');
            const cookTime = document.getElementById('cook-time');
            if (cookContainer) cookContainer.style.display = 'block';
            if (cookTime) cookTime.textContent = `${this.recipe.cook_time} min`;
        }
        
        // Servings
        if (this.recipe.servings) {
            const servingsContainer = document.getElementById('servings-container');
            const servings = document.getElementById('servings');
            if (servingsContainer) servingsContainer.style.display = 'block';
            if (servings) servings.textContent = this.recipe.servings;
        }
    }

    updateIngredients() {
        const ingredientsElement = document.getElementById('ingredients-list');
        if (ingredientsElement && this.recipe.ingredients) {
            let ingredients;
            if (Array.isArray(this.recipe.ingredients)) {
                // Handle array format (from API)
                ingredients = this.recipe.ingredients.filter(ing => ing.trim());
            } else {
                // Handle string format (legacy)
                ingredients = this.recipe.ingredients.split('\n').filter(ing => ing.trim());
            }
            ingredientsElement.innerHTML = ingredients.map(ingredient => 
                `<li class="list-group-item">${ingredient.trim()}</li>`
            ).join('');
        }
    }

    updateInstructions() {
        const instructionsElement = document.getElementById('instructions-list');
        if (instructionsElement && this.recipe.instructions) {
            let instructions;
            if (Array.isArray(this.recipe.instructions)) {
                // Handle array format (from API)
                instructions = this.recipe.instructions.filter(inst => inst.trim());
            } else {
                // Handle string format (legacy)
                instructions = this.recipe.instructions.split('\n').filter(inst => inst.trim());
            }
            instructionsElement.innerHTML = instructions.map((instruction, index) => 
                `<li class="list-group-item d-flex">
                    <span class="badge bg-primary rounded-pill me-3">${index + 1}</span>
                    <div>${instruction.trim()}</div>
                </li>`
            ).join('');
        }
    }

    updateNutrition() {
        if (this.recipe.calories_per_serving) {
            const caloriesElement = document.getElementById('calories');
            if (caloriesElement) {
                caloriesElement.textContent = `${this.recipe.calories_per_serving} cal`;
                const caloriesContainer = document.getElementById('calories-container');
                if (caloriesContainer) caloriesContainer.style.display = 'block';
            }
        }
    }

    updateAuthor() {
        const authorElement = document.getElementById('author-name');
        const authorAvatar = document.getElementById('author-avatar');
        const authorRecipeCount = document.getElementById('author-recipe-count');
        
        if (authorElement && this.recipe.author) {
            authorElement.textContent = this.recipe.author.username;
        }
        
        if (authorAvatar && this.recipe.author) {
            authorAvatar.src = this.recipe.author.profile_image || '/static/images/default-avatar.png';
            authorAvatar.alt = this.recipe.author.username;
        }
        
        if (authorRecipeCount && this.recipe.author) {
            // You might want to add recipe count to the API response
            authorRecipeCount.textContent = 'Recipe Author';
        }
    }

    updateFavoriteButton() {
        const favoriteBtn = document.getElementById('favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.style.display = 'block';
            
            if (this.recipe.is_favorited) {
                favoriteBtn.classList.remove('btn-outline-danger');
                favoriteBtn.classList.add('btn-danger');
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> <span>Remove from Favorites</span>';
            } else {
                favoriteBtn.classList.remove('btn-danger');
                favoriteBtn.classList.add('btn-outline-danger');
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i> <span>Add to Favorites</span>';
            }
        }
    }

    updateUserActions() {
        const actionsElement = document.getElementById('recipe-actions');
        if (!actionsElement) return;

        // Check if current user is the recipe author or admin
        const currentUserId = window.auth ? window.auth.getCurrentUser()?.id : null;
        const isOwner = currentUserId && (
            currentUserId === this.recipe.user_id || 
            currentUserId === this.recipe.author?.id
        );
        
        // Check if user is admin
        const currentUser = window.auth ? window.auth.getCurrentUser() : null;
        const isAdmin = currentUser && currentUser.role === 'admin';

        if (isOwner || isAdmin) {
            actionsElement.style.display = 'block';
            
            const editBtn = document.getElementById('edit-recipe-btn');
            if (editBtn) {
                editBtn.href = `/recipe/${this.recipeId}/edit`;
            }
        } else {
            actionsElement.style.display = 'none';
        }
    }

    async loadReviews() {
        try {
            console.log('Loading reviews for recipe:', this.recipeId); // Debug log
            const response = await fetchWithAuth(`/api/recipes/${this.recipeId}/reviews`);
            console.log('Reviews response status:', response.status); // Debug log
            if (response.ok) {
                const data = await response.json();
                console.log('Reviews data:', data); // Debug log
                this.renderReviews(data.reviews || data);
            } else {
                console.error('Failed to load reviews:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }

    renderReviews(reviews) {
        const reviewsContainer = document.getElementById('reviews-container');
        if (!reviewsContainer) return;

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<p class="text-muted">No reviews yet. Be the first to review this recipe!</p>';
            return;
        }

        reviewsContainer.innerHTML = reviews.map(review => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="d-flex align-items-center">
                            <img src="${review.user.profile_image || '/static/images/default-avatar.png'}" 
                                 alt="${review.user.username}" 
                                 class="rounded-circle me-2" 
                                 style="width: 32px; height: 32px; object-fit: cover;">
                            <div>
                                <div class="fw-bold">${review.user.first_name} ${review.user.last_name}</div>
                                <small class="text-muted">${formatDate(review.created_at)}</small>
                            </div>
                        </div>
                        <div class="rating">
                            ${generateStarRating(review.rating)}
                        </div>
                    </div>
                    <p class="mb-0">${review.comment}</p>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Favorite button
        const favoriteBtn = document.getElementById('favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }

        // Share button
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareRecipe());
        }

        // Delete button
        const deleteBtn = document.getElementById('delete-recipe-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteRecipe());
        }

        // Review form
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => this.submitReview(e));
        }
    }

    async toggleFavorite() {
        if (!this.isLoggedIn) {
            showToast('Please login to add favorites', 'warning');
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/recipes/${this.recipeId}/favorite`, {
                method: 'POST'
            });

            if (response.ok) {
                const result = await response.json();
                this.recipe.is_favorited = result.favorited;
                this.updateFavoriteButton();
                showToast(result.message, 'success');
            } else {
                throw new Error('Failed to update favorite');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showToast('Failed to update favorite', 'error');
        }
    }

    shareRecipe() {
        if (navigator.share) {
            navigator.share({
                title: this.recipe.title,
                text: this.recipe.description,
                url: window.location.href
            });
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('Recipe URL copied to clipboard!', 'success');
            }).catch(() => {
                showToast('Failed to copy URL', 'error');
            });
        }
    }

    async deleteRecipe() {
        if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/recipes/${this.recipeId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Recipe deleted successfully', 'success');
                setTimeout(() => {
                    window.location.href = '/recipes';
                }, 1500);
            } else {
                throw new Error('Failed to delete recipe');
            }
        } catch (error) {
            console.error('Error deleting recipe:', error);
            showToast('Failed to delete recipe', 'error');
        }
    }

    async submitReview(event) {
        event.preventDefault();
        
        if (!this.isLoggedIn) {
            showToast('Please login to submit a review', 'warning');
            return;
        }

        const formData = new FormData(event.target);
        const reviewData = {
            rating: parseInt(formData.get('rating')),
            comment: formData.get('comment')
        };

        try {
            const response = await fetchWithAuth(`/api/recipes/${this.recipeId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });

            if (response.ok) {
                showToast('Review submitted successfully!', 'success');
                event.target.reset();
                this.loadReviews(); // Reload reviews
                this.loadRecipe(); // Reload recipe to update rating
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showToast(error.message, 'error');
        }
    }

    showError(message) {
        const container = document.getElementById('recipe-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="mb-4">
                        <i class="fas fa-exclamation-triangle fa-3x text-warning"></i>
                    </div>
                    <h4>${message}</h4>
                    <a href="/recipes" class="btn btn-primary mt-3">
                        <i class="fas fa-arrow-left me-2"></i>Back to Recipes
                    </a>
                </div>
            `;
        }
    }
}

// Initialize recipe detail manager when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // recipeId should be available from the template
    if (typeof recipeId !== 'undefined') {
        window.recipeDetailManager = new RecipeDetailManager(recipeId);
        await window.recipeDetailManager.init();
    } else {
        console.error('Recipe ID not found');
    }
});
