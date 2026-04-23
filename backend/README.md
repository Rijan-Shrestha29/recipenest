# RecipeNest Backend API

A complete backend API for a recipe sharing platform where users can discover, share, and bookmark recipes. Built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication (Access & Refresh tokens)
  - Email verification with OTP
  - Password reset with OTP verification
  - Role-based access control (Food Lover, Chef, Super Admin)

- **Recipe Management**
  - CRUD operations for recipes
  - Recipe approval workflow (pending → approved/rejected)
  - Image upload with Cloudinary
  - Search, filter, and pagination
  - Trending recipes based on views

- **User Interactions**
  - Like/Unlike recipes
  - Bookmark recipes
  - Comment on recipes
  - Follow chefs (coming soon)

- **Admin Dashboard**
  - User management (suspend/unsuspend, role changes)
  - Recipe moderation (approve/reject)
  - Comment moderation
  - Dashboard statistics

- **Security Features**
  - Password hashing with bcrypt
  - Email verification
  - Account suspension
  - Rate limiting (optional)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Cloudinary account (for image upload)
- SMTP email service (Gmail, SendGrid, etc.)

## Seed the database
To seed the database with initial data, run the following command:

```bash
npm run seed
```