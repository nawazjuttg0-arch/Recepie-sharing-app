#!/usr/bin/env python3
"""
Seed script to populate the database with sample recipes and images
"""

import os
import json
from datetime import datetime
from app import app
from extensions import db
from models.user import User
from models.recipe import Recipe
from models.review import Review

def clear_database():
    """Clear all existing data"""
    print("Clearing existing data...")
    db.drop_all()
    db.create_all()
    print("Database cleared and recreated!")

def create_sample_users():
    """Create sample users"""
    users_data = [
        {
            'username': 'chef_mario',
            'email': 'mario@tastyshare.com',
            'password': 'password123',
            'first_name': 'Mario',
            'last_name': 'Rossi',
            'bio': 'Passionate Italian chef with 15 years of experience',
            'role': 'user'
        },
        {
            'username': 'spice_queen',
            'email': 'priya@tastyshare.com',
            'password': 'password123',
            'first_name': 'Priya',
            'last_name': 'Sharma',
            'bio': 'Indian cuisine expert specializing in authentic spices',
            'role': 'user'
        },
        {
            'username': 'admin',
            'email': 'admin@tastyshare.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'User',
            'bio': 'TastyShare Administrator',
            'role': 'admin'
        },
        {
            'username': 'user',
            'email': 'user@tastyshare.com',
            'password': 'user123',
            'first_name': 'Demo',
            'last_name': 'User',
            'bio': 'Demo user account for testing',
            'role': 'user'
        }
    ]
    
    users = []
    for user_data in users_data:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            bio=user_data['bio'],
            role=user_data['role'],
            is_verified=True
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        users.append(user)
    
    db.session.commit()
    print(f"Created {len(users)} sample users")
    return users

def create_sample_recipes(users):
    """Create 10 sample recipes with images"""
    
    # Sample recipe data
    recipes_data = [
        {
            'title': 'Classic Italian Spaghetti Carbonara',
            'description': 'Authentic Roman pasta dish with eggs, cheese, pancetta, and black pepper. Simple yet delicious!',
            'ingredients': [
                '400g spaghetti pasta',
                '200g pancetta or guanciale, diced',
                '4 large egg yolks',
                '100g Pecorino Romano cheese, grated',
                '50g Parmesan cheese, grated',
                'Black pepper to taste',
                'Salt for pasta water'
            ],
            'instructions': [
                'Bring a large pot of salted water to boil for pasta',
                'Cook pancetta in a large skillet over medium heat until crispy',
                'In a bowl, whisk together egg yolks, grated cheeses, and black pepper',
                'Cook spaghetti according to package instructions until al dente',
                'Reserve 1 cup pasta water, then drain pasta',
                'Add hot pasta to the skillet with pancetta',
                'Remove from heat and quickly toss with egg mixture',
                'Add pasta water gradually to create a creamy sauce',
                'Serve immediately with extra cheese and black pepper'
            ],
            'category': 'dinner',
            'cuisine_type': 'italian',
            'dietary_preference': 'non-vegetarian',
            'prep_time': 15,
            'cook_time': 20,
            'servings': 4,
            'difficulty_level': 'medium',
            'calories_per_serving': 520,
            'tags': '["pasta", "italian", "carbonara", "quick"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        },
        {
            'title': 'Spicy Indian Butter Chicken',
            'description': 'Creamy tomato-based curry with tender chicken pieces, perfect with rice or naan bread.',
            'ingredients': [
                '1 kg chicken breast, cut into chunks',
                '1 cup plain yogurt',
                '2 tbsp garam masala',
                '1 tbsp ginger-garlic paste',
                '400g canned tomatoes',
                '200ml heavy cream',
                '2 tbsp butter',
                '1 onion, finely chopped',
                '2 tsp cumin powder',
                '1 tsp turmeric',
                'Salt to taste',
                'Fresh cilantro for garnish'
            ],
            'instructions': [
                'Marinate chicken with yogurt, half the garam masala, and ginger-garlic paste for 30 minutes',
                'Heat butter in a large pan and cook marinated chicken until browned',
                'Remove chicken and set aside',
                'In the same pan, sauté onions until golden',
                'Add remaining spices and cook for 1 minute',
                'Add canned tomatoes and simmer for 10 minutes',
                'Blend the tomato mixture until smooth',
                'Return to pan, add cream and cooked chicken',
                'Simmer for 15 minutes until chicken is tender',
                'Garnish with cilantro and serve hot'
            ],
            'category': 'dinner',
            'cuisine_type': 'indian',
            'dietary_preference': 'non-vegetarian',
            'prep_time': 45,
            'cook_time': 30,
            'servings': 6,
            'difficulty_level': 'medium',
            'calories_per_serving': 380,
            'tags': '["indian", "curry", "spicy", "chicken"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        },
        {
            'title': 'Fresh Mediterranean Greek Salad',
            'description': 'Light and refreshing salad with fresh vegetables, feta cheese, and olive oil dressing.',
            'ingredients': [
                '3 large tomatoes, cut into wedges',
                '1 cucumber, sliced',
                '1 red onion, thinly sliced',
                '200g feta cheese, cubed',
                '1 cup Kalamata olives',
                '1/4 cup extra virgin olive oil',
                '2 tbsp red wine vinegar',
                '1 tsp dried oregano',
                'Salt and pepper to taste',
                'Fresh herbs (mint, parsley)'
            ],
            'instructions': [
                'Cut tomatoes into wedges and place in a large bowl',
                'Add sliced cucumber and red onion',
                'Add feta cheese cubes and Kalamata olives',
                'In a small bowl, whisk together olive oil, vinegar, and oregano',
                'Season dressing with salt and pepper',
                'Pour dressing over salad and gently toss',
                'Let salad sit for 10 minutes to allow flavors to meld',
                'Garnish with fresh herbs before serving',
                'Serve immediately as a side or light meal'
            ],
            'category': 'lunch',
            'cuisine_type': 'greek',
            'dietary_preference': 'vegetarian',
            'prep_time': 20,
            'cook_time': 0,
            'servings': 4,
            'difficulty_level': 'easy',
            'calories_per_serving': 220,
            'tags': '["greek", "salad", "healthy", "vegetarian"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        },
        {
            'title': 'Classic American Cheeseburger',
            'description': 'Juicy beef patty with cheese, lettuce, tomato, and special sauce on a toasted bun.',
            'ingredients': [
                '500g ground beef (80/20)',
                '4 hamburger buns',
                '4 slices cheddar cheese',
                '1 large tomato, sliced',
                '4 lettuce leaves',
                '1 red onion, sliced',
                '4 pickle slices',
                '2 tbsp mayonnaise',
                '1 tbsp ketchup',
                '1 tbsp mustard',
                'Salt and pepper',
                'Oil for cooking'
            ],
            'instructions': [
                'Divide ground beef into 4 portions and shape into patties',
                'Season both sides with salt and pepper',
                'Mix mayonnaise, ketchup, and mustard for special sauce',
                'Heat oil in a skillet or grill pan over medium-high heat',
                'Cook patties for 3-4 minutes per side',
                'Add cheese to patties in last minute of cooking',
                'Toast hamburger buns lightly',
                'Spread special sauce on both bun halves',
                'Assemble: bottom bun, lettuce, patty with cheese, tomato, onion, pickles, top bun',
                'Serve immediately with fries'
            ],
            'category': 'lunch',
            'cuisine_type': 'american',
            'dietary_preference': 'non-vegetarian',
            'prep_time': 15,
            'cook_time': 10,
            'servings': 4,
            'difficulty_level': 'easy',
            'calories_per_serving': 650,
            'tags': '["american", "burger", "beef", "quick"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        },
        {
            'title': 'Chocolate Chip Cookies',
            'description': 'Soft and chewy homemade chocolate chip cookies, perfect for any occasion.',
            'ingredients': [
                '2 1/4 cups all-purpose flour',
                '1 tsp baking soda',
                '1 tsp salt',
                '1 cup butter, softened',
                '3/4 cup granulated sugar',
                '3/4 cup brown sugar, packed',
                '2 large eggs',
                '2 tsp vanilla extract',
                '2 cups chocolate chips'
            ],
            'instructions': [
                'Preheat oven to 375°F (190°C)',
                'Mix flour, baking soda, and salt in a bowl',
                'In another bowl, cream butter and both sugars until fluffy',
                'Beat in eggs one at a time, then vanilla',
                'Gradually mix in flour mixture',
                'Stir in chocolate chips',
                'Drop rounded tablespoons onto ungreased baking sheets',
                'Bake for 9-11 minutes until golden brown',
                'Cool on baking sheet for 2 minutes',
                'Transfer to wire rack to cool completely'
            ],
            'category': 'dessert',
            'cuisine_type': 'american',
            'dietary_preference': 'vegetarian',
            'prep_time': 20,
            'cook_time': 11,
            'servings': 24,
            'difficulty_level': 'easy',
            'calories_per_serving': 180,
            'tags': '["dessert", "cookies", "chocolate", "baking"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        },
        {
            'title': 'Healthy Avocado Toast',
            'description': 'Nutritious breakfast with smashed avocado, tomatoes, and a poached egg on whole grain toast.',
            'ingredients': [
                '4 slices whole grain bread',
                '2 ripe avocados',
                '4 eggs',
                '1 large tomato, sliced',
                '2 tbsp lemon juice',
                '1 tbsp olive oil',
                'Salt and pepper to taste',
                'Red pepper flakes',
                'Fresh herbs (chives, parsley)',
                '1 tbsp white vinegar (for poaching)'
            ],
            'instructions': [
                'Toast bread slices until golden brown',
                'Mash avocados with lemon juice, salt, and pepper',
                'Bring water to boil in a saucepan, add vinegar',
                'Create a whirlpool and carefully drop in eggs to poach',
                'Cook eggs for 3-4 minutes for runny yolks',
                'Spread mashed avocado on toast',
                'Top with tomato slices',
                'Carefully place poached egg on top',
                'Drizzle with olive oil and sprinkle with red pepper flakes',
                'Garnish with fresh herbs and serve immediately'
            ],
            'category': 'breakfast',
            'cuisine_type': 'modern',
            'dietary_preference': 'vegetarian',
            'prep_time': 10,
            'cook_time': 10,
            'servings': 4,
            'difficulty_level': 'easy',
            'calories_per_serving': 280,
            'tags': '["breakfast", "healthy", "avocado", "eggs"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        },
        {
            'title': 'Thai Green Curry',
            'description': 'Aromatic and spicy Thai curry with coconut milk, vegetables, and fresh herbs.',
            'ingredients': [
                '400ml coconut milk',
                '3 tbsp green curry paste',
                '500g chicken breast, sliced',
                '1 eggplant, cubed',
                '1 bell pepper, sliced',
                '100g green beans, trimmed',
                '2 tbsp fish sauce',
                '1 tbsp palm sugar',
                'Thai basil leaves',
                '2 kaffir lime leaves',
                '1 red chili, sliced',
                'Jasmine rice for serving'
            ],
            'instructions': [
                'Heat thick coconut milk in a wok over medium heat',
                'Fry green curry paste for 2 minutes until fragrant',
                'Add chicken and cook until no longer pink',
                'Add remaining coconut milk and bring to simmer',
                'Add eggplant and cook for 5 minutes',
                'Add bell pepper and green beans',
                'Season with fish sauce and palm sugar',
                'Add kaffir lime leaves and simmer until vegetables are tender',
                'Stir in Thai basil leaves',
                'Serve hot over jasmine rice, garnished with chili slices'
            ],
            'category': 'dinner',
            'cuisine_type': 'thai',
            'dietary_preference': 'non-vegetarian',
            'prep_time': 20,
            'cook_time': 25,
            'servings': 4,
            'difficulty_level': 'medium',
            'calories_per_serving': 420,
            'tags': '["thai", "curry", "spicy", "coconut"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        },
        {
            'title': 'French Croissant',
            'description': 'Buttery, flaky pastry perfect for breakfast or brunch. Requires time and patience but worth it!',
            'ingredients': [
                '500g bread flour',
                '10g salt',
                '80g sugar',
                '10g instant yeast',
                '300ml warm milk',
                '250g cold butter, for laminating',
                '50g butter, melted',
                '1 egg for egg wash'
            ],
            'instructions': [
                'Mix flour, salt, sugar, and yeast in a bowl',
                'Add warm milk and melted butter, knead into smooth dough',
                'Let dough rise for 1 hour until doubled',
                'Roll dough into rectangle, place cold butter in center',
                'Fold dough over butter and roll out',
                'Perform 3 letter folds with 30-minute chilling between each',
                'Roll final dough and cut into triangles',
                'Roll triangles into croissant shapes',
                'Let rise for 2 hours until puffy',
                'Brush with egg wash and bake at 375°F for 15-20 minutes'
            ],
            'category': 'breakfast',
            'cuisine_type': 'french',
            'dietary_preference': 'vegetarian',
            'prep_time': 300,
            'cook_time': 20,
            'servings': 12,
            'difficulty_level': 'hard',
            'calories_per_serving': 280,
            'tags': '["french", "pastry", "breakfast", "baking"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        },
        {
            'title': 'Japanese Sushi Bowl',
            'description': 'Deconstructed sushi in a bowl with fresh fish, rice, and traditional toppings.',
            'ingredients': [
                '2 cups sushi rice',
                '3 tbsp rice vinegar',
                '1 tbsp sugar',
                '1 tsp salt',
                '200g fresh salmon, cubed',
                '200g fresh tuna, cubed',
                '1 cucumber, julienned',
                '1 avocado, sliced',
                '2 sheets nori, cut into strips',
                'Pickled ginger',
                'Wasabi',
                'Soy sauce',
                'Sesame seeds'
            ],
            'instructions': [
                'Cook sushi rice according to package instructions',
                'Mix rice vinegar, sugar, and salt for seasoning',
                'Season warm rice with vinegar mixture and let cool',
                'Prepare all toppings: cube fish, slice avocado, julienne cucumber',
                'Divide seasoned rice among 4 bowls',
                'Arrange salmon, tuna, cucumber, and avocado on rice',
                'Top with nori strips and sesame seeds',
                'Serve with pickled ginger, wasabi, and soy sauce',
                'Mix everything together before eating'
            ],
            'category': 'lunch',
            'cuisine_type': 'japanese',
            'dietary_preference': 'non-vegetarian',
            'prep_time': 30,
            'cook_time': 20,
            'servings': 4,
            'difficulty_level': 'medium',
            'calories_per_serving': 480,
            'tags': '["japanese", "sushi", "fish", "rice"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        },
        {
            'title': 'Mexican Street Tacos',
            'description': 'Authentic Mexican tacos with seasoned meat, fresh toppings, and corn tortillas.',
            'ingredients': [
                '500g beef or pork, diced',
                '12 corn tortillas',
                '1 onion, finely diced',
                '3 cloves garlic, minced',
                '2 tsp chili powder',
                '1 tsp cumin',
                '1 tsp oregano',
                'Lime wedges',
                'Fresh cilantro',
                'White onion, diced',
                'Salsa verde',
                'Hot sauce',
                'Oil for cooking'
            ],
            'instructions': [
                'Season meat with chili powder, cumin, oregano, salt, and pepper',
                'Heat oil in a skillet over high heat',
                'Cook meat until browned and slightly crispy',
                'Add onion and garlic, cook until soft',
                'Warm tortillas on a dry skillet or comal',
                'Fill each tortilla with meat mixture',
                'Top with diced onion and fresh cilantro',
                'Serve with lime wedges and salsa',
                'Squeeze lime over tacos before eating'
            ],
            'category': 'dinner',
            'cuisine_type': 'mexican',
            'dietary_preference': 'non-vegetarian',
            'prep_time': 15,
            'cook_time': 15,
            'servings': 6,
            'difficulty_level': 'easy',
            'calories_per_serving': 320,
            'tags': '["mexican", "tacos", "street food", "quick"]',
            'image_url': 'uploads/recipes/default_recipe.jpg'
        }
    ]
    
    print("Creating sample recipes...")
    
    for i, recipe_data in enumerate(recipes_data):
        # Assign recipes to users (round robin)
        user = users[i % len(users)]
        
        recipe = Recipe(
            title=recipe_data['title'],
            description=recipe_data['description'],
            ingredients=json.dumps(recipe_data['ingredients']),
            instructions=json.dumps(recipe_data['instructions']),
            category=recipe_data['category'],
            cuisine_type=recipe_data['cuisine_type'],
            dietary_preference=recipe_data['dietary_preference'],
            prep_time=recipe_data['prep_time'],
            cook_time=recipe_data['cook_time'],
            total_time=recipe_data['prep_time'] + recipe_data['cook_time'],
            servings=recipe_data['servings'],
            difficulty_level=recipe_data['difficulty_level'],
            calories_per_serving=recipe_data['calories_per_serving'],
            image_url=recipe_data['image_url'],
            tags=recipe_data['tags'],
            is_featured=i < 3,  # Make first 3 recipes featured
            user_id=user.id,
            view_count=(i + 1) * 15  # Give some initial view counts
        )
        
        db.session.add(recipe)
    
    db.session.commit()
    print(f"Created {len(recipes_data)} sample recipes")

def create_sample_reviews():
    """Create some sample reviews for recipes"""
    recipes = Recipe.query.all()
    users = User.query.filter(User.role == 'user').all()
    
    reviews_data = [
        "Absolutely delicious! Will make this again.",
        "Great recipe, easy to follow instructions.",
        "Turned out perfect, my family loved it.",
        "Good recipe but needed more seasoning for my taste.",
        "Amazing! This is now my go-to recipe.",
        "Simple and tasty, perfect for beginners.",
        "Excellent results, highly recommend!",
        "Very flavorful and authentic taste.",
    ]
    
    import random
    
    for recipe in recipes[:8]:  # Add reviews to first 8 recipes
        for _ in range(random.randint(2, 5)):  # 2-5 reviews per recipe
            user = random.choice(users)
            review = Review(
                rating=random.randint(4, 5),  # Good ratings
                comment=random.choice(reviews_data),
                user_id=user.id,
                recipe_id=recipe.id
            )
            db.session.add(review)
    
    db.session.commit()
    print("Created sample reviews")

def main():
    """Main function to seed the database"""
    with app.app_context():
        print("Starting database seeding...")
        
        # Clear existing data
        clear_database()
        
        # Create sample data
        users = create_sample_users()
        create_sample_recipes(users)
        create_sample_reviews()
        
        print("\n✅ Database seeding completed successfully!")
        print(f"Created {User.query.count()} users")
        print(f"Created {Recipe.query.count()} recipes")
        print(f"Created {Review.query.count()} reviews")
        print("\nYou can now run the application with: python app.py")

if __name__ == '__main__':
    main()