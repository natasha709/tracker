import React from 'react';
import { useQuery } from 'react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { DollarSign, TrendingUp, Calendar, CreditCard, ArrowUpRight, Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { expenseApi, analyticsApi } from '../lib/api';

const Dashboard: React.FC = () => {
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const { data: expenses = [] } = useQuery(
    ['expenses', 'current-month'],
    () => expenseApi.getExpenses({
      startDate: format(monthStart, 'yyyy-MM-dd'),
      endDate: format(monthEnd, 'yyyy-MM-dd'),
    })
  );

  const { data: stats } = useQuery(
    ['analytics', 'current-month'],
    () => analyticsApi.getExpenseStats({
      startDate: format(monthStart, 'yyyy-MM-dd'),
      endDate: format(monthEnd, 'yyyy-MM-dd'),
    })
  );

  const { data: yearlyStats } = useQuery(
    ['analytics', 'yearly'],
    () => analyticsApi.getExpenseStats()
  );

  const recentExpenses = expenses.slice(0, 5);
  const monthlyTotal = stats?.totalExpenses || 0;
  const categoryData = stats?.categoryBreakdown?.filter(item => item.amount > 0) || [];
  const monthlyTrend = yearlyStats?.monthlyTrend || [];

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const statCards = [
    {
      title: 'This Month',
      value: `$${monthlyTotal.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      change: '+12.5%',
      changeType: 'increase'
    },
    {
      title: 'Total Expenses',
      value: `$${(yearlyStats?.totalExpenses || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      change: '+8.2%',
      changeType: 'increase'
    },
    {
      title: 'Transactions',
      value: expenses.length.toString(),
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      change: '+3',
      changeType: 'increase'
    },
    {
      title: 'Categories',
      value: categoryData.length.toString(),
      icon: CreditCard,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      change: '2 active',
      changeType: 'neutral'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Welcome back, {expenses.length > 0 ? '👋' : '🎉'}
          </h1>
          <p className="text-gray-600 mt-1">
            {expenses.length > 0 
              ? "Here's your expense overview for this month" 
              : "Ready to start tracking your expenses?"
            }
          </p>
        </div>
        <Link
          to="/add-expense"
          className="btn-primary flex items-center space-x-2 animate-bounce-in"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="card card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <ArrowUpRight className={`h-4 w-4 ${
                        stat.changeType === 'increase' ? 'text-green-500' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ml-1 ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
              <Link to="/analytics" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </Link>
            </div>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category.icon} ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">No expenses this month</p>
                <p className="text-sm text-gray-400 mt-1">Start by adding your first expense</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trend</h3>
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="amount" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">No trend data yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add expenses to see your spending trends</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
            <Link to="/analytics" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense, index) => (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-indigo-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{expense.category?.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {expense.description || expense.category?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <div className="category-pill mt-1">
                      {expense.category?.name}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-primary-600" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">No expenses yet</p>
                <p className="text-gray-500 mb-4">Start tracking your spending today!</p>
                <Link to="/add-expense" className="btn-primary inline-flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Your First Expense</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;