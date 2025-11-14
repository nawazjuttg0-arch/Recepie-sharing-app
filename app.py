from flask import Flask, render_template, request, redirect, send_file
from flask_cors import CORS
from werkzeug.security import generate_password_hash
import os

# Import extensions
from extensions import db, jwt, bcrypt, migrate
from config import get_config

def create_app():
    app = Flask(__name__)

    # Load configuration
    config_class = get_config()
    app.config.from_object(config_class)
    
    # Handle Railway DATABASE_URL specifically
    if os.environ.get('RAILWAY_ENVIRONMENT'):
        # Railway environment - use direct DATABASE_URL
        database_url = os.environ.get('DATABASE_URL')
        if database_url and not database_url.startswith('${{'):
            app.config['SQLALCHEMY_DATABASE_URI'] = database_url
            app.config['PREFERRED_URL_SCHEME'] = 'https'
        else:
            # Fallback to SQLite if DATABASE_URL is not properly set
            app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tastyshare.db'
            print("⚠️ Using SQLite fallback - DATABASE_URL not properly configured")

    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Add security headers for HTTPS in production
    @app.before_request
    def force_https():
        if app.config.get('PREFERRED_URL_SCHEME') == 'https' and not request.is_secure and request.headers.get('X-Forwarded-Proto') != 'https':
            return redirect(request.url.replace('http://', 'https://'), code=301)
    
    @app.after_request
    def after_request(response):
        # Add security headers
        for header, value in config_class.SECURITY_HEADERS.items():
            response.headers[header] = value
        return response

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Import models
    from models.user import User
    from models.recipe import Recipe
    from models.review import Review
    from models.favorite import Favorite

    # Import and register blueprints
    from routes.auth_routes import auth_bp
    from routes.recipe_routes import recipe_bp
    from routes.admin_routes import admin_bp
    from routes.user_routes import user_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(recipe_bp, url_prefix='/api/recipes')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(user_bp, url_prefix='/api/user')

    # Main routes
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/recipes')
    def recipes_page():
        return render_template('recipes.html')

    @app.route('/recipe/<int:recipe_id>')
    def recipe_detail(recipe_id):
        return render_template('recipe_detail.html', recipe_id=recipe_id)

    @app.route('/recipe/<int:recipe_id>/edit')
    def edit_recipe_page(recipe_id):
        return render_template('edit_recipe.html', recipe_id=recipe_id)

    @app.route('/add-recipe')
    def add_recipe_page():
        return render_template('add_recipe.html')

    @app.route('/login')
    def login_page():
        return render_template('login.html')

    @app.route('/register')
    def register_page():
        return render_template('register.html')

    @app.route('/profile')
    def profile_page():
        return render_template('profile.html')

    @app.route('/admin')
    def admin_page():
        return send_file('templates/admin.html')

    @app.route('/api/stats')
    def get_site_stats():
        """Get site statistics for homepage"""
        try:
            from models.user import User
            from models.recipe import Recipe
            from models.review import Review
            from sqlalchemy import func
            
            # Get real statistics from database
            total_users = User.query.count()
            total_recipes = Recipe.query.count()
            total_reviews = Review.query.count()
            total_views = db.session.query(func.sum(Recipe.view_count)).scalar() or 0
            
            return {
                'recipes': total_recipes,
                'users': total_users,
                'reviews': total_reviews,
                'views': total_views
            }, 200
            
        except Exception as e:
            return {'error': 'Failed to get site statistics', 'details': str(e)}, 500

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def internal_error(error):
        return render_template('500.html'), 500

    # Create database tables and default admin user
    with app.app_context():
        db.create_all()
        
        # Create default admin user if not exists
        admin = User.query.filter_by(email='admin@tastyshare.com').first()
        if not admin:
            admin_user = User(
                username='admin',
                email='admin@tastyshare.com',
                role='admin'
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
            db.session.commit()

    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    # Initialize database on first run
    with app.app_context():
        try:
            # Check if tables exist
            from models.user import User
            if not User.query.first():
                print("🚀 Initializing database...")
                from init_db import main as init_database
                init_database()
                print("✅ Database initialized successfully!")
        except Exception as e:
            print(f"⚠️ Database initialization failed: {e}")
            # Try to fix schema issues
            try:
                print("🔧 Attempting to fix database schema...")
                from sqlalchemy import text
                db.engine.execute(text("ALTER TABLE users ALTER COLUMN password_hash TYPE VARCHAR(255);"))
                print("✅ Schema fixed! Retrying initialization...")
                from init_db import main as init_database
                init_database()
                print("✅ Database initialized successfully!")
            except Exception as schema_error:
                print(f"❌ Schema fix failed: {schema_error}")
                print("Please manually reset the database schema")
                # Don't crash the app
                pass
    
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
