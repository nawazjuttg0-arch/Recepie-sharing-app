from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models.recipe import Recipe
from models.review import Review
from models.favorite import Favorite
from models.user import User
from extensions import db
import os
import json
from datetime import datetime
from PIL import Image
import uuid

recipe_bp = Blueprint('recipe', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_IMAGE_SIZE = (1200, 1200)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_image(file, upload_folder):
    """Process and save uploaded image"""
    if file and allowed_file(file.filename):
        # Generate unique filename
        filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
        filepath = os.path.join(upload_folder, filename)
        
        # Open and resize image
        image = Image.open(file)
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            image = image.convert('RGB')
        
        # Resize image while maintaining aspect ratio
        image.thumbnail(MAX_IMAGE_SIZE, Image.Resampling.LANCZOS)
        
        # Save processed image
        image.save(filepath, 'JPEG', quality=85, optimize=True)
        
        return filename
    return None

@recipe_bp.route('/', methods=['GET'])
def get_recipes():
    """Get all recipes with optional filtering and pagination"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 12, type=int), 50)  # Max 50 per page
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        cuisine_type = request.args.get('cuisine_type', '').strip()
        dietary_preference = request.args.get('dietary_preference', '').strip()
        difficulty_level = request.args.get('difficulty_level', '').strip()
        sort_by = request.args.get('sort_by', 'created_at').strip()
        sort_order = request.args.get('sort_order', 'desc').strip()
        
        # Build query
        query = Recipe.query.filter_by(is_published=True)
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    Recipe.title.ilike(f'%{search}%'),
                    Recipe.description.ilike(f'%{search}%'),
                    Recipe.ingredients.ilike(f'%{search}%')
                )
            )
        
        if category:
            query = query.filter_by(category=category)
        
        if cuisine_type:
            query = query.filter_by(cuisine_type=cuisine_type)
        
        if dietary_preference:
            query = query.filter_by(dietary_preference=dietary_preference)
        
        if difficulty_level:
            query = query.filter_by(difficulty_level=difficulty_level)
        
        # Apply sorting
        if sort_by == 'rating':
            # Sort by average rating (this would need a subquery in real implementation)
            query = query.order_by(Recipe.created_at.desc())
        elif sort_by == 'view_count':
            if sort_order == 'asc':
                query = query.order_by(Recipe.view_count.asc())
            else:
                query = query.order_by(Recipe.view_count.desc())
        elif sort_by == 'title':
            if sort_order == 'asc':
                query = query.order_by(Recipe.title.asc())
            else:
                query = query.order_by(Recipe.title.desc())
        else:  # Default: created_at
            if sort_order == 'asc':
                query = query.order_by(Recipe.created_at.asc())
            else:
                query = query.order_by(Recipe.created_at.desc())
        
        # Get current user for favorites
        current_user_id = None
        try:
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request(optional=True)
            current_user_id = int(get_jwt_identity())
        except:
            pass
        
        # Paginate results
        recipes_pagination = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        recipes = [recipe.to_dict(current_user_id) for recipe in recipes_pagination.items]
        
        return jsonify({
            'recipes': recipes,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': recipes_pagination.total,
                'pages': recipes_pagination.pages,
                'has_next': recipes_pagination.has_next,
                'has_prev': recipes_pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get recipes', 'details': str(e)}), 500

@recipe_bp.route('/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    """Get a specific recipe by ID"""
    try:
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe or not recipe.is_published:
            return jsonify({'error': 'Recipe not found'}), 404
        
        # Increment view count
        recipe.increment_view_count()
        
        # Get current user for favorites
        current_user_id = None
        try:
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request(optional=True)
            current_user_id = int(get_jwt_identity())
        except:
            pass
        
        return jsonify({'recipe': recipe.to_dict(current_user_id)}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get recipe', 'details': str(e)}), 500

@recipe_bp.route('/', methods=['POST'])
@jwt_required()
def create_recipe():
    """Create a new recipe"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get form data
        data = request.form.to_dict()
        
        # Validate required fields
        required_fields = ['title', 'description', 'ingredients', 'instructions', 'category']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Handle image upload
        image_filename = None
        if 'recipe_image' in request.files:
            file = request.files['recipe_image']
            if file and file.filename:
                image_filename = process_image(file, current_app.config['UPLOAD_FOLDER'])
                if not image_filename:
                    return jsonify({'error': 'Invalid image format'}), 400
        
        # Parse JSON strings for ingredients and instructions
        try:
            ingredients = json.loads(data['ingredients']) if data.get('ingredients') else []
            instructions = json.loads(data['instructions']) if data.get('instructions') else []
        except (json.JSONDecodeError, TypeError):
            return jsonify({'error': 'Invalid ingredients or instructions format'}), 400
        
        # Create recipe
        recipe = Recipe(
            title=data['title'].strip(),
            description=data['description'].strip(),
            ingredients=json.dumps(ingredients),  # Store as JSON string
            instructions=json.dumps(instructions),  # Store as JSON string
            category=data['category'].strip(),
            cuisine_type=data.get('cuisine_type', '').strip(),
            dietary_preference=data.get('dietary_preference', '').strip(),
            prep_time=int(data['prep_time']) if data.get('prep_time') else None,
            cook_time=int(data['cook_time']) if data.get('cook_time') else None,
            servings=int(data['servings']) if data.get('servings') else 1,
            difficulty_level=data.get('difficulty_level', '').strip(),
            calories_per_serving=int(data['calories_per_serving']) if data.get('calories_per_serving') and data.get('calories_per_serving').strip() else None,
            image_url=f'/static/uploads/recipes/{image_filename}' if image_filename else None,
            video_url=data.get('video_url', '').strip(),
            tags=data.get('tags', '').strip(),
            user_id=user_id
        )
        
        # Calculate total time
        if recipe.prep_time and recipe.cook_time:
            recipe.total_time = recipe.prep_time + recipe.cook_time
        elif recipe.prep_time:
            recipe.total_time = recipe.prep_time
        elif recipe.cook_time:
            recipe.total_time = recipe.cook_time
        
        db.session.add(recipe)
        db.session.commit()
        
        return jsonify({
            'message': 'Recipe created successfully',
            'recipe': recipe.to_dict(user_id)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create recipe', 'details': str(e)}), 500

@recipe_bp.route('/<int:recipe_id>', methods=['PUT'])
@jwt_required()
def update_recipe(recipe_id):
    """Update a recipe"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        # Check ownership or admin privileges
        if recipe.user_id != user_id and user.role != 'admin':
            return jsonify({'error': 'Permission denied'}), 403
        
        # Get form data
        data = request.form.to_dict()
        
        # Update fields
        if 'title' in data:
            recipe.title = data['title'].strip()
        if 'description' in data:
            recipe.description = data['description'].strip()
        if 'ingredients' in data:
            # Parse ingredients JSON string
            try:
                ingredients = json.loads(data['ingredients']) if data['ingredients'] else []
                recipe.ingredients = json.dumps(ingredients)
            except (json.JSONDecodeError, TypeError):
                recipe.ingredients = data['ingredients'].strip()
        if 'instructions' in data:
            # Parse instructions JSON string
            try:
                instructions = json.loads(data['instructions']) if data['instructions'] else []
                recipe.instructions = json.dumps(instructions)
            except (json.JSONDecodeError, TypeError):
                recipe.instructions = data['instructions'].strip()
        if 'category' in data:
            recipe.category = data['category'].strip()
        if 'cuisine_type' in data:
            recipe.cuisine_type = data['cuisine_type'].strip()
        if 'dietary_preference' in data:
            recipe.dietary_preference = data['dietary_preference'].strip()
        if 'prep_time' in data:
            recipe.prep_time = int(data['prep_time']) if data['prep_time'] else None
        if 'cook_time' in data:
            recipe.cook_time = int(data['cook_time']) if data['cook_time'] else None
        if 'servings' in data:
            recipe.servings = int(data['servings']) if data['servings'] else 1
        if 'difficulty_level' in data:
            recipe.difficulty_level = data['difficulty_level'].strip()
        if 'calories_per_serving' in data:
            recipe.calories_per_serving = int(data['calories_per_serving']) if data['calories_per_serving'] else None
        if 'video_url' in data:
            recipe.video_url = data['video_url'].strip()
        if 'tags' in data:
            recipe.tags = data['tags'].strip()
        
        # Handle image upload
        if 'image' in request.files:
            file = request.files['image']
            if file.filename:
                image_filename = process_image(file, current_app.config['UPLOAD_FOLDER'])
                if image_filename:
                    # Delete old image if exists
                    if recipe.image_url:
                        old_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 
                                                    os.path.basename(recipe.image_url))
                        if os.path.exists(old_image_path):
                            os.remove(old_image_path)
                    
                    recipe.image_url = f'/static/uploads/recipes/{image_filename}'
        
        # Update total time
        if recipe.prep_time and recipe.cook_time:
            recipe.total_time = recipe.prep_time + recipe.cook_time
        elif recipe.prep_time:
            recipe.total_time = recipe.prep_time
        elif recipe.cook_time:
            recipe.total_time = recipe.cook_time
        
        recipe.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Recipe updated successfully',
            'recipe': recipe.to_dict(user_id)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update recipe', 'details': str(e)}), 500

@recipe_bp.route('/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_recipe(recipe_id):
    """Delete a recipe"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        # Check ownership or admin privileges
        if recipe.user_id != user_id and user.role != 'admin':
            return jsonify({'error': 'Permission denied'}), 403
        
        # Delete associated image file
        if recipe.image_url:
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 
                                    os.path.basename(recipe.image_url))
            if os.path.exists(image_path):
                os.remove(image_path)
        
        db.session.delete(recipe)
        db.session.commit()
        
        return jsonify({'message': 'Recipe deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete recipe', 'details': str(e)}), 500

@recipe_bp.route('/<int:recipe_id>/reviews', methods=['GET'])
def get_recipe_reviews(recipe_id):
    """Get reviews for a specific recipe"""
    try:
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        
        reviews_pagination = Review.query.filter_by(recipe_id=recipe_id)\
            .order_by(Review.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        reviews = [review.to_dict() for review in reviews_pagination.items]
        
        return jsonify({
            'reviews': reviews,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reviews_pagination.total,
                'pages': reviews_pagination.pages,
                'has_next': reviews_pagination.has_next,
                'has_prev': reviews_pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get reviews', 'details': str(e)}), 500

@recipe_bp.route('/<int:recipe_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(recipe_id):
    """Add a review to a recipe"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        # Check if user already reviewed this recipe
        existing_review = Review.query.filter_by(user_id=user_id, recipe_id=recipe_id).first()
        if existing_review:
            return jsonify({'error': 'You have already reviewed this recipe'}), 400
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('rating'):
            return jsonify({'error': 'Rating is required'}), 400
        
        rating = int(data['rating'])
        if rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        comment = data.get('comment', '').strip()
        if len(comment) > 500:
            return jsonify({'error': 'Comment must be less than 500 characters'}), 400
        
        # Create review
        review = Review(
            rating=rating,
            comment=comment,
            user_id=user_id,
            recipe_id=recipe_id
        )
        
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            'message': 'Review added successfully',
            'review': review.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add review', 'details': str(e)}), 500

@recipe_bp.route('/<int:recipe_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(recipe_id):
    """Add or remove recipe from favorites"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        # Check if already favorited
        favorite = Favorite.query.filter_by(user_id=user_id, recipe_id=recipe_id).first()
        
        if favorite:
            # Remove from favorites
            db.session.delete(favorite)
            db.session.commit()
            return jsonify({
                'message': 'Recipe removed from favorites',
                'is_favorited': False
            }), 200
        else:
            # Add to favorites
            favorite = Favorite(user_id=user_id, recipe_id=recipe_id)
            db.session.add(favorite)
            db.session.commit()
            return jsonify({
                'message': 'Recipe added to favorites',
                'is_favorited': True
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update favorites', 'details': str(e)}), 500
