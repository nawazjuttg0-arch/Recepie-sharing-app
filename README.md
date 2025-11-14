# TastyShare - Recipe Sharing Platform

A comprehensive web-based recipe sharing platform built with Flask, allowing users to share, discover, and review culinary creations.

## 🌐 Live Demo & Repository

- **🚀 Live Application:** [https://web-production-4541.up.railway.app/](https://web-production-4541.up.railway.app/)
- **📁 GitHub Repository:** [https://github.com/hammadnadir/my-fyp-Recepie-Sharing-App-](https://github.com/hammadnadir/my-fyp-Recepie-Sharing-App-)

## 🎯 Project Overview

**Project Title:** TastyShare: Recipe Sharing Platform  
**Group ID:** S25PROJECTD15D9  
**Supervisor:** Rizwana Noor  
**Student ID:** BC210426502  

## 🚀 Features

### User Management
- User registration and authentication with JWT
- Role-based access control (User/Admin)
- Profile management and password changes
- Secure login with email verification

### Recipe Management
- Add, edit, and delete recipes
- Rich recipe details (ingredients, instructions, images, videos)
- Category and cuisine type classification
- Dietary preference filtering (Vegan, Vegetarian, etc.)
- Cooking time and difficulty level indicators

### Search and Discovery
- Advanced search by name, ingredients, category
- Filter by dietary preferences, cuisine type, difficulty
- Sort by popularity, rating, or date
- Featured recipes showcase

### Social Features
- Rate and review recipes (1-5 stars)
- Save recipes to favorites
- User profiles and recipe collections
- Community-driven content moderation

### Admin Panel
- Content moderation and user management
- Recipe and review management
- Analytics and reporting
- System configuration

## 🛠️ Technology Stack

- **Backend:** Python Flask
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **UI Framework:** Bootstrap 5
- **Icons:** Font Awesome
- **Image Processing:** Pillow (PIL)
- **Email Validation:** email-validator

## 📋 Requirements

### Functional Requirements
1. **User Management:** Registration, login, profile management
2. **Recipe Management:** CRUD operations for recipes
3. **Search & Filter:** Advanced search capabilities
4. **Reviews & Ratings:** Community feedback system
5. **Favorites:** Personal recipe collections
6. **Admin Controls:** Content and user moderation
7. **Security:** Input validation, XSS protection

### Non-Functional Requirements
- **Performance:** <2 second response time
- **Security:** JWT authentication, input validation
- **Usability:** Responsive design, intuitive interface
- **Scalability:** Support for growing user base
- **Reliability:** Data integrity and error handling

## 🏗️ Project Structure

```
tastyshare/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── models/               # Database models
│   ├── user.py
│   ├── recipe.py
│   ├── review.py
│   └── favorite.py
├── routes/               # API endpoints
│   ├── auth_routes.py
│   ├── recipe_routes.py
│   ├── user_routes.py
│   └── admin_routes.py
├── templates/            # HTML templates
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── ...
├── static/               # Static assets
│   ├── css/
│   ├── js/
│   └── images/
└── uploads/              # User uploaded files
```

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tastyshare
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Access the application:**
   Open your browser and navigate to `http://localhost:5000`

## 👤 Demo Accounts

### Admin Account
- **Email:** admin@tastyshare.com
- **Password:** admin123
- **Access:** Full admin panel, user management, content moderation

### Test User Account
- **Email:** user@tastyshare.com
- **Password:** user123
- **Access:** Standard user features, recipe creation, reviews

## 🎨 Key Features Implementation

### Authentication System
- JWT-based authentication
- Secure password hashing with bcrypt
- Role-based access control
- Session management

### Recipe Management
- Image upload and processing
- Rich text descriptions
- Ingredient and instruction management
- Category and tag system

### Search & Filter
- Full-text search capabilities
- Multi-criteria filtering
- Sorting options
- Pagination

### User Experience
- Responsive design for all devices
- Real-time form validation
- Interactive UI components
- Toast notifications

## 📊 Database Schema

### Users Table
- id, username, email, password_hash
- first_name, last_name, phone, bio
- profile_image, role, is_active
- created_at, last_login

### Recipes Table
- id, title, description, ingredients, instructions
- category, cuisine_type, dietary_preference
- prep_time, cook_time, servings, difficulty_level
- image_url, video_url, tags
- user_id, view_count, created_at, updated_at

### Reviews Table
- id, rating, comment, user_id, recipe_id
- created_at, updated_at, is_reported

### Favorites Table
- id, user_id, recipe_id, created_at

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- File upload validation
- JWT token security
- Password strength requirements

## 📱 Responsive Design

- Mobile-first approach
- Bootstrap 5 responsive grid
- Touch-friendly interfaces
- Adaptive layouts
- Cross-browser compatibility

## 🧪 Testing

The application includes comprehensive testing for:
- User authentication flows
- Recipe CRUD operations
- Search and filter functionality
- API endpoints
- Security measures

## 📈 Future Enhancements

- Email notifications
- Social media integration
- Recipe meal planning
- Nutrition information
- Advanced analytics
- Mobile app development

## 🤝 Contributing

This is an academic project for the Final Year Project course. 

## 📄 License

This project is developed for educational purposes as part of the Final Year Project at [University Name].

## 👨‍💻 Developer

**Student ID:** BC210426502  
**Supervisor:** Rizwana Noor  
**Group ID:** S25PROJECTD15D9  

---

**TastyShare** - Share your culinary creations with the world! 🍽️

