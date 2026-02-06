# 💰 Expense Tracker

A full-stack web application for tracking daily expenses, setting budgets, and viewing analytics.

## 🚀 Features

### 👤 Authentication
- User registration and login
- JWT-based authentication
- Protected routes

### 💰 Expense Management
- Add, edit, and delete expenses
- Categorize spending (Food, Transport, Shopping, etc.)
- Date-based filtering
- Expense descriptions

### 📊 Dashboard & Analytics
- Monthly expense overview
- Category breakdown with pie charts
- Monthly spending trends
- Recent expenses list
- Statistics cards

### 🎯 Categories
- Pre-defined expense categories with icons
- Color-coded visualization
- Category-based filtering

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** database
- **JWT** authentication
- **bcryptjs** for password hashing
- **Joi** for validation
- **Helmet** + **CORS** for security

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hook Form** for forms
- **Recharts** for data visualization
- **React Router** for navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd expense-tracker
npm run install:all
```

### 2. Database Setup
```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Or use your local PostgreSQL instance
# Create database: expense_tracker
```

### 3. Backend Configuration
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Initialize Database
```bash
# Connect to your PostgreSQL database and run:
psql -U postgres -d expense_tracker -f src/database/schema.sql
```

### 5. Start Development Servers
```bash
# From root directory - starts both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

## 📁 Project Structure

```
expense-tracker/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/            # API client and utilities
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript types
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── database/       # Database connection and schema
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry point
│   └── package.json
├── shared/                  # Shared TypeScript types
└── docker-compose.yml       # PostgreSQL setup
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Expenses
- `GET /api/expenses` - Get user expenses (with filtering)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `GET /api/categories` - Get all categories

### Analytics
- `GET /api/analytics/expenses` - Get expense statistics

## 🎨 Default Categories

The app comes with 9 pre-configured categories:
- 🍽️ Food & Dining
- 🚗 Transportation  
- 🛍️ Shopping
- 🎬 Entertainment
- 💡 Bills & Utilities
- 🏥 Healthcare
- 📚 Education
- ✈️ Travel
- 📦 Other

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcryptjs
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection prevention

## 🚀 Deployment

### Backend
1. Build: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)

### Database
- Use managed PostgreSQL (AWS RDS, Railway, etc.)
- Run schema.sql on production database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

---

**Happy expense tracking! 💰📊**