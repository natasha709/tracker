import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval, subDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, AreaChart, Area } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Filter, 
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Zap
} from 'lucide-react';
import { analyticsApi, expenseApi, budgetApi } from '../lib/api';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('current-month');
  const [viewType, setViewType] = useState<'overview' | 'trends' | 'budgets'>('overview');
  
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'current-month':
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return {
          startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        };
      case 'last-3-months':
        return {
          startDate: format(subMonths(now, 3), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        };
      case 'last-6-months':
        return {
          startDate: format(subMonths(now, 6), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        };
      default:
        return {};
    }
  };

  const { data: stats, isLoading } = useQuery(
    ['analytics', dateRange],
    () => analyticsApi.getExpenseStats(getDateRange()),
    { enabled: true }
  );

  const { data: yearlyStats } = useQuery(
    ['analytics', 'yearly'],
    () => analyticsApi.getExpenseStats()
  );

  // Get current month expenses for daily trend
  const { data: currentMonthExpenses } = useQuery(
    ['expenses', 'current-month'],
    () => {
      const now = new Date();
      return expenseApi.getExpenses({
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
      });
    }
  );

  // Get current month budgets
  const { data: currentBudgets } = useQuery(
    ['budgets', 'current'],
    () => {
      const now = new Date();
      return budgetApi.getBudgets({ 
        month: now.getMonth() + 1, 
        year: now.getFullYear() 
      });
    }
  );

  // Get previous month data for comparison
  const { data: previousMonthStats } = useQuery(
    ['analytics', 'previous-month'],
    () => {
      const lastMonth = subMonths(new Date(), 1);
      return analyticsApi.getExpenseStats({
        startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
      });
    }
  );

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const categoryData = stats?.categoryBreakdown?.filter(item => item.amount > 0) || [];
  const monthlyTrend = yearlyStats?.monthlyTrend || [];

  // Calculate insights
  const currentTotal = stats?.totalExpenses || 0;
  const previousTotal = previousMonthStats?.totalExpenses || 0;
  const monthOverMonthChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
  const isIncreasing = monthOverMonthChange > 0;

  // Daily spending trend for current month
  const dailyTrend = React.useMemo(() => {
    if (!currentMonthExpenses) return [];
    
    const dailyData: { [key: string]: number } = {};
    currentMonthExpenses.forEach(expense => {
      const day = format(new Date(expense.date), 'MMM dd');
      dailyData[day] = (dailyData[day] || 0) + expense.amount;
    });

    return Object.entries(dailyData)
      .map(([day, amount]) => ({ day, amount }))
      .sort((a, b) => new Date(a.day + ', 2024').getTime() - new Date(b.day + ', 2024').getTime());
  }, [currentMonthExpenses]);

  // Budget vs Actual comparison
  const budgetComparison = React.useMemo(() => {
    if (!currentBudgets || !currentMonthExpenses) return [];

    return currentBudgets.map(budget => {
      const categoryExpenses = currentMonthExpenses.filter(expense => expense.categoryId === budget.categoryId);
      const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      return {
        category: budget.category?.name || 'Unknown',
        icon: budget.category?.icon || '📦',
        budgeted: budget.amount,
        spent,
        remaining: budget.amount - spent,
        percentage,
        status: percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good'
      };
    });
  }, [currentBudgets, currentMonthExpenses]);

  // Top spending categories
  const topCategories = categoryData
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Spending insights
  const insights = React.useMemo(() => {
    const insights = [];
    
    if (monthOverMonthChange > 20) {
      insights.push({
        type: 'warning',
        title: 'High Spending Alert',
        message: `Your spending increased by ${monthOverMonthChange.toFixed(1)}% compared to last month`,
        icon: AlertTriangle
      });
    } else if (monthOverMonthChange < -10) {
      insights.push({
        type: 'success',
        title: 'Great Progress!',
        message: `You reduced spending by ${Math.abs(monthOverMonthChange).toFixed(1)}% compared to last month`,
        icon: CheckCircle
      });
    }

    const overBudgetCategories = budgetComparison.filter(item => item.status === 'over');
    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Budget Exceeded',
        message: `${overBudgetCategories.length} categories are over budget this month`,
        icon: Target
      });
    }

    if (topCategories.length > 0) {
      const topCategory = topCategories[0];
      insights.push({
        type: 'info',
        title: 'Top Spending Category',
        message: `${topCategory.category.name} accounts for ${topCategory.percentage.toFixed(1)}% of your spending`,
        icon: Zap
      });
    }

    return insights;
  }, [monthOverMonthChange, budgetComparison, topCategories]);

  const getRangeLabel = () => {
    switch (dateRange) {
      case 'current-month':
        return 'This Month';
      case 'last-month':
        return 'Last Month';
      case 'last-3-months':
        return 'Last 3 Months';
      case 'last-6-months':
        return 'Last 6 Months';
      default:
        return 'All Time';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'from-green-100 to-emerald-100 border-green-200';
      case 'warning': return 'from-yellow-100 to-orange-100 border-yellow-200';
      case 'info': return 'from-blue-100 to-indigo-100 border-blue-200';
      default: return 'from-gray-100 to-slate-100 border-gray-200';
    }
  };

  const getInsightTextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-700';
      case 'warning': return 'text-yellow-700';
      case 'info': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Detailed insights into your spending patterns</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="current-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{getRangeLabel()}</p>
              <p className="text-2xl font-bold text-gray-900">${(stats?.totalExpenses || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories Used</p>
              <p className="text-2xl font-bold text-gray-900">{categoryData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average per Category</p>
              <p className="text-2xl font-bold text-gray-900">
                ${categoryData.length > 0 ? ((stats?.totalExpenses || 0) / categoryData.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Spending by Category ({getRangeLabel()})
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category.name} (${percentage.toFixed(1)}%)`}
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
            <div className="flex items-center justify-center h-64 text-gray-500">
              No expenses in selected period
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend (Last 6 Months)</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Category Details Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Category Breakdown ({getRangeLabel()})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.map((item, index) => (
                <tr key={item.category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{item.category.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.category.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${item.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{item.percentage.toFixed(1)}%</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categoryData.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No expenses in selected period
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;