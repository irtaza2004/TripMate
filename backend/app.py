import os
from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from backend.models import db, User
from backend.routes import api

def create_app():
    app = Flask(__name__)
    
    # Configure database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///app.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.environ.get("SECRET_KEY", "dev_secret_key")
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, supports_credentials=True)
    
    login_manager = LoginManager()
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, user_id)
    
    # Register blueprints
    app.register_blueprint(api, url_prefix="/api")
    
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)
