from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.recipe import Recipe
from models.review import Review
from extensions import db
from datetime import datetime, timedelta
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin privileges"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin privileges required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_dashboard():
    """Get admin dashboard statistics"""
    try:
        # Get current date ranges
        today = datetime.utcnow().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # User statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        new_users_this_week = User.query.filter(User.created_at >= week_ago).count()
        new_users_this_month = User.query.filter(User.created_at >= month_ago).count()
        
        # Recipe statistics
        total_recipes = Recipe.query.count()
        published_recipes = Recipe.query.filter_by(is_published=True).count()
        draft_recipes = Recipe.query.filter_by(is_published=False).count()
        new_recipes_this_week = Recipe.query.filter(Recipe.created_at >= week_ago).count()
        new_recipes_this_month = Recipe.query.filter(Recipe.created_at >= month_ago).count()
        
        # Review statistics
        total_reviews = Review.query.count()
        reported_reviews = Review.query.filter_by(is_reported=True).count()
        new_reviews_this_week = Review.query.filter(Review.created_at >= week_ago).count()
        
        # Popular recipes (top 5 by views)
        popular_recipes = Recipe.query.filter_by(is_published=True)\
            .order_by(Recipe.view_count.desc())\
            .limit(5).all()
        
        popular_recipes_data = [
            {
                'id': recipe.id,
                'title': recipe.title,
                'view_count': recipe.view_count,
                'author': recipe.author.username,
                'created_at': recipe.created_at.isoformat()
            }
            for recipe in popular_recipes
        ]
        
        # Recent users
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_users_data = [
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at.isoformat(),
                'is_active': user.is_active
            }
            for user in recent_users
        ]
        
        return jsonify({
            'users': {
                'total': total_users,
                'active': active_users,
                'new_this_week': new_users_this_week,
                'new_this_month': new_users_this_month
            },
            'recipes': {
                'total': total_recipes,
                'published': published_recipes,
                'drafts': draft_recipes,
                'new_this_week': new_recipes_this_week,
                'new_this_month': new_recipes_this_month
            },
            'reviews': {
                'total': total_reviews,
                'reported': reported_reviews,
                'new_this_week': new_reviews_this_week
            },
            'popular_recipes': popular_recipes_data,
            'recent_users': recent_users_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get admin dashboard', 'details': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users with pagination and filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '').strip()
        status = request.args.get('status', 'all')  # 'all', 'active', 'inactive'
        role = request.args.get('role', 'all')  # 'all', 'user', 'admin'
        
        # Build query
        query = User.query
        
        if search:
            query = query.filter(
                db.or_(
                    User.username.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%'),
                    User.first_name.ilike(f'%{search}%'),
                    User.last_name.ilike(f'%{search}%')
                )
            )
        
        if status == 'active':
            query = query.filter_by(is_active=True)
        elif status == 'inactive':
            query = query.filter_by(is_active=False)
        
        if role != 'all':
            query = query.filter_by(role=role)
        
        # Get paginated users
        users_pagination = query.order_by(User.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        users = [user.to_dict() for user in users_pagination.items]
        
        return jsonify({
            'users': users,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': users_pagination.total,
                'pages': users_pagination.pages,
                'has_next': users_pagination.has_next,
                'has_prev': users_pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get users', 'details': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    """Activate or deactivate a user"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent admin from deactivating themselves
        current_user_id = int(get_jwt_identity())
        if user_id == current_user_id:
            return jsonify({'error': 'Cannot deactivate your own account'}), 400
        
        user.is_active = not user.is_active
        db.session.commit()
        
        status = 'activated' if user.is_active else 'deactivated'
        
        return jsonify({
            'message': f'User {status} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update user status', 'details': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
@admin_required
def update_user_role(user_id):
    """Update user role"""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['user', 'admin']:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Prevent admin from demoting themselves
        current_user_id = int(get_jwt_identity())
        if user_id == current_user_id and new_role != 'admin':
            return jsonify({'error': 'Cannot change your own admin role'}), 400
        
        user.role = new_role
        db.session.commit()
        
        return jsonify({
            'message': f'User role updated to {new_role}',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update user role', 'details': str(e)}), 500

@admin_bp.route('/recipes', methods=['GET'])
@jwt_required()
@admin_required
def get_all_recipes():
    """Get all recipes for admin management"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        search = request.args.get('search', '').strip()
        status = request.args.get('status', 'all')  # 'all', 'published', 'draft'
        category = request.args.get('category', '').strip()
        
        # Build query
        query = Recipe.query
        
        if search:
            query = query.filter(
                db.or_(
                    Recipe.title.ilike(f'%{search}%'),
                    Recipe.description.ilike(f'%{search}%')
                )
            )
        
        if status == 'published':
            query = query.filter_by(is_published=True)
        elif status == 'draft':
            query = query.filter_by(is_published=False)
        
        if category:
            query = query.filter_by(category=category)
        
        # Get paginated recipes
        recipes_pagination = query.order_by(Recipe.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        recipes = []
        for recipe in recipes_pagination.items:
            recipe_data = recipe.to_dict()
            recipe_data['author_username'] = recipe.author.username
            recipes.append(recipe_data)
        
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

@admin_bp.route('/recipes/<int:recipe_id>/toggle-featured', methods=['POST'])
@jwt_required()
@admin_required
def toggle_recipe_featured(recipe_id):
    """Toggle recipe featured status"""
    try:
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        recipe.is_featured = not recipe.is_featured
        db.session.commit()
        
        status = 'featured' if recipe.is_featured else 'unfeatured'
        
        return jsonify({
            'message': f'Recipe {status} successfully',
            'recipe': recipe.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update recipe status', 'details': str(e)}), 500

@admin_bp.route('/reviews/reported', methods=['GET'])
@jwt_required()
@admin_required
def get_reported_reviews():
    """Get all reported reviews"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Get paginated reported reviews
        reviews_pagination = Review.query.filter_by(is_reported=True)\
            .order_by(Review.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        reviews = []
        for review in reviews_pagination.items:
            review_data = review.to_dict()
            review_data['recipe_title'] = review.recipe.title
            reviews.append(review_data)
        
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
        return jsonify({'error': 'Failed to get reported reviews', 'details': str(e)}), 500

@admin_bp.route('/reviews/<int:review_id>/resolve', methods=['POST'])
@jwt_required()
@admin_required
def resolve_reported_review(review_id):
    """Resolve a reported review"""
    try:
        review = Review.query.get(review_id)
        
        if not review:
            return jsonify({'error': 'Review not found'}), 404
        
        data = request.get_json()
        action = data.get('action')  # 'dismiss' or 'delete'
        
        if action == 'delete':
            db.session.delete(review)
            message = 'Review deleted successfully'
        elif action == 'dismiss':
            review.is_reported = False
            review.report_reason = None
            message = 'Report dismissed successfully'
        else:
            return jsonify({'error': 'Invalid action'}), 400
        
        db.session.commit()
        
        return jsonify({'message': message}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to resolve review', 'details': str(e)}), 500

@admin_bp.route('/recipes/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_recipe(recipe_id):
    """Delete a recipe (admin only)"""
    try:
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        # Delete the recipe (cascade will handle related records)
        db.session.delete(recipe)
        db.session.commit()
        
        return jsonify({'message': 'Recipe deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete recipe', 'details': str(e)}), 500

@admin_bp.route('/recipes/<int:recipe_id>/toggle-publish', methods=['POST'])
@jwt_required()
@admin_required
def toggle_recipe_publish(recipe_id):
    """Toggle recipe publish status"""
    try:
        recipe = Recipe.query.get(recipe_id)
        
        if not recipe:
            return jsonify({'error': 'Recipe not found'}), 404
        
        recipe.is_published = not recipe.is_published
        db.session.commit()
        
        status = 'published' if recipe.is_published else 'unpublished'
        
        return jsonify({
            'message': f'Recipe {status} successfully',
            'recipe': recipe.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update recipe status', 'details': str(e)}), 500