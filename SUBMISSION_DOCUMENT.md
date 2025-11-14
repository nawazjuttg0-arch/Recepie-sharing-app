# TastyShare: Recipe Sharing Platform - Prototype Submission

## 📋 Student Information
- **Student ID:** BC210426502
- **Project Title:** TastyShare: Recipe Sharing Platform
- **Group ID:** S25PROJECTD15D9
- **Supervisor:** Rizwana Noor
- **Email:** rizwana.noor@vu.edu.pk

## 🎯 Assignment Requirements Compliance

### ✅ **1. Login Page for Admin and User Roles**
- **Location:** `templates/login.html`
- **Features:** 
  - Secure JWT authentication
  - Role-based access control (Admin/User)
  - Password hashing with bcrypt
  - Demo accounts provided in README

### ✅ **2. Home Page with Footer**
- **Location:** `templates/index.html`
- **Features:**
  - Professional homepage design
  - Footer with About Us, Terms & Conditions, Contact Us
  - Featured recipes showcase
  - Site statistics display

### ✅ **3. Recipe Categories**
- **Implementation:** Category dropdown in recipe forms
- **Categories Available:**
  - Breakfast, Lunch, Dinner, Snacks, Desserts
  - Vegetarian, Vegan, Non-Vegetarian options
  - Multiple cuisine types (Italian, Indian, Mexican, etc.)

### ✅ **4. Add New Recipe Feature**
- **Location:** `templates/add_recipe.html`
- **Fields Included:**
  - ✅ Title
  - ✅ Ingredients (dynamic list)
  - ✅ Preparation steps (step-by-step)
  - ✅ Category selection
  - ✅ Cooking time (prep + cook time)
  - ✅ Image upload functionality

### ✅ **5. Browse and Search Recipes**
- **Location:** `templates/recipes.html`
- **Search Options:**
  - ✅ Recipe name
  - ✅ Ingredients
  - ✅ Category
  - ✅ Cooking time
  - Advanced filtering system

### ✅ **6. User Interactions**
- **Rating System:** 5-star rating on recipe detail pages
- **Favorites:** Heart icon to mark/unmark favorites
- **Edit Recipes:** Users can edit their own recipes
- **Profile Management:** User profile with recipe collections

### ✅ **7. Admin Dashboard**
- **Location:** `templates/admin.html`
- **Features:**
  - ✅ Review submitted recipes
  - ✅ Delete inappropriate content
  - ✅ User management
  - ✅ Content moderation tools
  - ✅ Analytics and reporting

## 🛠️ Technical Implementation

### **Frontend/Backend: Python Flask**
- Modern Flask application with MVC architecture
- Responsive design using Bootstrap 5
- Interactive JavaScript for dynamic features
- Professional UI/UX design

### **Database: SQLite**
- Well-structured database schema
- Four main tables: Users, Recipes, Reviews, Favorites
- Proper foreign key relationships
- Sample data included for testing

## 🌐 Live Demo
- **Live URL:** https://web-production-4541.up.railway.app/
- **GitHub:** https://github.com/hammadnadir/my-fyp-Recepie-Sharing-App-

## 👤 Demo Accounts
### Admin Account
- **Email:** admin@tastyshare.com
- **Password:** admin123

### Test User Account  
- **Email:** user@tastyshare.com
- **Password:** user123

## 📁 Project Structure
```
TastyShare/
├── app.py                 # Main Flask application
├── config.py              # Configuration settings
├── extensions.py          # Flask extensions
├── init_db.py            # Database initialization
├── requirements.txt       # Dependencies
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
└── static/               # CSS, JS, images
```

## 🚀 How to Run

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Initialize Database:**
   ```bash
   python init_db.py
   ```

3. **Run Application:**
   ```bash
   python app.py
   ```

4. **Access Application:**
   - Local: http://localhost:5000
   - Live: https://web-production-4541.up.railway.app/

## 📊 Key Features Demonstrated

### **Security Features:**
- JWT authentication
- Password hashing
- Input validation
- XSS protection
- File upload security

### **User Experience:**
- Responsive design
- Real-time form validation
- Interactive UI components
- Toast notifications
- Professional styling

### **Database Operations:**
- CRUD operations for all entities
- Complex queries with filtering
- Pagination for large datasets
- Data relationships management

## 📝 Additional Notes

- **Code Quality:** Clean, well-commented code
- **Documentation:** Comprehensive README with setup instructions
- **Testing:** Demo accounts provided for easy testing
- **Deployment:** Successfully deployed on Railway platform
- **Scalability:** Designed for future enhancements

## ✅ Submission Checklist

- [x] All 7 assignment requirements implemented
- [x] SQLite database with sample data
- [x] Python Flask backend
- [x] Professional frontend design
- [x] Working authentication system
- [x] Admin dashboard functional
- [x] Recipe management complete
- [x] Search and filter working
- [x] User interactions implemented
- [x] Live demo available
- [x] Source code clean and documented

---

**Submitted by:** Student BC210426502  
**Date:** September 12, 2025  
**Supervisor:** Rizwana Noor
