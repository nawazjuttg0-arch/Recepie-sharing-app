// Login Page JavaScript

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
    const loginForm = document.getElementById('login-form');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordField = document.getElementById('password');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle password toggle
    if (togglePasswordBtn && passwordField) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }
    
    // Handle forgot password
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }
    
    // Check if already logged in
    if (auth.isAuthenticated()) {
        window.location.href = '/';
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearAllErrors('login-form');
    
    const formData = new FormData(e.target);
    const email = formData.get('email').trim();
    const password = formData.get('password');
    
    // Validate inputs
    let hasErrors = false;
    
    if (!email) {
        setFieldError('email', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(email)) {
        setFieldError('email', 'Please enter a valid email address');
        hasErrors = true;
    }
    
    if (!password) {
        setFieldError('password', 'Password is required');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Get loading modal element
    const loadingModalElement = document.getElementById('loading-modal');
    const loadingModal = new bootstrap.Modal(loadingModalElement);
    
    // Add hidden event listener to reset form state
    const hideHandler = () => {
        loadingModalElement.removeEventListener('hidden.bs.modal', hideHandler);
    };
    loadingModalElement.addEventListener('hidden.bs.modal', hideHandler);
    
    // Show loading modal
    loadingModal.show();
    
    // Set a fail-safe timeout to hide the modal after 10 seconds
    const failSafeTimeout = setTimeout(() => {
        forceHideModal(loadingModalElement);
        showToast('Request timed out. Please try again.', 'error');
    }, 10000);
    
    try {
        const result = await auth.login(email, password);
        
        // Clear the fail-safe timeout
        clearTimeout(failSafeTimeout);
        
        if (result.success) {
            // Hide modal on success too
            forceHideModal(loadingModalElement);
            showToast('Login successful! Welcome back.', 'success');
            
            // Redirect after a short delay
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || '/';
                window.location.href = redirect;
            }, 1000);
        } else {
            // Force hide modal immediately on error
            console.log('Login failed, hiding modal...');
            forceHideModal(loadingModalElement);
            
            // Wait a bit for modal to hide, then show error
            setTimeout(() => {
                // Double-check if modal is still showing and force remove it
                if (loadingModalElement && loadingModalElement.classList.contains('show')) {
                    console.log('Modal still showing, removing from DOM');
                    loadingModalElement.remove();
                }
                showToast(result.error || 'Login failed', 'error');
            }, 300);
            
            // Highlight relevant fields based on error
            if (result.error && result.error.toLowerCase().includes('email')) {
                setFieldError('email', result.error);
            } else if (result.error && result.error.toLowerCase().includes('password')) {
                setFieldError('password', result.error);
            }
        }
    } catch (error) {
        // Clear the fail-safe timeout
        clearTimeout(failSafeTimeout);
        
        // Force hide modal immediately on error
        forceHideModal(loadingModalElement);
        
        // Wait a bit for modal to hide, then show error
        setTimeout(() => {
            // Double-check if modal is still showing and force remove it
            if (loadingModalElement && loadingModalElement.classList.contains('show')) {
                console.log('Modal still showing in catch block, removing from DOM');
                loadingModalElement.remove();
            }
            console.error('Login error:', error);
            showToast('Login failed. Please try again.', 'error');
        }, 300);
    }
}

function handleForgotPassword(e) {
    e.preventDefault();
    
    // Show password reset modal or handle forgot password logic
    showPasswordResetModal();
}

function showPasswordResetModal() {
    // Create and show password reset modal
    const modalHtml = `
        <div class="modal fade" id="password-reset-modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-key me-2"></i>Reset Password
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="password-reset-form">
                            <div class="mb-3">
                                <label for="reset-email" class="form-label">Email Address</label>
                                <input type="email" class="form-control" id="reset-email" required>
                                <div class="form-text">
                                    Enter your email address and we'll send you a link to reset your password.
                                </div>
                                <div class="invalid-feedback"></div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="send-reset-btn">
                            <i class="fas fa-paper-plane me-2"></i>Send Reset Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('password-reset-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('password-reset-modal'));
    modal.show();
    
    // Handle send reset button
    document.getElementById('send-reset-btn').addEventListener('click', async function() {
        const email = document.getElementById('reset-email').value.trim();
        
        if (!email) {
            setFieldError('reset-email', 'Email is required');
            return;
        }
        
        if (!validateEmail(email)) {
            setFieldError('reset-email', 'Please enter a valid email address');
            return;
        }
        
        // Simulate sending reset email (in real app, call API)
        this.disabled = true;
        this.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i>Sending...';
        
        setTimeout(() => {
            modal.hide();
            showToast('Password reset link sent to your email!', 'success');
        }, 2000);
    });
    
    // Clean up modal after it's hidden
    document.getElementById('password-reset-modal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Fill demo credentials when clicking on demo account info
document.addEventListener('click', function(e) {
    if (e.target.closest('.card-body')) {
        const cardBody = e.target.closest('.card-body');
        const demoText = cardBody.textContent;
        
        if (demoText.includes('admin@tastyshare.com')) {
            document.getElementById('email').value = 'admin@tastyshare.com';
            document.getElementById('password').value = 'admin123';
        } else if (demoText.includes('user@tastyshare.com')) {
            document.getElementById('email').value = 'user@tastyshare.com';
            document.getElementById('password').value = 'user123';
        }
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Submit form on Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});
