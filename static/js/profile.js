// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!auth.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    // Initialize profile page
    loadProfileData();
    setupEventListeners();
});

function setupEventListeners() {
    // Edit profile button
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showEditProfileModal);
    }

    // Change password button
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', showChangePasswordModal);
    }

    // Save profile button
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }

    // Save password button
    const savePasswordBtn = document.getElementById('save-password-btn');
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', changePassword);
    }

    // Tab change events
    const tabButtons = document.querySelectorAll('#profile-tabs button[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', function(event) {
            const target = event.target.getAttribute('data-bs-target');
            if (target === '#my-recipes') {
                loadMyRecipes();
            } else if (target === '#favorites') {
                loadFavorites();
            } else if (target === '#reviews') {
                loadReviews();
            }
        });
    });
}

async function loadProfileData() {
    try {
        const response = await fetch('/api/auth/profile', {
            method: 'GET',
            headers: auth.getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            displayProfileData(data.user);
        } else {
            showToast('Failed to load profile data', 'error');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile data', 'error');
    }
}

function displayProfileData(user) {
    // Update profile information
    document.getElementById('profile-username').textContent = user.username;
    document.getElementById('profile-name').textContent = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name provided';
    document.getElementById('profile-bio').textContent = user.bio || 'No bio provided';
    
    // Update avatar
    const avatar = document.getElementById('profile-avatar');
    if (user.profile_image && user.profile_image !== 'default_avatar.png') {
        avatar.src = `/static/uploads/avatars/${user.profile_image}`;
    } else {
        avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=007bff&color=fff&size=120`;
    }

    // Update stats (these will be loaded separately)
    // For now, show loading state
    document.getElementById('total-recipes').textContent = '0';
    document.getElementById('total-views').textContent = '0';
    document.getElementById('total-favorites').textContent = '0';
    document.getElementById('member-since').textContent = user.created_at ? new Date(user.created_at).getFullYear() : '-';

    // Load dashboard data for stats
    loadDashboardData();
}

async function loadDashboardData() {
    try {
        const response = await fetch('/api/user/dashboard', {
            method: 'GET',
            headers: auth.getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            updateStats(data.stats);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function updateStats(stats) {
    document.getElementById('total-recipes').textContent = stats.total_recipes || 0;
    document.getElementById('total-views').textContent = stats.total_views || 0;
    document.getElementById('total-favorites').textContent = stats.total_favorites || 0;
}

function showEditProfileModal() {
    // Load current user data into form
    const user = auth.user;
    if (user) {
        document.getElementById('edit-first-name').value = user.first_name || '';
        document.getElementById('edit-last-name').value = user.last_name || '';
        document.getElementById('edit-email').value = user.email || '';
        document.getElementById('edit-phone').value = user.phone || '';
        document.getElementById('edit-bio').value = user.bio || '';
    }

    const modal = new bootstrap.Modal(document.getElementById('edit-profile-modal'));
    modal.show();
}

function showChangePasswordModal() {
    // Clear form
    document.getElementById('change-password-form').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('change-password-modal'));
    modal.show();
}

async function saveProfile() {
    const form = document.getElementById('edit-profile-form');
    const formData = new FormData(form);
    
    const data = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        bio: formData.get('bio')
    };

    try {
        const response = await fetch('/api/auth/profile', {
            method: 'PUT',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            auth.user = result.user;
            localStorage.setItem('tastyshare_user', JSON.stringify(auth.user));
            
            showToast('Profile updated successfully!', 'success');
            displayProfileData(auth.user);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('edit-profile-modal'));
            modal.hide();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile', 'error');
    }
}

async function changePassword() {
    const form = document.getElementById('change-password-form');
    const formData = new FormData(form);
    
    const newPassword = formData.get('new_password');
    const confirmPassword = formData.get('confirm_password');
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showToast('Password must be at least 8 characters long', 'error');
        return;
    }

    const data = {
        current_password: formData.get('current_password'),
        new_password: newPassword
    };

    try {
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: auth.getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast('Password changed successfully!', 'success');
            form.reset();
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('change-password-modal'));
            modal.hide();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Failed to change password', 'error');
    }
}

async function loadMyRecipes() {
    const content = document.getElementById('my-recipes-content');
    content.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading your recipes...</p>
        </div>
    `;

    try {
        const response = await fetch('/api/user/recipes', {
            method: 'GET',
            headers: auth.getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            displayMyRecipes(data.recipes);
        } else {
            content.innerHTML = '<div class="alert alert-warning">Failed to load recipes</div>';
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
        content.innerHTML = '<div class="alert alert-danger">Failed to load recipes</div>';
    }
}

function displayMyRecipes(recipes) {
    const content = document.getElementById('my-recipes-content');
    
    if (recipes.length === 0) {
        content.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-book fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No recipes yet</h5>
                <p class="text-muted">Start sharing your delicious recipes!</p>
                <a href="/add-recipe" class="btn btn-primary">
                    <i class="fas fa-plus me-2"></i>Add Your First Recipe
                </a>
            </div>
        `;
        return;
    }

    const recipesHtml = recipes.map(recipe => `
        <div class="card mb-3">
            <div class="row g-0">
                <div class="col-md-3">
                    <img src="${recipe.image_url || '/static/images/recipe-placeholder.svg'}" 
                         class="img-fluid rounded-start h-100 object-cover" 
                         alt="${recipe.title}">
                </div>
                <div class="col-md-9">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title">${recipe.title}</h5>
                                <p class="card-text text-muted">${recipe.description || 'No description'}</p>
                                <div class="d-flex align-items-center text-muted small">
                                    <i class="fas fa-clock me-1"></i>
                                    <span class="me-3">${recipe.prep_time} min</span>
                                    <i class="fas fa-eye me-1"></i>
                                    <span class="me-3">${recipe.view_count || 0} views</span>
                                    <span class="badge ${recipe.is_published ? 'bg-success' : 'bg-warning'}">
                                        ${recipe.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    Actions
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="/recipe/${recipe.id}">
                                        <i class="fas fa-eye me-2"></i>View
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="editRecipe(${recipe.id})">
                                        <i class="fas fa-edit me-2"></i>Edit
                                    </a></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="deleteRecipe(${recipe.id})">
                                        <i class="fas fa-trash me-2"></i>Delete
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    content.innerHTML = recipesHtml;
}

async function loadFavorites() {
    const content = document.getElementById('favorites-content');
    content.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading your favorites...</p>
        </div>
    `;

    try {
        const response = await fetchWithAuth('/api/user/favorites');
        
        if (!response.ok) {
            throw new Error('Failed to load favorites');
        }

        const data = await response.json();
        const favorites = data.favorites || [];
        
        if (favorites.length === 0) {
        content.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No favorites yet</h5>
                <p class="text-muted">Start exploring recipes and add them to your favorites!</p>
                <a href="/recipes" class="btn btn-primary">
                    <i class="fas fa-search me-2"></i>Browse Recipes
                </a>
            </div>
        `;
        } else {
            // Display favorites
            let favoritesHTML = '<div class="row g-4">';
            
            favorites.forEach(favorite => {
                const recipe = favorite.recipe;
                favoritesHTML += `
                    <div class="col-12 col-md-6 col-lg-4">
                        <div class="card recipe-card h-100 shadow-sm border-0">
                            <div class="position-relative">
                                <img src="${recipe.image_url || '/static/images/recipe-placeholder.svg'}" 
                                     class="card-img-top" 
                                     alt="${recipe.title}"
                                     style="height: 250px; object-fit: cover;">
                                <div class="position-absolute top-0 end-0 p-2">
                                    <button class="btn btn-sm btn-danger" 
                                            onclick="removeFromFavorites(${favorite.id}, ${recipe.id})"
                                            title="Remove from favorites">
                                        <i class="fas fa-heart-broken"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body d-flex flex-column p-3">
                                <h5 class="card-title mb-2">${recipe.title}</h5>
                                <p class="card-text text-muted flex-grow-1 mb-3">
                                    ${recipe.description ? recipe.description.substring(0, 120) + '...' : 'No description available'}
                                </p>
                                <div class="mt-auto">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <small class="text-muted">
                                            <i class="fas fa-clock me-1"></i>${recipe.prep_time + recipe.cook_time} min
                                        </small>
                                        <small class="text-muted">
                                            <i class="fas fa-users me-1"></i>${recipe.servings} servings
                                        </small>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="badge bg-primary">${recipe.category}</span>
                                        <small class="text-muted">by ${recipe.author}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer bg-transparent p-3">
                                <a href="/recipe/${recipe.id}" class="btn btn-primary w-100">
                                    <i class="fas fa-eye me-2"></i>View Recipe
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            favoritesHTML += '</div>';
            
            // Add pagination if needed
            if (data.pagination && data.pagination.pages > 1) {
                favoritesHTML += createPagination(data.pagination, loadFavorites);
            }
            
            content.innerHTML = favoritesHTML;
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        content.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h5 class="text-danger">Error loading favorites</h5>
                <p class="text-muted">There was a problem loading your favorite recipes.</p>
                <button class="btn btn-primary" onclick="loadFavorites()">
                    <i class="fas fa-refresh me-2"></i>Try Again
                </button>
            </div>
        `;
    }
}

async function removeFromFavorites(favoriteId, recipeId) {
    try {
        const response = await fetchWithAuth(`/api/recipes/${recipeId}/favorite`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showToast('Recipe removed from favorites', 'success');
            loadFavorites(); // Reload the favorites list
        } else {
            throw new Error('Failed to remove from favorites');
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        showToast('Failed to remove from favorites', 'error');
    }
}

async function loadReviews() {
    const content = document.getElementById('reviews-content');
    content.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading your reviews...</p>
        </div>
    `;

    // Reviews loading functionality
    setTimeout(() => {
        content.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-star fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No reviews yet</h5>
                <p class="text-muted">Start reviewing recipes you've tried!</p>
                <a href="/recipes" class="btn btn-primary">
                    <i class="fas fa-search me-2"></i>Browse Recipes
                </a>
            </div>
        `;
    }, 1000);
}

// Load initial data
loadMyRecipes();
