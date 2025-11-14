# TastyShare: Recipe Sharing Platform - Design Document

## 📋 Project Information
- **Student ID:** BC210426502
- **Project Title:** TastyShare: Recipe Sharing Platform
- **Group ID:** S25PROJECTD15D9
- **Supervisor:** Rizwana Noor
- **Submission Date:** [Current Date]

---

## 1. Executive Summary

TastyShare is a comprehensive web-based recipe sharing platform designed to connect culinary enthusiasts, home cooks, and professional chefs. The platform enables users to share, discover, rate, and manage recipes while providing administrators with powerful content moderation tools.

### Key Objectives:
- Create an intuitive recipe sharing community
- Implement secure user authentication and role management
- Provide advanced search and filtering capabilities
- Enable social interactions through ratings and favorites
- Ensure content quality through admin moderation

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Templates)   │◄──►│   (Flask App)   │◄──►│    (SQLite)     │
│   HTML/CSS/JS   │    │   Python/Flask  │    │   4 Main Tables │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2.2 Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Backend:** Python Flask Framework
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt password hashing, input validation
- **Deployment:** Railway Platform

### 2.3 MVC Architecture Implementation
- **Models:** User, Recipe, Review, Favorite (in models/ directory)
- **Views:** HTML templates with Jinja2 templating (templates/ directory)
- **Controllers:** Flask routes handling business logic (routes/ directory)

---

## 3. Database Design

### 3.1 Entity Relationship Diagram
```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │       │   Recipes   │       │   Reviews   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │───┐   │ id (PK)     │   ┌───│ id (PK)     │
│ username    │   │   │ title       │   │   │ rating      │
│ email       │   └──►│ user_id(FK) │◄──┘   │ comment     │
│ password    │       │ description │       │ user_id(FK) │
│ role        │       │ ingredients │       │ recipe_id   │
│ created_at  │       │ category    │       │ created_at  │
└─────────────┘       │ created_at  │       └─────────────┘
       │               └─────────────┘              │
       │                      │                    │
       │               ┌─────────────┐              │
       └──────────────►│  Favorites  │◄─────────────┘
                       ├─────────────┤
                       │ id (PK)     │
                       │ user_id(FK) │
                       │ recipe_id   │
                       │ created_at  │
                       └─────────────┘
```

### 3.2 Database Tables

#### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique user identifier |
| username | VARCHAR(80) UNIQUE | User's display name |
| email | VARCHAR(120) UNIQUE | User's email address |
| password_hash | VARCHAR(255) | Encrypted password |
| first_name | VARCHAR(50) | User's first name |
| last_name | VARCHAR(50) | User's last name |
| bio | TEXT | User biography |
| profile_image | VARCHAR(200) | Profile image filename |
| role | VARCHAR(20) | User role (user/admin) |
| is_active | BOOLEAN | Account status |
| created_at | DATETIME | Account creation date |

#### Recipes Table
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique recipe identifier |
| title | VARCHAR(200) | Recipe title |
| description | TEXT | Recipe description |
| ingredients | TEXT | JSON array of ingredients |
| instructions | TEXT | JSON array of cooking steps |
| category | VARCHAR(50) | Recipe category |
| cuisine_type | VARCHAR(50) | Cuisine classification |
| prep_time | INTEGER | Preparation time (minutes) |
| cook_time | INTEGER | Cooking time (minutes) |
| servings | INTEGER | Number of servings |
| difficulty_level | VARCHAR(20) | Difficulty (easy/medium/hard) |
| image_url | VARCHAR(200) | Recipe image filename |
| user_id | INTEGER | Foreign key to users table |
| view_count | INTEGER | Number of views |
| created_at | DATETIME | Creation timestamp |

#### Reviews Table
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique review identifier |
| rating | INTEGER | Star rating (1-5) |
| comment | TEXT | Review comment |
| user_id | INTEGER | Foreign key to users table |
| recipe_id | INTEGER | Foreign key to recipes table |
| created_at | DATETIME | Review timestamp |

#### Favorites Table
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique favorite identifier |
| user_id | INTEGER | Foreign key to users table |
| recipe_id | INTEGER | Foreign key to recipes table |
| created_at | DATETIME | Favorite timestamp |

---

## 4. User Interface Design

### 4.1 Design Principles
- **Mobile-First:** Responsive design for all screen sizes
- **User-Centered:** Intuitive navigation and clear call-to-actions
- **Modern Aesthetic:** Clean, professional appearance
- **Accessibility:** WCAG guidelines compliance

### 4.2 Color Scheme
- **Primary:** #007bff (Bootstrap Blue)
- **Secondary:** #6c757d (Gray)
- **Success:** #28a745 (Green)
- **Warning:** #ffc107 (Yellow)
- **Danger:** #dc3545 (Red)

### 4.3 Key Interface Components

#### Navigation Bar
- Logo and brand name
- Main navigation links
- User authentication status
- Search functionality

#### Recipe Cards
- Recipe image thumbnail
- Title and brief description
- Rating display
- Category and cooking time
- Favorite button

#### Forms
- Consistent styling across all forms
- Real-time validation feedback
- Clear error messages
- Progress indicators for multi-step processes

---

## 5. System Features

### 5.1 User Management
- **Registration:** Secure account creation with validation
- **Authentication:** JWT-based login system
- **Profile Management:** Edit personal information and preferences
- **Role-Based Access:** Different permissions for users and admins

### 5.2 Recipe Management
- **Create Recipes:** Rich form with image upload
- **Edit/Delete:** Full CRUD operations for recipe owners
- **Categorization:** Multiple category and cuisine options
- **Rich Content:** Support for detailed ingredients and instructions

### 5.3 Search and Discovery
- **Text Search:** Search by recipe name or ingredients
- **Category Filtering:** Filter by meal type, cuisine, dietary preferences
- **Sorting Options:** Sort by rating, date, popularity
- **Pagination:** Efficient handling of large result sets

### 5.4 Social Features
- **Rating System:** 5-star rating with average calculations
- **Favorites:** Personal recipe collections
- **Reviews:** Comment and feedback system
- **User Profiles:** View other users' recipe collections

### 5.5 Admin Panel
- **Dashboard:** Overview of system statistics
- **User Management:** View, activate/deactivate users
- **Content Moderation:** Review and manage recipes
- **Analytics:** Usage statistics and reporting

---

## 6. Security Design

### 6.1 Authentication Security
- **Password Hashing:** bcrypt with salt rounds
- **JWT Tokens:** Secure token-based authentication
- **Session Management:** Automatic token expiration
- **Role-Based Access Control:** Granular permissions

### 6.2 Input Validation
- **Server-Side Validation:** All inputs validated on backend
- **XSS Prevention:** Input sanitization and output encoding
- **SQL Injection Prevention:** SQLAlchemy ORM usage
- **File Upload Security:** Type and size restrictions

### 6.3 Data Protection
- **Sensitive Data:** Passwords never stored in plain text
- **Database Security:** Prepared statements and parameterized queries
- **Error Handling:** Generic error messages to prevent information disclosure

---

## 7. API Design

### 7.1 RESTful Endpoints

#### Authentication Routes (`/api/auth/`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password

#### Recipe Routes (`/api/recipes/`)
- `GET /` - List recipes with filtering
- `POST /` - Create new recipe
- `GET /:id` - Get specific recipe
- `PUT /:id` - Update recipe
- `DELETE /:id` - Delete recipe
- `POST /:id/review` - Add recipe review
- `POST /:id/favorite` - Toggle favorite status

#### Admin Routes (`/api/admin/`)
- `GET /dashboard` - Admin dashboard data
- `GET /users` - List all users
- `PUT /users/:id/status` - Toggle user status
- `GET /recipes` - List all recipes for moderation
- `DELETE /recipes/:id` - Delete recipe (admin)

### 7.2 Response Format
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Success/Error message",
  "pagination": { ... } // for paginated results
}
```

---

## 8. Implementation Plan

### Phase 1: Core Infrastructure ✅
- Database schema design and implementation
- User authentication system
- Basic Flask application structure

### Phase 2: Recipe Management ✅
- Recipe CRUD operations
- Image upload functionality
- Category and filtering system

### Phase 3: User Interactions ✅
- Rating and review system
- Favorites functionality
- User profile management

### Phase 4: Admin Features ✅
- Admin dashboard
- Content moderation tools
- User management system

### Phase 5: UI/UX Polish ✅
- Responsive design implementation
- Interactive JavaScript features
- Performance optimization

### Phase 6: Deployment ✅
- Production environment setup
- Database migration
- Live deployment on Railway

---

## 9. Testing Strategy

### 9.1 Unit Testing
- Model validation testing
- Route functionality testing
- Authentication system testing

### 9.2 Integration Testing
- Database operations testing
- API endpoint testing
- User workflow testing

### 9.3 User Acceptance Testing
- Demo accounts for feature testing
- Cross-browser compatibility
- Mobile responsiveness testing

---

## 10. Deployment Architecture

### 10.1 Production Environment
- **Platform:** Railway Cloud Platform
- **Database:** PostgreSQL (production) / SQLite (development)
- **Static Files:** Served through Flask
- **Domain:** Custom Railway-provided URL

### 10.2 Environment Configuration
- **Development:** Local SQLite database
- **Production:** PostgreSQL with connection pooling
- **Security:** Environment variables for sensitive data

---

## 11. Future Enhancements

### 11.1 Planned Features
- **Email Notifications:** Recipe updates and user interactions
- **Social Media Integration:** Share recipes on social platforms
- **Meal Planning:** Weekly meal planning functionality
- **Nutrition Information:** Calorie and nutrition tracking
- **Mobile App:** Native mobile application

### 11.2 Scalability Considerations
- **Database Optimization:** Indexing and query optimization
- **Caching:** Redis implementation for improved performance
- **CDN Integration:** Static file delivery optimization
- **Load Balancing:** Multi-instance deployment capability

---

## 12. Conclusion

The TastyShare platform successfully implements all required prototype features while maintaining a scalable and secure architecture. The system demonstrates proficiency in full-stack web development, database design, and modern web technologies. The modular design allows for easy maintenance and future feature additions.

The project serves as a comprehensive demonstration of software engineering principles, including proper separation of concerns, security best practices, and user-centered design. The live deployment showcases the practical application of theoretical concepts in a real-world environment.

---

**Document Prepared By:**  
Student ID: BC210426502  
Date: [Current Date]  
Supervisor: Rizwana Noor
