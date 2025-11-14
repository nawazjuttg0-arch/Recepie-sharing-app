// TastyShare Authentication Module

class AuthManager {
    constructor() {
        this.token = localStorage.getItem('tastyshare_token');
        this.user = JSON.parse(localStorage.getItem('tastyshare_user')) || null;
        this.baseURL = '/api';
        this.init();
    }

    init() {
        this.updateNavigation();
        this.verifyToken();
    }

    async verifyToken() {
        if (!this.token) return false;

        try {
            const response = await fetch(`${this.baseURL}/auth/verify-token`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                localStorage.setItem('tastyshare_user', JSON.stringify(this.user));
                this.updateNavigation();
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            this.logout();
            return false;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.access_token;
                this.user = data.user;
                localStorage.setItem('tastyshare_token', this.token);
                localStorage.setItem('tastyshare_user', JSON.stringify(this.user));
                this.updateNavigation();
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }

    async register(formData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.access_token;
                this.user = data.user;
                localStorage.setItem('tastyshare_token', this.token);
                localStorage.setItem('tastyshare_user', JSON.stringify(this.user));
                this.updateNavigation();
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed. Please try again.' };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('tastyshare_token');
        localStorage.removeItem('tastyshare_user');
        this.updateNavigation();
    }

    updateNavigation() {
        const navAuth = document.getElementById('nav-auth');
        const addRecipeLink = document.getElementById('add-recipe-link');
        const adminLink = document.getElementById('admin-link');
        
        if (!navAuth) return;

        if (this.isAuthenticated()) {
            // Show authenticated user menu
            navAuth.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                        <img src="${this.getUserAvatar()}" alt="Avatar" class="rounded-circle me-1" width="24" height="24">
                        ${this.user.username}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="/profile">
                            <i class="fas fa-user me-2"></i>Profile
                        </a></li>
                        <li><a class="dropdown-item" href="/add-recipe">
                            <i class="fas fa-plus me-2"></i>Add Recipe
                        </a></li>
                        <li><a class="dropdown-item" href="/profile#favorites">
                            <i class="fas fa-heart me-2"></i>Favorites
                        </a></li>
                        <li><a class="dropdown-item" href="/profile#my-recipes">
                            <i class="fas fa-book me-2"></i>My Recipes
                        </a></li>
                        ${this.user.role === 'admin' ? '<li><hr class="dropdown-divider"></li><li><a class="dropdown-item" href="/admin"><i class="fas fa-cog me-2"></i>Admin Panel</a></li>' : ''}
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" id="logout-btn">
                            <i class="fas fa-sign-out-alt me-2"></i>Logout
                        </a></li>
                    </ul>
                </li>
            `;

            // Show add recipe link
            if (addRecipeLink) {
                addRecipeLink.style.display = 'block';
            }

            // Show admin link for admin users
            if (adminLink && this.isAdmin()) {
                adminLink.style.display = 'block';
            } else if (adminLink) {
                adminLink.style.display = 'none';
            }

            // Add logout event listener
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                    window.location.href = '/';
                });
            }
        } else {
            // Show login/register links
            navAuth.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/login" id="login-link">
                        <i class="fas fa-sign-in-alt me-1"></i>Login
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/register" id="register-link">
                        <i class="fas fa-user-plus me-1"></i>Register
                    </a>
                </li>
            `;

            // Hide add recipe link
            if (addRecipeLink) {
                addRecipeLink.style.display = 'none';
            }

            // Hide admin link
            if (adminLink) {
                adminLink.style.display = 'none';
            }
        }
    }

    getUserAvatar() {
        if (this.user && this.user.profile_image && this.user.profile_image !== 'default_avatar.png') {
            return `/static/uploads/avatars/${this.user.profile_image}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user?.username || 'User')}&background=007bff&color=fff&size=24`;
    }

    isAuthenticated() {
        return this.token && this.user;
    }

    isAdmin() {
        return this.isAuthenticated() && this.user.role === 'admin';
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.isAdmin()) {
            showToast('Access denied. Admin privileges required.', 'error');
            window.location.href = '/';
            return false;
        }
        return true;
    }
}

// Global auth manager instance
const auth = new AuthManager();

// Make auth available globally
window.auth = auth;

// Initialize authentication system when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation based on current auth state
    auth.updateNavigation();
});
