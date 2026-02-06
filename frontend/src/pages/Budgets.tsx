import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  Target, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { budgetApi, categoryApi, expenseApi, Budget } from '../lib/api';

interface BudgetForm {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

const Budgets: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: categories = [] } = useQuery('categories', categoryApi.getCategories);
  
  const { data: budgets = [] } = useQuery(
    ['budgets', selectedMonth, selectedYear],
    () => budgetApi.getBudgets({ month: selectedMonth, year: selectedYear })
  );

  const { data: expenses = [] } = useQuery(
    ['expenses', 'budget-comparison', selectedMonth, selectedYear],
    () => {
      const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
      const monthEnd = new Date(selectedYear, selectedMonth, 0);
      return expenseApi.getExpenses({
        startDate: format(monthStart, 'yyyy-MM-dd'),
        endDate: format(monthEnd, 'yyyy-MM-dd'),
      });
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetForm>({
    defaultValues: {
      month: selectedMonth,
      year: selectedYear,
    },
  });

  // Effect to populate form when editing
  useEffect(() => {
    if (editingBudget && showForm) {
      console.log('Editing budget:', editingBudget); // Debug log
      console.log('Category ID:', editingBudget.categoryId); // Debug log
      console.log('Available categories:', categories); // Debug log
      reset({
        categoryId: editingBudget.categoryId,
        amount: editingBudget.amount,
        month: editingBudget.month,
        year: editingBudget.year,
      });
    } else if (!editingBudget && showForm) {
      reset({
        categoryId: '',
        amount: 0,
        month: selectedMonth,
        year: selectedYear,
      });
    }
  }, [editingBudget, showForm, reset, selectedMonth, selectedYear, categories]);

  const createBudgetMutation = useMutation(budgetApi.createBudget, {
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets']);
      toast.success('Budget created successfully!');
      setShowForm(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create budget');
    },
  });

  const updateBudgetMutation = useMutation(
    ({ id, data }: { id: string; data: Omit<Budget, 'id' | 'userId' | 'createdAt'> }) =>
      budgetApi.updateBudget(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['budgets']);
        toast.success('Budget updated successfully!');
        setEditingBudget(null);
        setShowForm(false);
        reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update budget');
      },
    }
  );

  const deleteBudgetMutation = useMutation(budgetApi.deleteBudget, {
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets']);
      toast.success('Budget deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete budget');
    },
  });

  const onSubmit = (data: BudgetForm) => {
    if (editingBudget) {
      updateBudgetMutation.mutate({ id: editingBudget.id, data });
    } else {
      createBudgetMutation.mutate(data);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudgetMutation.mutate(id);
    }
  };

  const getBudgetStatus = (budget: Budget) => {
    const categoryExpenses = expenses.filter(expense => expense.categoryId === budget.categoryId);
    const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

    if (percentage >= 100) return { status: 'over', color: 'red', icon: AlertTriangle };
    if (percentage >= 80) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'good', color: 'green', icon: CheckCircle };
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = totalBudget - totalSpent;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Budget Management
          </h1>
          <p className="text-gray-600 mt-1">Set and track your spending limits</p>
        </div>
        <button
          onClick={() => {
            setEditingBudget(null);
            reset({ month: selectedMonth, year: selectedYear });
            setShowForm(true);
          }}
          className="btn-primary flex items-center space-x-2 animate-bounce-in"
        >
          <Plus className="h-4 w-4" />
          <span>Add Budget</span>
        </button>
      </div>

      {/* Month/Year Selector */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="input-field"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="input-field"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-100 to-pink-100">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card card-hover animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${remainingBudget.toFixed(2)}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-r ${
                remainingBudget >= 0 ? 'from-green-100 to-emerald-100' : 'from-red-100 to-pink-100'
              }`}>
                <TrendingUp className={`h-6 w-6 ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className="card animate-slide-up" key={editingBudget?.id || 'new'}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingBudget ? 'Edit Budget' : 'Create New Budget'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select {...register('month', { valueAsNumber: true })} className="input-field w-full">
                  {months.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <select {...register('year', { valueAsNumber: true })} className="input-field w-full">
                  {[2024, 2025, 2026].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-4 flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBudget(null);
                    reset();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budget List */}
      <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Budgets for {months[selectedMonth - 1]} {selectedYear}
          </h3>
          
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map((budget) => {
                const categoryExpenses = expenses.filter(expense => expense.categoryId === budget.categoryId);
                const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                const percentage = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;
                const { color, icon: StatusIcon } = getBudgetStatus(budget);

                return (
                  <div key={budget.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-indigo-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">{budget.category?.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{budget.category?.name}</h4>
                          <p className="text-sm text-gray-500">
                            ${totalSpent.toFixed(2)} of ${budget.amount.toFixed(2)} spent
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`h-4 w-4 text-${color}-500`} />
                            <span className={`text-sm font-medium text-${color}-600`}>
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className={`h-2 rounded-full bg-${color}-500`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(budget)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">No budgets set</p>
              <p className="text-gray-500 mb-4">Create your first budget to start tracking your spending limits</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Budget</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budgets;