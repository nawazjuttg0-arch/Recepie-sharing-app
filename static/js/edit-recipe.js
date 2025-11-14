// Edit Recipe Page JavaScript

class EditRecipeManager {
    constructor(recipeId) {
        this.recipeId = recipeId;
        this.recipe = null;
        this.ingredientsCount = 0;
        this.instructionsCount = 0;
        this.init();
    }

    async init() {
        try {
            await this.loadRecipe();
            this.setupEventListeners();
            this.populateForm();
            this.showForm();
        } catch (error) {
            console.error('Failed to initialize edit recipe:', error);
            this.showError('Failed to load recipe data', 'Recipe not found or access denied.');
        }
    }

    async loadRecipe() {
        try {
            showLoading(true);
            
            const response = await fetchWithAuth(`/api/recipes/${this.recipeId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Recipe not found');
                } else if (response.status === 403) {
                    throw new Error('Access denied');
                } else {
                    throw new Error(`Failed to load recipe: ${response.status}`);
                }
            }
            
            const data = await response.json();
            this.recipe = data.recipe;
            
        } catch (error) {
            console.error('Error loading recipe:', error);
            throw error;
        } finally {
            showLoading(false);
        }
    }

    populateForm() {
        if (!this.recipe) return;

        // Basic information
        document.getElementById('title').value = this.recipe.title || '';
        document.getElementById('description').value = this.recipe.description || '';
        document.getElementById('category').value = this.recipe.category || '';
        document.getElementById('cuisine_type').value = this.recipe.cuisine_type || '';
        document.getElementById('dietary_preference').value = this.recipe.dietary_preference || '';
        document.getElementById('difficulty_level').value = this.recipe.difficulty_level || '';

        // Timing and servings
        document.getElementById('prep_time').value = this.recipe.prep_time || '';
        document.getElementById('cook_time').value = this.recipe.cook_time || '';
        document.getElementById('servings').value = this.recipe.servings || 1;
        document.getElementById('calories_per_serving').value = this.recipe.calories_per_serving || '';

        // Additional information
        document.getElementById('video_url').value = this.recipe.video_url || '';
        
        // Parse and display tags
        if (this.recipe.tags) {
            try {
                const tagsArray = JSON.parse(this.recipe.tags);
                document.getElementById('tags').value = tagsArray.join(', ');
            } catch (e) {
                document.getElementById('tags').value = this.recipe.tags || '';
            }
        }

        // Current image
        if (this.recipe.image_url) {
            const currentImageDiv = document.getElementById('current-image');
            const currentImageImg = document.getElementById('current-image-preview');
            currentImageImg.src = this.recipe.image_url;
            currentImageDiv.style.display = 'block';
        }

        // Populate ingredients
        this.populateIngredients();

        // Populate instructions
        this.populateInstructions();
    }

    populateIngredients() {
        const container = document.getElementById('ingredients-container');
        container.innerHTML = '';
        this.ingredientsCount = 0;

        let ingredients = [];
        if (Array.isArray(this.recipe.ingredients)) {
            ingredients = this.recipe.ingredients;
        } else if (this.recipe.ingredients) {
            try {
                ingredients = JSON.parse(this.recipe.ingredients);
            } catch (e) {
                ingredients = this.recipe.ingredients.split('\n').filter(item => item.trim());
            }
        }

        if (ingredients.length === 0) {
            ingredients = [''];
        }

        ingredients.forEach(ingredient => {
            this.addIngredientField(ingredient.trim());
        });
    }

    populateInstructions() {
        const container = document.getElementById('instructions-container');
        container.innerHTML = '';
        this.instructionsCount = 0;

        let instructions = [];
        if (Array.isArray(this.recipe.instructions)) {
            instructions = this.recipe.instructions;
        } else if (this.recipe.instructions) {
            try {
                instructions = JSON.parse(this.recipe.instructions);
            } catch (e) {
                instructions = this.recipe.instructions.split('\n').filter(item => item.trim());
            }
        }

        if (instructions.length === 0) {
            instructions = [''];
        }

        instructions.forEach(instruction => {
            this.addInstructionField(instruction.trim());
        });
    }

    addIngredientField(value = '') {
        const container = document.getElementById('ingredients-container');
        const ingredientDiv = document.createElement('div');
        ingredientDiv.className = 'ingredient-item p-3';
        ingredientDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="flex-grow-1 me-2">
                    <input type="text" class="form-control ingredient-input" 
                           placeholder="e.g., 2 cups all-purpose flour" 
                           value="${value}" required>
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm remove-btn" 
                        onclick="this.closest('.ingredient-item').remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(ingredientDiv);
        this.ingredientsCount++;
    }

    addInstructionField(value = '') {
        const container = document.getElementById('instructions-container');
        const instructionDiv = document.createElement('div');
        instructionDiv.className = 'instruction-item p-3';
        
        const stepNumber = this.instructionsCount + 1;
        instructionDiv.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="step-number">${stepNumber}</div>
                <div class="flex-grow-1 me-2">
                    <textarea class="form-control instruction-input" rows="2" 
                              placeholder="Describe this step in detail..." 
                              required>${value}</textarea>
                </div>
                <button type="button" class="btn btn-outline-danger btn-sm remove-btn" 
                        onclick="this.removeInstruction(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(instructionDiv);
        this.instructionsCount++;
    }

    removeInstruction(button) {
        button.closest('.instruction-item').remove();
        this.updateInstructionNumbers();
    }

    updateInstructionNumbers() {
        const instructionItems = document.querySelectorAll('.instruction-item');
        instructionItems.forEach((item, index) => {
            const stepNumber = item.querySelector('.step-number');
            if (stepNumber) {
                stepNumber.textContent = index + 1;
            }
        });
        this.instructionsCount = instructionItems.length;
    }

    setupEventListeners() {
        // Add ingredient button
        document.getElementById('add-ingredient-btn').addEventListener('click', () => {
            this.addIngredientField();
        });

        // Add instruction button
        document.getElementById('add-instruction-btn').addEventListener('click', () => {
            this.addInstructionField();
        });

        // Image preview
        document.getElementById('recipe_image').addEventListener('change', (e) => {
            this.previewImage(e.target);
        });

        // Form submission
        document.getElementById('edit-recipe-form').addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });

        // Auto-update instruction numbers when instructions are removed
        document.addEventListener('click', (e) => {
            if (e.target.closest('.instruction-item .remove-btn')) {
                setTimeout(() => this.updateInstructionNumbers(), 10);
            }
        });
    }

    previewImage(input) {
        const previewDiv = document.getElementById('image-preview');
        const previewImg = document.getElementById('image-preview-img');

        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewDiv.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
        } else {
            previewDiv.style.display = 'none';
        }
    }

    collectFormData() {
        // Collect ingredients
        const ingredientInputs = document.querySelectorAll('.ingredient-input');
        const ingredients = Array.from(ingredientInputs)
            .map(input => input.value.trim())
            .filter(value => value);

        if (ingredients.length === 0) {
            throw new Error('At least one ingredient is required');
        }

        // Collect instructions
        const instructionInputs = document.querySelectorAll('.instruction-input');
        const instructions = Array.from(instructionInputs)
            .map(input => input.value.trim())
            .filter(value => value);

        if (instructions.length === 0) {
            throw new Error('At least one instruction step is required');
        }

        // Parse tags
        const tagsInput = document.getElementById('tags').value.trim();
        let tags = '';
        if (tagsInput) {
            const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
            tags = JSON.stringify(tagsArray);
        }

        return {
            title: document.getElementById('title').value.trim(),
            description: document.getElementById('description').value.trim(),
            category: document.getElementById('category').value,
            cuisine_type: document.getElementById('cuisine_type').value,
            dietary_preference: document.getElementById('dietary_preference').value,
            difficulty_level: document.getElementById('difficulty_level').value,
            prep_time: document.getElementById('prep_time').value || null,
            cook_time: document.getElementById('cook_time').value || null,
            servings: document.getElementById('servings').value || 1,
            calories_per_serving: document.getElementById('calories_per_serving').value || null,
            video_url: document.getElementById('video_url').value.trim(),
            ingredients: JSON.stringify(ingredients),
            instructions: JSON.stringify(instructions),
            tags: tags
        };
    }

    async handleSubmit(event) {
        event.preventDefault();

        try {
            // Disable submit button
            const submitBtn = document.getElementById('update-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Updating...';

            // Collect form data
            const recipeData = this.collectFormData();

            // Create FormData for file upload
            const formData = new FormData();
            
            // Add all recipe data
            Object.keys(recipeData).forEach(key => {
                if (recipeData[key] !== null && recipeData[key] !== '') {
                    formData.append(key, recipeData[key]);
                }
            });

            // Add image if selected
            const imageFile = document.getElementById('recipe_image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // Submit update
            const response = await fetchWithAuth(`/api/recipes/${this.recipeId}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                showToast('Recipe updated successfully!', 'success');
                
                // Redirect to recipe detail page
                setTimeout(() => {
                    window.location.href = `/recipe/${this.recipeId}`;
                }, 1500);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update recipe');
            }

        } catch (error) {
            console.error('Error updating recipe:', error);
            showToast(error.message, 'error');

            // Re-enable submit button
            const submitBtn = document.getElementById('update-btn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Update Recipe';
        }
    }

    showForm() {
        document.getElementById('loading-container').style.display = 'none';
        document.getElementById('edit-form-container').style.display = 'block';
    }

    showError(title, message) {
        document.getElementById('loading-container').style.display = 'none';
        document.getElementById('error-title').textContent = title;
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-container').style.display = 'block';
    }
}

// Initialize edit recipe manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!window.auth || !window.auth.isAuthenticated()) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }

    if (typeof recipeId !== 'undefined') {
        window.editRecipeManager = new EditRecipeManager(recipeId);
    } else {
        console.error('Recipe ID not found');
        document.getElementById('loading-container').style.display = 'none';
        document.getElementById('error-container').style.display = 'block';
    }
});