// Add Recipe Page JavaScript

// Robust function to force hide modal (handles static backdrop)
function forceHideModal(modalElement) {
    if (!modalElement) {
        console.log('No modal element provided to forceHideModal');
        return;
    }
    
    console.log('Force hiding modal...');
    
    // Try Bootstrap's hide method first
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
        console.log('Using Bootstrap modal hide method');
        modal.hide();
    } else {
        console.log('No Bootstrap modal instance found, forcing hide');
    }
    
    // Force cleanup immediately - multiple approaches
    modalElement.classList.remove('show', 'fade');
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.setAttribute('style', 'display: none !important');
    modalElement.removeAttribute('aria-modal');
    modalElement.style.visibility = 'hidden';
    modalElement.style.opacity = '0';
    
    // Remove modal-open class from body and reset styles
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.style.paddingLeft = '';
    
    // Remove all modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    console.log(`Found ${backdrops.length} backdrops to remove`);
    backdrops.forEach(backdrop => {
        backdrop.remove();
    });
    
    // Reset modal attributes
    modalElement.removeAttribute('data-bs-backdrop');
    modalElement.removeAttribute('data-bs-keyboard');
    
    // Force remove any remaining modal-related classes
    modalElement.className = modalElement.className.replace(/show|fade/g, '');
    
    console.log('Modal force hide completed');
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!auth.isAuthenticated()) {
        showToast('Please log in to add recipes', 'warning');
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }

    initializeForm();
    setupEventListeners();
});

function initializeForm() {
    // Calculate total time
    const prepTimeInput = document.getElementById('prep-time');
    const cookTimeInput = document.getElementById('cook-time');
    const totalTimeInput = document.getElementById('total-time');

    function updateTotalTime() {
        const prepTime = parseInt(prepTimeInput.value) || 0;
        const cookTime = parseInt(cookTimeInput.value) || 0;
        totalTimeInput.value = prepTime + cookTime;
    }

    prepTimeInput.addEventListener('input', updateTotalTime);
    cookTimeInput.addEventListener('input', updateTotalTime);

    // Initialize with one ingredient and instruction
    updateStepNumbers();
}

function setupEventListeners() {
    const form = document.getElementById('add-recipe-form');
    const addIngredientBtn = document.getElementById('add-ingredient');
    const addInstructionBtn = document.getElementById('add-instruction');
    const imageInput = document.getElementById('recipe-image');
    const removeImageBtn = document.getElementById('remove-image');
    const saveDraftBtn = document.getElementById('save-draft');

    // Form submission
    form.addEventListener('submit', handleRecipeSubmission);

    // Add ingredient
    addIngredientBtn.addEventListener('click', addIngredientField);

    // Add instruction
    addInstructionBtn.addEventListener('click', addInstructionField);

    // Image handling
    imageInput.addEventListener('change', handleImagePreview);
    removeImageBtn.addEventListener('click', removeImagePreview);

    // Save draft
    saveDraftBtn.addEventListener('click', saveDraft);

    // Dynamic ingredient/instruction removal
    document.addEventListener('click', function(e) {
        if (e.target.closest('.remove-ingredient')) {
            removeIngredientField(e.target.closest('.ingredient-item'));
        }
        if (e.target.closest('.remove-instruction')) {
            removeInstructionField(e.target.closest('.instruction-item'));
        }
    });

    // Real-time validation
    setupRealTimeValidation();
}

function addIngredientField() {
    const container = document.getElementById('ingredients-container');
    const ingredientItem = document.createElement('div');
    ingredientItem.className = 'ingredient-item mb-2';
    
    ingredientItem.innerHTML = `
        <div class="input-group">
            <input type="text" class="form-control ingredient-input" 
                   placeholder="e.g., 2 cups all-purpose flour" required>
            <button class="btn btn-outline-danger remove-ingredient" type="button">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(ingredientItem);
    ingredientItem.querySelector('input').focus();
}

function removeIngredientField(ingredientItem) {
    const container = document.getElementById('ingredients-container');
    const items = container.querySelectorAll('.ingredient-item');
    
    if (items.length > 1) {
        ingredientItem.remove();
    } else {
        showToast('At least one ingredient is required', 'warning');
    }
}

function addInstructionField() {
    const container = document.getElementById('instructions-container');
    const instructionItem = document.createElement('div');
    instructionItem.className = 'instruction-item mb-2';
    
    const stepNumber = container.querySelectorAll('.instruction-item').length + 1;
    
    instructionItem.innerHTML = `
        <div class="input-group">
            <span class="input-group-text step-number">${stepNumber}</span>
            <textarea class="form-control instruction-input" rows="2" 
                      placeholder="Describe this step in detail..." required></textarea>
            <button class="btn btn-outline-danger remove-instruction" type="button">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(instructionItem);
    instructionItem.querySelector('textarea').focus();
}

function removeInstructionField(instructionItem) {
    const container = document.getElementById('instructions-container');
    const items = container.querySelectorAll('.instruction-item');
    
    if (items.length > 1) {
        instructionItem.remove();
        updateStepNumbers();
    } else {
        showToast('At least one instruction step is required', 'warning');
    }
}

function updateStepNumbers() {
    const container = document.getElementById('instructions-container');
    const stepNumbers = container.querySelectorAll('.step-number');
    
    stepNumbers.forEach((stepNumber, index) => {
        stepNumber.textContent = index + 1;
    });
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showToast('Please select a valid image file (JPG, PNG, GIF, WebP)', 'error');
        e.target.value = '';
        return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        showToast('Image file must be less than 5MB', 'error');
        e.target.value = '';
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewContainer = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removeImagePreview() {
    const imageInput = document.getElementById('recipe-image');
    const previewContainer = document.getElementById('image-preview');
    
    imageInput.value = '';
    previewContainer.style.display = 'none';
}

function setupRealTimeValidation() {
    const form = document.getElementById('add-recipe-form');
    
    // Validate required fields on blur
    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
    });

    // Validate ingredients and instructions in real-time
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('ingredient-input')) {
            validateIngredients();
        }
        if (e.target.classList.contains('instruction-input')) {
            validateInstructions();
        }
    });
}

function validateField(field) {
    clearFieldError(field.id);
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        setFieldError(field.id, 'This field is required');
        return false;
    }
    
    // Specific validations
    switch (field.id) {
        case 'title':
            if (field.value.length < 3) {
                setFieldError(field.id, 'Title must be at least 3 characters long');
                return false;
            }
            break;
        case 'servings':
            const servings = parseInt(field.value);
            if (servings < 1 || servings > 50) {
                setFieldError(field.id, 'Servings must be between 1 and 50');
                return false;
            }
            break;
        case 'prep-time':
        case 'cook-time':
            const time = parseInt(field.value);
            if (time < 0 || time > 600) {
                setFieldError(field.id, 'Time must be between 0 and 600 minutes');
                return false;
            }
            break;
        case 'video-url':
            if (field.value && !isValidUrl(field.value)) {
                setFieldError(field.id, 'Please enter a valid URL');
                return false;
            }
            break;
    }
    
    return true;
}

function validateIngredients() {
    const ingredients = document.querySelectorAll('.ingredient-input');
    const errorElement = document.getElementById('ingredients-error');
    
    let hasValidIngredient = false;
    ingredients.forEach(input => {
        if (input.value.trim()) {
            hasValidIngredient = true;
        }
    });
    
    if (!hasValidIngredient) {
        errorElement.textContent = 'At least one ingredient is required';
        errorElement.style.display = 'block';
        return false;
    } else {
        errorElement.style.display = 'none';
        return true;
    }
}

function validateInstructions() {
    const instructions = document.querySelectorAll('.instruction-input');
    const errorElement = document.getElementById('instructions-error');
    
    let hasValidInstruction = false;
    instructions.forEach(input => {
        if (input.value.trim()) {
            hasValidInstruction = true;
        }
    });
    
    if (!hasValidInstruction) {
        errorElement.textContent = 'At least one instruction step is required';
        errorElement.style.display = 'block';
        return false;
    } else {
        errorElement.style.display = 'none';
        return true;
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

async function handleRecipeSubmission(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateRecipeForm()) {
        showToast('Please fix the errors before submitting', 'error');
        return;
    }
    
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('recipe-loading-modal'));
    loadingModal.show();
    
    try {
        const formData = collectFormData();
        const result = await submitRecipe(formData);
        
        if (result.success) {
            // Hide modal on success
            forceHideModal(document.getElementById('recipe-loading-modal'));
            showToast('Recipe published successfully!', 'success');
            setTimeout(() => {
                window.location.href = `/recipe/${result.recipe.id}`;
            }, 1500);
        } else {
            // Force hide modal on error
            console.log('Recipe submission failed, hiding modal...');
            forceHideModal(document.getElementById('recipe-loading-modal'));
            
            // Wait a bit for modal to hide, then show error
            setTimeout(() => {
                // Double-check if modal is still showing and force remove it
                const modalElement = document.getElementById('recipe-loading-modal');
                if (modalElement && modalElement.classList.contains('show')) {
                    console.log('Recipe modal still showing, removing from DOM');
                    modalElement.remove();
                }
                showToast(result.error || 'Failed to publish recipe', 'error');
            }, 300);
        }
    } catch (error) {
        // Force hide modal on error
        console.log('Recipe submission error, hiding modal...');
        forceHideModal(document.getElementById('recipe-loading-modal'));
        
        // Wait a bit for modal to hide, then show error
        setTimeout(() => {
            // Double-check if modal is still showing and force remove it
            const modalElement = document.getElementById('recipe-loading-modal');
            if (modalElement && modalElement.classList.contains('show')) {
                console.log('Recipe modal still showing in catch block, removing from DOM');
                modalElement.remove();
            }
            console.error('Recipe submission error:', error);
            showToast('Failed to publish recipe. Please try again.', 'error');
        }, 300);
    }
}

function validateRecipeForm() {
    let isValid = true;
    
    // Clear all errors first
    clearAllErrors('add-recipe-form');
    
    // Validate required fields
    const requiredFields = document.querySelectorAll('#add-recipe-form [required]');
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Validate ingredients and instructions
    if (!validateIngredients()) {
        isValid = false;
    }
    
    if (!validateInstructions()) {
        isValid = false;
    }
    
    return isValid;
}

function collectFormData() {
    const formData = new FormData();
    const form = document.getElementById('add-recipe-form');
    
    // Basic fields
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('description', document.getElementById('description').value.trim());
    formData.append('servings', document.getElementById('servings').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('cuisine_type', document.getElementById('cuisine-type').value);
    formData.append('dietary_preference', document.getElementById('dietary-preference').value);
    formData.append('difficulty_level', document.getElementById('difficulty-level').value);
    formData.append('prep_time', document.getElementById('prep-time').value);
    formData.append('cook_time', document.getElementById('cook-time').value);
    formData.append('total_time', document.getElementById('total-time').value);
    formData.append('video_url', document.getElementById('video-url').value.trim());
    formData.append('tags', document.getElementById('tags').value.trim());
    
    // Ingredients
    const ingredients = [];
    document.querySelectorAll('.ingredient-input').forEach(input => {
        if (input.value.trim()) {
            ingredients.push(input.value.trim());
        }
    });
    formData.append('ingredients', JSON.stringify(ingredients));
    
    // Instructions
    const instructions = [];
    document.querySelectorAll('.instruction-input').forEach(input => {
        if (input.value.trim()) {
            instructions.push(input.value.trim());
        }
    });
    formData.append('instructions', JSON.stringify(instructions));
    
    // Image file
    const imageFile = document.getElementById('recipe-image').files[0];
    if (imageFile) {
        formData.append('recipe_image', imageFile);
    }
    
    return formData;
}

async function submitRecipe(formData) {
    try {
        // Ensure HTTPS URL in production
        const apiUrl = window.Config ? window.Config.getApiUrl('/api/recipes') : '/api/recipes';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`
                // Don't set Content-Type for FormData, let browser set it with boundary
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, recipe: data.recipe };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Submit recipe error:', error);
        return { success: false, error: 'Network error. Please try again.' };
    }
}

async function saveDraft() {
    showToast('Draft functionality will be implemented soon!', 'info');
    // Draft saving functionality
}

// Save functionality (save to localStorage)
function autoSave() {
    const formData = {};
    const form = document.getElementById('add-recipe-form');
    
    // Save form data to localStorage
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type !== 'file') {
            formData[input.name || input.id] = input.value;
        }
    });
    
    // Save ingredients and instructions separately
    const ingredients = [];
    document.querySelectorAll('.ingredient-input').forEach(input => {
        if (input.value.trim()) ingredients.push(input.value.trim());
    });
    formData.ingredients = ingredients;
    
    const instructions = [];
    document.querySelectorAll('.instruction-input').forEach(input => {
        if (input.value.trim()) instructions.push(input.value.trim());
    });
    formData.instructions = instructions;
    
    localStorage.setItem('tastyshare_recipe_draft', JSON.stringify(formData));
}

// Load auto-saved data
function loadAutoSave() {
    const savedData = localStorage.getItem('tastyshare_recipe_draft');
    if (!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        // Restore form fields
        Object.keys(formData).forEach(key => {
            const field = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (field && key !== 'ingredients' && key !== 'instructions') {
                field.value = formData[key];
            }
        });
        
        // Restore ingredients
        if (formData.ingredients && formData.ingredients.length > 0) {
            const container = document.getElementById('ingredients-container');
            container.innerHTML = '';
            
            formData.ingredients.forEach(ingredient => {
                addIngredientField();
                const inputs = container.querySelectorAll('.ingredient-input');
                inputs[inputs.length - 1].value = ingredient;
            });
        }
        
        // Restore instructions
        if (formData.instructions && formData.instructions.length > 0) {
            const container = document.getElementById('instructions-container');
            container.innerHTML = '';
            
            formData.instructions.forEach(instruction => {
                addInstructionField();
                const inputs = container.querySelectorAll('.instruction-input');
                inputs[inputs.length - 1].value = instruction;
            });
            
            updateStepNumbers();
        }
        
        showToast('Draft data restored', 'info');
    } catch (error) {
        console.error('Error loading auto-save data:', error);
    }
}

// Save every 30 seconds
setInterval(autoSave, 30000);

// Load auto-save data when page loads
window.addEventListener('load', loadAutoSave);

// Clear auto-save data when recipe is successfully submitted
window.addEventListener('beforeunload', function() {
    // Only clear if we're navigating to a recipe page (successful submission)
    if (window.location.href.includes('/recipe/')) {
        localStorage.removeItem('tastyshare_recipe_draft');
    }
});
