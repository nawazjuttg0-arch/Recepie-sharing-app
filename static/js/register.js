// Register Page JavaScript

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
    const registerForm = document.getElementById('register-form');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirm-password');
    const usernameField = document.getElementById('username');
    
    // Handle form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Handle password toggle buttons
    if (togglePasswordBtn && passwordField) {
        togglePasswordBtn.addEventListener('click', function() {
            togglePasswordVisibility(passwordField, this);
        });
    }
    
    if (toggleConfirmPasswordBtn && confirmPasswordField) {
        toggleConfirmPasswordBtn.addEventListener('click', function() {
            togglePasswordVisibility(confirmPasswordField, this);
        });
    }
    
    // Real-time validation
    if (usernameField) {
        usernameField.addEventListener('blur', validateUsernameField);
        usernameField.addEventListener('input', debounce(validateUsernameField, 500));
    }
    
    if (passwordField) {
        passwordField.addEventListener('input', validatePasswordField);
    }
    
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', validateConfirmPasswordField);
    }
    
    // Check if already logged in
    if (auth.isAuthenticated()) {
        window.location.href = '/';
    }
});

function togglePasswordVisibility(field, button) {
    const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
    field.setAttribute('type', type);
    
    const icon = button.querySelector('i');
    icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}

async function handleRegister(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearAllErrors('register-form');
    
    const formData = new FormData(e.target);
    const userData = {
        username: formData.get('username').trim(),
        email: formData.get('email').trim().toLowerCase(),
        password: formData.get('password'),
        confirm_password: formData.get('confirm_password'),
        first_name: formData.get('first_name').trim(),
        last_name: formData.get('last_name').trim(),
        phone: formData.get('phone').trim()
    };
    
    // Validate inputs
    if (!validateAllFields(userData)) {
        return;
    }
    
    // Remove confirm_password from data to send
    delete userData.confirm_password;
    
    // Show loading modal
    const loadingModal = new bootstrap.Modal(document.getElementById('loading-modal'));
    loadingModal.show();
    
    try {
        const result = await auth.register(userData);
        
        if (result.success) {
            // Hide modal on success
            forceHideModal(document.getElementById('loading-modal'));
            showToast('Registration successful! Welcome to TastyShare!', 'success');
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            // Force hide modal on error
            console.log('Registration failed, hiding modal...');
            forceHideModal(document.getElementById('loading-modal'));
            
            // Wait a bit for modal to hide, then show error
            setTimeout(() => {
                // Double-check if modal is still showing and force remove it
                const modalElement = document.getElementById('loading-modal');
                if (modalElement && modalElement.classList.contains('show')) {
                    console.log('Registration modal still showing, removing from DOM');
                    modalElement.remove();
                }
                showToast(result.error || 'Registration failed', 'error');
                
                // Highlight relevant fields based on error
                highlightErrorField(result.error);
            }, 300);
        }
    } catch (error) {
        // Force hide modal on error
        console.log('Registration error, hiding modal...');
        forceHideModal(document.getElementById('loading-modal'));
        
        // Wait a bit for modal to hide, then show error
        setTimeout(() => {
            // Double-check if modal is still showing and force remove it
            const modalElement = document.getElementById('loading-modal');
            if (modalElement && modalElement.classList.contains('show')) {
                console.log('Registration modal still showing in catch block, removing from DOM');
                modalElement.remove();
            }
            console.error('Registration error:', error);
            showToast('Registration failed. Please try again.', 'error');
        }, 300);
    }
}

function validateAllFields(userData) {
    let hasErrors = false;
    
    // Username validation
    if (!userData.username) {
        setFieldError('username', 'Username is required');
        hasErrors = true;
    } else if (!validateUsername(userData.username)) {
        setFieldError('username', 'Username must be 3-80 characters and contain only letters, numbers, and underscores');
        hasErrors = true;
    }
    
    // Email validation
    if (!userData.email) {
        setFieldError('email', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(userData.email)) {
        setFieldError('email', 'Please enter a valid email address');
        hasErrors = true;
    }
    
    // Password validation
    if (!userData.password) {
        setFieldError('password', 'Password is required');
        hasErrors = true;
    } else if (!validatePassword(userData.password)) {
        setFieldError('password', 'Password must be at least 8 characters with letters and numbers');
        hasErrors = true;
    }
    
    // Confirm password validation
    if (!userData.confirm_password) {
        setFieldError('confirm-password', 'Please confirm your password');
        hasErrors = true;
    } else if (userData.password !== userData.confirm_password) {
        setFieldError('confirm-password', 'Passwords do not match');
        hasErrors = true;
    }
    
    // Terms validation
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
        setFieldError('terms', 'You must agree to the terms and conditions');
        hasErrors = true;
    }
    
    return !hasErrors;
}

function validateUsernameField() {
    const username = this.value.trim();
    clearFieldError('username');
    
    if (username && !validateUsername(username)) {
        setFieldError('username', 'Username must be 3-80 characters and contain only letters, numbers, and underscores');
        return false;
    }
    
    if (username.length >= 3) {
        this.classList.add('is-valid');
    }
    
    return true;
}

function validatePasswordField() {
    const password = this.value;
    clearFieldError('password');
    
    if (password && !validatePassword(password)) {
        setFieldError('password', 'Password must be at least 8 characters with letters and numbers');
        return false;
    }
    
    if (password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)) {
        this.classList.add('is-valid');
        
        // Also validate confirm password if it has a value
        const confirmPasswordField = document.getElementById('confirm-password');
        if (confirmPasswordField.value) {
            validateConfirmPasswordField.call(confirmPasswordField);
        }
    }
    
    return true;
}

function validateConfirmPasswordField() {
    const confirmPassword = this.value;
    const password = document.getElementById('password').value;
    clearFieldError('confirm-password');
    
    if (confirmPassword && confirmPassword !== password) {
        setFieldError('confirm-password', 'Passwords do not match');
        return false;
    }
    
    if (confirmPassword && confirmPassword === password && password.length >= 8) {
        this.classList.add('is-valid');
    }
    
    return true;
}

function highlightErrorField(error) {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('username')) {
        setFieldError('username', error);
    } else if (errorLower.includes('email')) {
        setFieldError('email', error);
    } else if (errorLower.includes('password')) {
        setFieldError('password', error);
    }
}

// Add real-time username availability check (mock)
async function checkUsernameAvailability(username) {
    // In a real app, this would make an API call
    // For now, just simulate some unavailable usernames
    const unavailableUsernames = ['admin', 'user', 'test', 'demo'];
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(!unavailableUsernames.includes(username.toLowerCase()));
        }, 500);
    });
}

// Add password strength indicator
function updatePasswordStrength(password) {
    const strengthIndicator = document.getElementById('password-strength');
    if (!strengthIndicator) return;
    
    let strength = 0;
    let strengthText = '';
    let strengthClass = '';
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    switch (strength) {
        case 0:
        case 1:
            strengthText = 'Very Weak';
            strengthClass = 'text-danger';
            break;
        case 2:
            strengthText = 'Weak';
            strengthClass = 'text-warning';
            break;
        case 3:
            strengthText = 'Fair';
            strengthClass = 'text-info';
            break;
        case 4:
            strengthText = 'Good';
            strengthClass = 'text-success';
            break;
        case 5:
            strengthText = 'Strong';
            strengthClass = 'text-success fw-bold';
            break;
    }
    
    strengthIndicator.textContent = strengthText;
    strengthIndicator.className = strengthClass;
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Submit form on Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.dispatchEvent(new Event('submit'));
        }
    }
});
