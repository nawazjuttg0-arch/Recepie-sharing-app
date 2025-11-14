from datetime import datetime
from extensions import db

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 star rating
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_reported = db.Column(db.Boolean, default=False)
    report_reason = db.Column(db.String(200), nullable=True)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    
    # Unique constraint to prevent multiple reviews from same user on same recipe
    __table_args__ = (db.UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe_review'),)
    
    def to_dict(self):
        """Convert review object to dictionary"""
        return {
            'id': self.id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_reported': self.is_reported,
            'report_reason': self.report_reason,
            'user_id': self.user_id,
            'recipe_id': self.recipe_id,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'profile_image': self.user.profile_image
            }
        }
    
    def __repr__(self):
        return f'<Review {self.id}: {self.rating} stars>'
