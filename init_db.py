#!/usr/bin/env python3
"""
Database initialization script for TastyShare
This script creates the database tables and seeds initial data
"""

import os
import sys
from datetime import datetime
from werkzeug.security import generate_password_hash

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models.user import User
from models.recipe import Recipe
from models.review import Review
from models.favorite import Favorite

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    db.create_all()
    print("✅ Database tables created successfully!")

def seed_admin_user():
    """Create admin user if it doesn't exist"""
    admin_email = 'admin@tastyshare.com'
    admin_user = User.query.filter_by(email=admin_email).first()
    
    if not admin_user:
        print("Creating admin user...")
        admin_user = User(
            username='admin',
            email=admin_email,
            first_name='Admin',
            last_name='User',
            role='admin',
            is_active=True,
            is_verified=True
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        db.session.commit()
        print("✅ Admin user created successfully!")
        print(f"   Email: {admin_email}")
        print(f"   Password: admin123")
    else:
        print("✅ Admin user already exists!")

def seed_sample_data():
    """Create sample data for testing"""
    print("Creating sample data...")
    
    # Create sample users
    users_data = [
        {
            'username': 'chef_john',
            'email': 'john@example.com',
            'first_name': 'John',
            'last_name': 'Chef',
            'bio': 'Professional chef with 10+ years experience'
        },
        {
            'username': 'foodie_mary',
            'email': 'mary@example.com',
            'first_name': 'Mary',
            'last_name': 'Foodie',
            'bio': 'Home cook and food enthusiast'
        },
        {
            'username': 'user',
            'email': 'user@tastyshare.com',
            'first_name': 'Regular',
            'last_name': 'User',
            'bio': 'Regular user account for testing'
        }
    ]
    
    for user_data in users_data:
        user = User.query.filter_by(email=user_data['email']).first()
        if not user:
            user = User(**user_data)
            # Set specific password for user@tastyshare.com
            if user_data['email'] == 'user@tastyshare.com':
                user.set_password('user123')
            else:
                user.set_password('password123')
            db.session.add(user)
    
    db.session.commit()
    
    # Create sample recipes
    chef_john = User.query.filter_by(username='chef_john').first()
    if chef_john:
        sample_recipes = [
            {
                'title': 'Classic Spaghetti Carbonara',
                'description': 'A traditional Italian pasta dish with eggs, cheese, and pancetta',
                'ingredients': '["1 lb spaghetti", "4 large eggs", "1 cup grated Parmesan cheese", "8 oz pancetta", "4 cloves garlic", "Black pepper", "Salt"]',
                'instructions': '["Bring large pot of salted water to boil", "Cook spaghetti according to package directions", "Cut pancetta into small cubes", "Heat large skillet over medium heat", "Add pancetta and cook until crispy", "Beat eggs with Parmesan cheese", "Drain pasta, reserving 1 cup pasta water", "Add hot pasta to skillet with pancetta", "Remove from heat and quickly stir in egg mixture", "Add pasta water gradually until creamy", "Season with salt and pepper", "Serve immediately"]',
                'category': 'dinner',
                'cuisine_type': 'italian',
                'dietary_preference': 'none',
                'prep_time': 15,
                'cook_time': 20,
                'servings': 4,
                'difficulty_level': 'medium',
                'tags': 'pasta, italian, comfort food',
                'is_published': True
            },
            {
                'title': 'Chocolate Chip Cookies',
                'description': 'Soft and chewy chocolate chip cookies perfect for any occasion',
                'ingredients': '["2 1/4 cups all-purpose flour", "1 tsp baking soda", "1 tsp salt", "1 cup butter, softened", "3/4 cup granulated sugar", "3/4 cup brown sugar", "2 large eggs", "2 tsp vanilla extract", "2 cups chocolate chips"]',
                'instructions': '["Preheat oven to 375°F", "Mix flour, baking soda, and salt in bowl", "Beat butter and sugars until creamy", "Add eggs and vanilla, beat well", "Gradually beat in flour mixture", "Stir in chocolate chips", "Drop rounded tablespoons onto ungreased cookie sheets", "Bake 9-11 minutes until golden brown", "Cool on baking sheet 2 minutes", "Remove to wire rack to cool completely"]',
                'category': 'dessert',
                'cuisine_type': 'american',
                'dietary_preference': 'none',
                'prep_time': 20,
                'cook_time': 12,
                'servings': 24,
                'difficulty_level': 'easy',
                'tags': 'cookies, chocolate, dessert',
                'is_published': True
            }
        ]
        
        for recipe_data in sample_recipes:
            recipe = Recipe.query.filter_by(title=recipe_data['title']).first()
            if not recipe:
                recipe = Recipe(**recipe_data, user_id=chef_john.id)
                db.session.add(recipe)
    
    db.session.commit()
    print("✅ Sample data created successfully!")

def main():
    """Main initialization function"""
    print("🚀 Initializing TastyShare Database...")
    print("=" * 50)
    
    # Create Flask app
    app = create_app()
    
    with app.app_context():
        try:
            # Create tables
            create_tables()
            
            # Seed admin user
            seed_admin_user()
            
            # Seed sample data
            seed_sample_data()
            
            print("=" * 50)
            print("🎉 Database initialization completed successfully!")
            print("\n📋 Summary:")
            print(f"   - Database: {app.config['SQLALCHEMY_DATABASE_URI']}")
            print(f"   - Admin Email: admin@tastyshare.com")
            print(f"   - Admin Password: admin123")
            print(f"   - Sample recipes: 2")
            print(f"   - Sample users: 2")
            
        except Exception as e:
            print(f"❌ Error during initialization: {str(e)}")
            db.session.rollback()
            sys.exit(1)

if __name__ == '__main__':
    main()
