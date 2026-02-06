import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Search, Filter, Edit2, Trash2, Calendar, DollarSign, X, Download, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { expenseApi, categoryApi, Expense } from '../lib/api';
import { exportToCSV, exportToPDF } from '../lib/export';

interface ExpenseForm {
  categoryId: string;
  amount: number;
  description: string;
  date: string;
}

const ExpenseList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  const getDateRangeParams = () => {
    const today = new Date();
    switch (dateRange) {
      case 'today':
        return {
          startDate: format(today, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd'),
        };
      case 'week':
        return {
          startDate: format(startOfWeek(today), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(today), 'yyyy-MM-dd'),
        };
      case 'month':
        return {
          startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
        };
      case 'year':
        return {
          startDate: format(startOfYear(today), 'yyyy-MM-dd'),
          endDate: format(endOfYear(today), 'yyyy-MM-dd'),
        };
      default:
        return {};
    }
  };

  const { data: expenses = [], isLoading } = useQuery(
    ['expenses', selectedCategory, dateRange],
    () => expenseApi.getExpenses({
      category: selectedCategory || undefined,
      ...getDateRangeParams(),
    })
  );

  const { data: categories = [] } = useQuery('categories', categoryApi.getCategories);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExpenseForm>();

  const updateExpenseMutation = useMutation(
    ({ id, data }: { id: string; data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'category'> }) =>
      expenseApi.updateExpense(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('expenses');
        queryClient.invalidateQueries('analytics');
        toast.success('Expense updated successfully!');
        setShowEditModal(false);
        setEditingExpense(null);
        reset();
      },
      onError: () => {
        toast.error('Failed to update expense');
      },
    }
  );

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

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    reset({
      categoryId: expense.categoryId,
      amount: expense.amount,
      description: expense.description,
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
    });
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteExpenseMutation.mutate(id);
    }
  };

  const onSubmit = (data: ExpenseForm) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data });
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
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Expense History
        </h1>
        <p className="text-gray-600 mt-1">View and manage all your expenses</p>
      </div>

      {/* Filters */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
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
      <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {filteredExpenses.length} Expenses Found
            </h3>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Total: ${filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
              </div>
              <button
                onClick={() => {
                  exportToCSV(filteredExpenses, `expenses-${format(new Date(), 'yyyy-MM-dd')}.csv`);
                  toast.success('Exported to CSV!');
                }}
                className="btn-secondary flex items-center space-x-2 text-sm"
                disabled={filteredExpenses.length === 0}
              >
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => {
                  exportToPDF(filteredExpenses);
                  toast.success('Opening PDF preview...');
                }}
                className="btn-secondary flex items-center space-x-2 text-sm"
                disabled={filteredExpenses.length === 0}
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </button>
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
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Edit Expense</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingExpense(null);
                  reset();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  {...register('categoryId', { required: 'Category is required' })}
                  className="input-field w-full"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  className="input-field w-full"
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  {...register('description', { required: 'Description is required' })}
                  type="text"
                  className="input-field w-full"
                  placeholder="What did you spend on?"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  {...register('date', { required: 'Date is required' })}
                  type="date"
                  className="input-field w-full"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Update Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingExpense(null);
                    reset();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;