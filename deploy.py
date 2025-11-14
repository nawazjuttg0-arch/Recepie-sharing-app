#!/usr/bin/env python3
"""
Deployment script for TastyShare
Handles different deployment environments
"""

import os
import sys
import subprocess
import argparse

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed!")
        print(f"Error: {e.stderr}")
        return False

def setup_development():
    """Setup development environment"""
    print("🚀 Setting up development environment...")
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        return False
    
    # Initialize database
    if not run_command("python init_db.py", "Initializing database"):
        return False
    
    print("✅ Development environment ready!")
    print("\n📋 Next steps:")
    print("   1. Run: python app.py")
    print("   2. Open: http://localhost:5000")
    print("   3. Login: admin@tastyshare.com / admin123")
    
    return True

def setup_production():
    """Setup production environment"""
    print("🚀 Setting up production environment...")
    
    # Check for required environment variables
    required_vars = ['DATABASE_URL', 'SECRET_KEY', 'JWT_SECRET_KEY']
    missing_vars = [var for var in required_vars if not os.environ.get(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        return False
    
    # Initialize migrations
    if not run_command("python manage_db.py init", "Initializing migrations"):
        return False
    
    # Create initial migration
    if not run_command("python manage_db.py create -m 'Initial migration'", "Creating initial migration"):
        return False
    
    # Apply migrations
    if not run_command("python manage_db.py upgrade", "Applying migrations"):
        return False
    
    # Initialize database with admin user
    if not run_command("python init_db.py", "Initializing database"):
        return False
    
    print("✅ Production environment ready!")
    print("\n📋 Next steps:")
    print("   1. Run: gunicorn -w 4 -b 0.0.0.0:8000 app:app")
    print("   2. Or use your preferred WSGI server")
    
    return True

def setup_railway():
    """Setup Railway deployment"""
    print("🚀 Setting up Railway deployment...")
    
    # Check if Railway CLI is installed
    try:
        subprocess.run("railway --version", shell=True, check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("❌ Railway CLI not found. Please install it first:")
        print("   npm install -g @railway/cli")
        return False
    
    # Login to Railway
    if not run_command("railway login", "Logging into Railway"):
        return False
    
    # Create new project
    if not run_command("railway new", "Creating Railway project"):
        return False
    
    # Add PostgreSQL service
    if not run_command("railway add postgresql", "Adding PostgreSQL service"):
        return False
    
    # Deploy application
    if not run_command("railway up", "Deploying application"):
        return False
    
    # Initialize database
    if not run_command("railway run python init_db.py", "Initializing database"):
        return False
    
    print("✅ Railway deployment ready!")
    print("\n📋 Your application is now live on Railway!")
    
    return True

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='TastyShare Deployment Script')
    parser.add_argument('environment', choices=['dev', 'prod', 'railway'], 
                       help='Deployment environment')
    
    args = parser.parse_args()
    
    print("🍽️  TastyShare Deployment Script")
    print("=" * 40)
    
    success = False
    
    if args.environment == 'dev':
        success = setup_development()
    elif args.environment == 'prod':
        success = setup_production()
    elif args.environment == 'railway':
        success = setup_railway()
    
    if success:
        print("\n🎉 Deployment completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Deployment failed!")
        sys.exit(1)

if __name__ == '__main__':
    main()
