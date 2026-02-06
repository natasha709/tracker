import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import { Search, Filter, Edit2, Trash2, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { expenseApi, categoryApi } from '../lib/api';

const ExpenseList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery(
    ['expenses', searchTerm, selectedCategory, dateRange],
    () => expenseApi.getExpenses({
      category: selectedCategory || undefined,
      // Add date filtering logic here
    })
  );

  const { data: categories = [] } = useQuery('categories', categoryApi.getCategories);

  const deleteExpenseMutation = useMutation(expenseApi.deleteExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses');
      queryClient.invalidateQueries('analytics');
      toast.success('Expense deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete expense');
    },
  });

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpenseMutation.mutate(id);
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
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Expense History
        </h1>
        <p className="text-gray-600 mt-1">View and manage all your expenses</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field w-full"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {filteredExpenses.length} Expenses Found
            </h3>
            <div className="text-sm text-gray-500">
              Total: ${filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
            </div>
          </div>

          {filteredExpenses.length > 0 ? (
            <div className="space-y-3">
              {filteredExpenses.map((expense, index) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-indigo-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{expense.category?.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {expense.description || expense.category?.name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                        </span>
                        <span className="category-pill">
                          {expense.category?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">No expenses found</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseList;