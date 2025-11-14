from datetime import datetime
from extensions import db

class Favorite(db.Model):
    __tablename__ = 'favorites'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    
    # Unique constraint to prevent duplicate favorites
    __table_args__ = (db.UniqueConstraint('user_id', 'recipe_id', name='unique_user_recipe_favorite'),)
    
    def to_dict(self):
        """Convert favorite object to dictionary"""
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_id': self.user_id,
            'recipe_id': self.recipe_id,
            'recipe': self.recipe.to_dict() if self.recipe else None
        }
    
    def __repr__(self):
        return f'<Favorite {self.user_id}:{self.recipe_id}>'
