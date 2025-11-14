// TastyShare Recipes Page JavaScript

class RecipesManager {
    constructor() {
        this.currentPage = 1;
        this.currentFilters = {};
        this.isLoading = false;
        this.viewMode = 'grid'; // 'grid' or 'list'
        this.init();
    }

    async init() {
        this.initializeSearchFilter();
        this.setupEventListeners();
        this.showAddRecipeFAB();
        await this.loadRecipes();
    }

    initializeSearchFilter() {
        const container = document.getElementById('search-filter-container');
        if (container) {
            container.innerHTML = createSearchFilter();
            this.setupFilterListeners();
        }
    }

    setupFilterListeners() {
        const form = document.getElementById('search-filter-form');
        if (!form) return;

        // Debounced search
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.handleFilterChange();
            }, 500));
        }

        // Filter dropdowns
        const filterSelects = form.querySelectorAll('select');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.handleFilterChange();
            });
        });
    }

    setupEventListeners() {
        // View mode toggle
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');

        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                this.setViewMode('grid');
            });
        }

        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                this.setViewMode('list');
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    setViewMode(mode) {
        this.viewMode = mode;
        
        const gridBtn = document.getElementById('grid-view-btn');
        const listBtn = document.getElementById('list-view-btn');
        const container = document.getElementById('recipes-container');

        if (gridBtn && listBtn && container) {
            if (mode === 'grid') {
                gridBtn.classList.add('active');
                listBtn.classList.remove('active');
                container.className = 'row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4';
            } else {
                listBtn.classList.add('active');
                gridBtn.classList.remove('active');
                container.className = 'row g-3';
            }
            
            // Re-render recipes with new view mode
            this.renderCurrentRecipes();
        }
    }

    showAddRecipeFAB() {
        const fab = document.getElementById('add-recipe-fab');
        if (fab && auth.isAuthenticated()) {
            fab.style.display = 'block';
        }
    }

    async handleFilterChange() {
        this.currentPage = 1;
        this.collectFilters();
        await this.loadRecipes();
    }

    collectFilters() {
        const form = document.getElementById('search-filter-form');
        if (!form) return;

        const formData = new FormData(form);
        this.currentFilters = {};

        for (const [key, value] of formData.entries()) {
            if (value.trim()) {
                this.currentFilters[key] = value.trim();
            }
        }
    }

    async loadRecipes(page = 1) {
        if (this.isLoading) return;

        this.isLoading = true;
        this.currentPage = page;
        this.showLoading(true);

        try {
            const params = new URLSearchParams({
                page: page,
                per_page: 12,
                ...this.currentFilters
            });

            const response = await fetchWithAuth(`/api/recipes?${params}`);
            const data = await response.json();

            if (response.ok) {
                this.renderRecipes(data.recipes);
                this.renderPagination(data.pagination);
                this.updateResultsSummary(data.pagination);
                this.currentRecipes = data.recipes; // Store for view mode switching
            } else {
                throw new Error(data.error || 'Failed to load recipes');
            }
        } catch (error) {
            console.error('Error loading recipes:', error);
            this.showError('Failed to load recipes. Please try again.');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    renderRecipes(recipes) {
        const container = document.getElementById('recipes-container');
        const noResults = document.getElementById('no-results');

        if (!container || !noResults) return;

        if (recipes.length === 0) {
            container.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        container.style.display = 'flex';
        noResults.style.display = 'none';

        if (this.viewMode === 'grid') {
            container.innerHTML = recipes.map(recipe => 
                createRecipeCard(recipe, { cardClass: 'fade-in' })
            ).join('');
        } else {
            container.innerHTML = recipes.map(recipe => 
                this.createRecipeListItem(recipe)
            ).join('');
        }
    }

    renderCurrentRecipes() {
        if (this.currentRecipes) {
            this.renderRecipes(this.currentRecipes);
        }
    }

    createRecipeListItem(recipe) {
        const imageUrl = getImageUrl(recipe.image_url);
        const authorInfo = recipe.author ? `by ${recipe.author.username}` : '';
        
        const favoriteBtn = auth.isAuthenticated() ? 
            `<button class="btn btn-sm btn-outline-danger favorite-btn me-2" 
                     data-recipe-id="${recipe.id}" 
                     data-favorited="${recipe.is_favorited || false}">
                <i class="fas fa-heart ${recipe.is_favorited ? '' : 'text-muted'}"></i>
             </button>` : '';

        return `
            <div class="col-12">
                <div class="card recipe-card fade-in">
                    <div class="row g-0">
                        <div class="col-md-3">
                            <img src="${imageUrl}" class="img-fluid rounded-start h-100" 
                                 alt="${recipe.title}" style="object-fit: cover; min-height: 200px;"
                                 onerror="this.src='/static/images/recipe-placeholder.svg'">
                        </div>
                        <div class="col-md-9">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h5 class="card-title mb-0">${recipe.title}</h5>
                                    <div class="d-flex align-items-center">
                                        ${favoriteBtn}
                                        <a href="/recipe/${recipe.id}" class="btn btn-primary btn-sm">
                                            <i class="fas fa-eye me-1"></i>View
                                        </a>
                                    </div>
                                </div>
                                
                                <p class="card-text text-truncate-2">${recipe.description}</p>
                                
                                <div class="row g-2 mb-3">
                                    <div class="col-auto">
                                        <span class="badge bg-primary">${recipe.category || 'Uncategorized'}</span>
                                    </div>
                                    ${recipe.difficulty_level ? `<div class="col-auto"><span class="badge bg-secondary">${recipe.difficulty_level}</span></div>` : ''}
                                    ${recipe.dietary_preference ? `<div class="col-auto"><span class="badge bg-success">${recipe.dietary_preference}</span></div>` : ''}
                                </div>
                                
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="rating">
                                        ${generateStarRating(recipe.average_rating || 0, 5, false)}
                                        <small class="text-muted">(${recipe.rating_count || 0})</small>
                                    </div>
                                    <div class="text-muted">
                                        ${recipe.total_time ? `<i class="fas fa-clock"></i> ${formatTime(recipe.total_time)}` : ''}
                                        ${authorInfo ? `<small class="ms-3">${authorInfo}</small>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPagination(pagination) {
        const container = document.getElementById('pagination-container');
        if (!container) return;

        container.innerHTML = createPagination(pagination, (page) => {
            this.loadRecipes(page);
        });
    }

    updateResultsSummary(pagination) {
        const summary = document.getElementById('results-summary');
        if (!summary) return;

        const start = ((pagination.page - 1) * pagination.per_page) + 1;
        const end = Math.min(pagination.page * pagination.per_page, pagination.total);
        
        summary.textContent = `Showing ${start}-${end} of ${pagination.total} recipes`;
    }

    showLoading(show) {
        const loading = document.getElementById('loading-container');
        const container = document.getElementById('recipes-container');
        
        if (loading && container) {
            loading.style.display = show ? 'block' : 'none';
            container.style.display = show ? 'none' : 'flex';
        }
    }

    showError(message) {
        showToast(message, 'error');
        const container = document.getElementById('recipes-container');
        const noResults = document.getElementById('no-results');
        
        if (container && noResults) {
            container.style.display = 'none';
            noResults.style.display = 'block';
            
            const noResultsContent = noResults.querySelector('h4');
            if (noResultsContent) {
                noResultsContent.textContent = 'Error loading recipes';
            }
        }
    }

    clearFilters() {
        const form = document.getElementById('search-filter-form');
        if (form) {
            form.reset();
            this.currentFilters = {};
            this.currentPage = 1;
            this.loadRecipes();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const recipesManager = new RecipesManager();
    window.recipesManager = recipesManager; // Make available globally for debugging
});
