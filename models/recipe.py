from datetime import datetime
from sqlalchemy import func
from extensions import db
import json

class Recipe(db.Model):
    __tablename__ = 'recipes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    ingredients = db.Column(db.Text, nullable=False)  # JSON string of ingredients list
    instructions = db.Column(db.Text, nullable=False)  # JSON string of step-by-step instructions
    category = db.Column(db.String(50), nullable=False)  # e.g., 'breakfast', 'dinner', 'dessert'
    cuisine_type = db.Column(db.String(50), nullable=True)  # e.g., 'italian', 'indian', 'mexican'
    dietary_preference = db.Column(db.String(50), nullable=True)  # 'vegan', 'vegetarian', 'non-vegetarian'
    prep_time = db.Column(db.Integer, nullable=True)  # in minutes
    cook_time = db.Column(db.Integer, nullable=True)  # in minutes
    total_time = db.Column(db.Integer, nullable=True)  # in minutes
    servings = db.Column(db.Integer, nullable=True, default=1)
    difficulty_level = db.Column(db.String(20), nullable=True)  # 'easy', 'medium', 'hard'
    calories_per_serving = db.Column(db.Integer, nullable=True)
    image_url = db.Column(db.String(200), nullable=True)
    video_url = db.Column(db.String(200), nullable=True)
    tags = db.Column(db.Text, nullable=True)  # JSON string of tags
    is_featured = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=True)
    view_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    reviews = db.relationship('Review', backref='recipe', lazy=True, cascade='all, delete-orphan')
    favorites = db.relationship('Favorite', backref='recipe', lazy=True, cascade='all, delete-orphan')
    
    def get_average_rating(self):
        """Calculate average rating for this recipe"""
        if not self.reviews:
            return 0
        return db.session.query(func.avg(Review.rating)).filter(Review.recipe_id == self.id).scalar() or 0
    
    def get_rating_count(self):
        """Get total number of ratings"""
        return len(self.reviews)
    
    def get_total_time(self):
        """Calculate total time (prep + cook)"""
        prep = self.prep_time or 0
        cook = self.cook_time or 0
        return prep + cook
    
    def is_favorited_by(self, user_id):
        """Check if recipe is favorited by specific user"""
        if not user_id:
            return False
        from models.favorite import Favorite
        return Favorite.query.filter_by(user_id=user_id, recipe_id=self.id).first() is not None
    
    def increment_view_count(self):
        """Increment view count"""
        self.view_count = (self.view_count or 0) + 1
        db.session.commit()
    
    def to_dict(self, user_id=None):
        """Convert recipe object to dictionary"""
        # Parse JSON strings for ingredients and instructions
        try:
            ingredients = json.loads(self.ingredients) if self.ingredients else []
        except (json.JSONDecodeError, TypeError):
            ingredients = []
        
        try:
            instructions = json.loads(self.instructions) if self.instructions else []
        except (json.JSONDecodeError, TypeError):
            instructions = []
        
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'ingredients': ingredients,
            'instructions': instructions,
            'category': self.category,
            'cuisine_type': self.cuisine_type,
            'dietary_preference': self.dietary_preference,
            'prep_time': self.prep_time,
            'cook_time': self.cook_time,
            'total_time': self.get_total_time(),
            'servings': self.servings,
            'difficulty_level': self.difficulty_level,
            'calories_per_serving': self.calories_per_serving,
            'image_url': self.image_url,
            'video_url': self.video_url,
            'tags': self.tags,
            'is_featured': self.is_featured,
            'is_published': self.is_published,
            'view_count': self.view_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_id': self.user_id,
            'author': {
                'id': self.author.id,
                'username': self.author.username,
                'profile_image': self.author.profile_image
            },
            'average_rating': round(self.get_average_rating(), 1),
            'rating_count': self.get_rating_count(),
            'is_favorited': self.is_favorited_by(user_id) if user_id else False
        }
    
    def __repr__(self):
        return f'<Recipe {self.title}>'
