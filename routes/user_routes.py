from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.recipe import Recipe
from models.favorite import Favorite
from extensions import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/favorites', methods=['GET'])
@jwt_required()
def get_user_favorites():
    """Get user's favorite recipes"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 12, type=int), 50)
        
        # Get paginated favorites
        favorites_pagination = Favorite.query.filter_by(user_id=user_id)\
            .join(Recipe)\
            .filter(Recipe.is_published == True)\
            .order_by(Favorite.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        favorites = []
        for favorite in favorites_pagination.items:
            recipe_data = favorite.recipe.to_dict(user_id)
            favorites.append({
                'id': favorite.id,
                'created_at': favorite.created_at.isoformat(),
                'recipe': recipe_data
            })
        
        return jsonify({
            'favorites': favorites,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': favorites_pagination.total,
                'pages': favorites_pagination.pages,
                'has_next': favorites_pagination.has_next,
                'has_prev': favorites_pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get favorites', 'details': str(e)}), 500

@user_bp.route('/recipes', methods=['GET'])
@jwt_required()
def get_user_recipes():
    """Get user's own recipes"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 12, type=int), 50)
        status = request.args.get('status', 'all')  # 'all', 'published', 'draft'
        
        # Build query
        query = Recipe.query.filter_by(user_id=user_id)
        
        if status == 'published':
            query = query.filter_by(is_published=True)
        elif status == 'draft':
            query = query.filter_by(is_published=False)
        
        # Get paginated recipes
        recipes_pagination = query.order_by(Recipe.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        recipes = [recipe.to_dict(user_id) for recipe in recipes_pagination.items]
        
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
        return jsonify({'error': 'Failed to get user recipes', 'details': str(e)}), 500

@user_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_user_dashboard():
    """Get user dashboard data"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get counts
        total_recipes = Recipe.query.filter_by(user_id=user_id).count()
        published_recipes = Recipe.query.filter_by(user_id=user_id, is_published=True).count()
        draft_recipes = Recipe.query.filter_by(user_id=user_id, is_published=False).count()
        total_favorites = Favorite.query.filter_by(user_id=user_id).count()
        
        # Get total views for user's recipes
        total_views = db.session.query(db.func.sum(Recipe.view_count))\
            .filter_by(user_id=user_id).scalar() or 0
        
        # Get recent recipes
        recent_recipes = Recipe.query.filter_by(user_id=user_id)\
            .order_by(Recipe.created_at.desc())\
            .limit(5).all()
        
        recent_recipes_data = [recipe.to_dict(user_id) for recipe in recent_recipes]
        
        return jsonify({
            'stats': {
                'total_recipes': total_recipes,
                'published_recipes': published_recipes,
                'draft_recipes': draft_recipes,
                'total_favorites': total_favorites,
                'total_views': total_views
            },
            'recent_recipes': recent_recipes_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get dashboard data', 'details': str(e)}), 500

@user_bp.route('/profile/<username>', methods=['GET'])
def get_public_profile(username):
    """Get public profile of a user"""
    try:
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's published recipes
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 12, type=int), 50)
        
        recipes_pagination = Recipe.query.filter_by(user_id=user.id, is_published=True)\
            .order_by(Recipe.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)
        
        recipes = [recipe.to_dict() for recipe in recipes_pagination.items]
        
        # Get current user for favorites
        current_user_id = None
        try:
            from flask_jwt_extended import verify_jwt_in_request
            verify_jwt_in_request(optional=True)
            current_user_id = int(get_jwt_identity())
        except:
            pass
        
        # Public profile data
        profile_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'bio': user.bio,
            'profile_image': user.profile_image,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'recipe_count': len(user.recipes),
            'total_views': db.session.query(db.func.sum(Recipe.view_count))\
                .filter_by(user_id=user.id).scalar() or 0
        }
        
        return jsonify({
            'user': profile_data,
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
        return jsonify({'error': 'Failed to get user profile', 'details': str(e)}), 500
