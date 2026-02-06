# 💰 Expense Tracker

A full-stack web application for tracking daily expenses, setting budgets, managing recurring expenses, and viewing detailed analytics.

## 🚀 Features

### 👤 Authentication
- User registration and login
- JWT-based authentication
- Protected routes
- Secure password hashing

### 💰 Expense Management
- Add, edit, and delete expenses
- Categorize spending (Food, Transport, Shopping, etc.)
- Date-based filtering
- Search functionality
- Export to CSV and PDF

### 📊 Dashboard & Analytics
- Monthly expense overview
- Category breakdown with pie charts
- Monthly spending trends
- Recent expenses list
- Statistics cards
- Visual data representation

### 🎯 Budget Management
- Set monthly budgets by category
- Track budget vs actual spending
- Visual progress indicators
- Budget alerts and warnings
- Month/year filtering

### 🔄 Recurring Expenses
- Set up recurring transactions (daily, weekly, monthly, yearly)
- Auto-generate expenses from templates
- Manage subscriptions and regular payments
- Active/inactive status tracking

### 📋 Expense List
- View all expenses with advanced filtering
- Search by description or category
- Date range filtering (today, week, month, year, all time)
- Edit expenses inline
- Bulk export capabilities

### 🎨 Categories
- Pre-defined expense categories with icons
- Color-coded visualization
- Category-based filtering
- Icon-based identification

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **JSON File Database** (development)
- **JWT** authentication
- **bcryptjs** for password hashing
- **Joi** for validation
- **Helmet** + **CORS** for security
- **Rate limiting** for API protection

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hook Form** for forms
- **Recharts** for data visualization
- **React Router** for navigation
- **date-fns** for date manipulation
- **Lucide React** for icons

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone and Install
```bash
git clone <repository-url>
cd expense-tracker
npm run install:all
```

### 2. Backend Configuration
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Servers
```bash
# From root directory - starts both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:5173
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
expense-tracker/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components (Layout)
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── lib/            # API client, utilities, export functions
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ExpenseList.tsx
│   │   │   ├── AddExpense.tsx
│   │   │   ├── Budgets.tsx
│   │   │   ├── RecurringExpenses.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   └── types/          # TypeScript types
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── database/       # Database connection and schema
│   │   ├── middleware/     # Express middleware (auth)
│   │   ├── routes/         # API routes
│   │   │   ├── auth.ts
│   │   │   ├── expenses.ts
│   │   │   ├── categories.ts
│   │   │   ├── budgets.ts
│   │   │   ├── recurring.ts
│   │   │   └── analytics.ts
│   │   └── index.ts        # Server entry point
│   ├── database.json       # JSON file database
│   └── package.json
├── shared/                  # Shared TypeScript types
└── package.json            # Root package.json
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

### Budgets
- `GET /api/budgets` - Get user budgets (with month/year filter)
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Recurring Expenses
- `GET /api/recurring` - Get user recurring expenses
- `POST /api/recurring` - Create recurring expense
- `PUT /api/recurring/:id` - Update recurring expense
- `DELETE /api/recurring/:id` - Delete recurring expense
- `POST /api/recurring/generate` - Generate expenses from recurring templates

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
- Password hashing with bcryptjs (12 rounds)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with Joi
- Protected API routes

## 📱 Features Highlights

### Smart Filtering
- Search across descriptions and categories
- Filter by category
- Date range filtering (today, week, month, year, all time)
- Real-time search results

### Data Export
- Export expenses to CSV format
- Generate PDF reports
- Customizable date ranges
- Category-specific exports

### Budget Tracking
- Visual progress bars
- Color-coded status indicators (good, warning, over budget)
- Monthly budget summaries
- Category-wise budget allocation

### Recurring Expenses
- Multiple frequency options (daily, weekly, monthly, yearly)
- Automatic expense generation
- Start and end date management
- Active/inactive toggle

## 🚀 Deployment

### Backend
1. Build: `cd backend && npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, Railway, Render, etc.)

### Frontend
1. Build: `cd frontend && npm run build`
2. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)

### Database
- Current: JSON file (development only)
- Production: Migrate to PostgreSQL, MySQL, or MongoDB

## 🔮 Future Enhancements

- [ ] PostgreSQL database integration
- [ ] Email notifications for budget alerts
- [ ] Multi-currency support
- [ ] Receipt photo upload
- [ ] Mobile app (React Native)
- [ ] Shared budgets for families
- [ ] Financial goals tracking
- [ ] Automated expense categorization (AI)
- [ ] Bank account integration
- [ ] Tax report generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

---

**Happy expense tracking! 💰📊**