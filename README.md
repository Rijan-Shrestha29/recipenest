# RecipeNest - Recipe Sharing Platform

A full-stack web application for sharing and discovering delicious recipes. Chefs can share their culinary creations, while food lovers can explore, save, and interact with recipes.


## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Access & Refresh Tokens)
- **Email Service**: Nodemailer
- **File Upload**: Multer
- **Security**: bcryptjs, CORS

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Material-UI (MUI)
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Form Handling**: React Hook Form with Zod
- **Routing**: React Router v7
- **UI Components**: 
  - Material-UI (MUI)
  - Radix UI primitives
  - Lucide React icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn** (v1.22+)
- **MongoDB** (v6 or higher) - Local installation or MongoDB Atlas account
- **Git** (for version control)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone git@github.com:Rijan-Shrestha29/recipenest.git
```
### 2. Navigate to the project directory

```bash
cd recipenest
```

# Navigate to backend directory
```bash
cd backend
```

# Install dependencies
```bash
npm install
```

# Create environment file
```bash
cp .env.example .env
```

## Update .env with your configuration
## Edit .env file and add your database URL, JWT secrets, etc.

# Start MongoDB (if using local installation)
# Windows:
```bash
net start MongoDB
```

# macOS:
```bash
brew services start mongodb-community
```

# Linux:
```bash
sudo systemctl start mongod
```

# Run database seeder (optional - creates sample data)
```bash
npm run seed
```

# Start backend server
```bash
npm run dev
```

# Open a new terminal and navigate to frontend directory
```bash
cd frontend
```

# Install dependencies
```bash
npm install
```

# Create environment file (if needed)
```bash
cp .env.example .env
```

# Start frontend development server
```bash
npm run dev
```