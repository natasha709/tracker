import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Repeat, 
  Plus, 
  Edit2, 
  Trash2, 
  Play,
  Pause,
  Calendar,
  DollarSign
} from 'lucide-react';
import { recurringApi, categoryApi, RecurringExpense } from '../lib/api';

interface RecurringExpenseForm {
  categoryId: string;
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

const RecurringExpenses: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);

  const { data: categories = [] } = useQuery('categories', categoryApi.getCategories);
  const { data: recurringExpenses = [] } = useQuery('recurringExpenses', recurringApi.getRecurringExpenses);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecurringExpenseForm>({
    defaultValues: {
      isActive: true,
    },
  });

  const createMutation = useMutation(recurringApi.createRecurringExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(['recurringExpenses']);
      toast.success('Recurring expense created successfully!');
      setShowForm(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create recurring expense');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Omit<RecurringExpense, 'id' | 'userId' | 'createdAt' | 'category'> }) =>
      recurringApi.updateRecurringExpense(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recurringExpenses']);
        toast.success('Recurring expense updated successfully!');
        setEditingExpense(null);
        setShowForm(false);
        reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update recurring expense');
      },
    }
  );

  const deleteMutation = useMutation(recurringApi.deleteRecurringExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries(['recurringExpenses']);
      toast.success('Recurring expense deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete recurring expense');
    },
  });

  const generateMutation = useMutation(recurringApi.generateRecurringExpenses, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(['expenses']);
      if (data.generated > 0) {
        toast.success(`Generated ${data.generated} recurring expenses!`);
      } else {
        toast.info('No recurring expenses to generate today');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to generate recurring expenses');
    },
  });

  const onSubmit = (data: RecurringExpenseForm) => {
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (expense: RecurringExpense) => {
    console.log('Editing recurring expense:', expense); // Debug log
    console.log('Start date:', expense.startDate); // Debug log
    console.log('End date:', expense.endDate); // Debug log
    
    setEditingExpense(expense);
    
    // Format dates for HTML date inputs (YYYY-MM-DD)
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    reset({
      categoryId: expense.categoryId,
      amount: expense.amount,
      description: expense.description,
      frequency: expense.frequency,
      startDate: formatDateForInput(expense.startDate),
      endDate: expense.endDate ? formatDateForInput(expense.endDate) : '',
      isActive: expense.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      case 'yearly': return '📊';
      default: return '🔄';
    }
  };

  const activeExpenses = recurringExpenses.filter(expense => expense.isActive);
  const inactiveExpenses = recurringExpenses.filter(expense => !expense.isActive);
  const totalMonthlyAmount = activeExpenses
    .filter(expense => expense.frequency === 'monthly')
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Recurring Expenses
          </h1>
          <p className="text-gray-600 mt-1">Manage your subscription and recurring payments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => generateMutation.mutate()}
            className="btn-secondary flex items-center space-x-2"
            disabled={generateMutation.isLoading}
          >
            <Play className="h-4 w-4" />
            <span>Generate Today</span>
          </button>
          <button
            onClick={() => {
              setEditingExpense(null);
              reset({ isActive: true });
              setShowForm(true);
            }}
            className="btn-primary flex items-center space-x-2 animate-bounce-in"
          >
            <Plus className="h-4 w-4" />
            <span>Add Recurring</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Recurring</p>
                <p className="text-2xl font-bold text-gray-900">{activeExpenses.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100">
                <Repeat className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Total</p>
                <p className="text-2xl font-bold text-gray-900">${totalMonthlyAmount.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveExpenses.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-r from-gray-100 to-slate-100">
                <Pause className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card animate-slide-up">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingExpense ? 'Edit Recurring Expense' : 'Create Recurring Expense'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    {...register('description', { required: 'Description is required' })}
                    type="text"
                    className="input-field w-full"
                    placeholder="e.g., Netflix Subscription"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    {...register('frequency', { required: 'Frequency is required' })}
                    className="input-field w-full"
                  >
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  {errors.frequency && (
                    <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    {...register('startDate', { required: 'Start date is required' })}
                    type="date"
                    className="input-field w-full"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                  <input
                    {...register('endDate')}
                    type="date"
                    className="input-field w-full"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    {...register('isActive')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="btn-primary">
                  {editingExpense ? 'Update' : 'Create'} Recurring Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingExpense(null);
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

      {/* Active Recurring Expenses */}
      {activeExpenses.length > 0 && (
        <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Play className="h-5 w-5 text-green-600 mr-2" />
              Active Recurring Expenses
            </h3>
            <div className="space-y-4">
              {activeExpenses.map((expense) => (
                <div key={expense.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-100 to-indigo-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{expense.category?.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{expense.description}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{expense.category?.name}</span>
                          <span className="flex items-center">
                            <span className="mr-1">{getFrequencyIcon(expense.frequency)}</span>
                            {expense.frequency}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(expense.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">per {expense.frequency.slice(0, -2)}</p>
                      </div>
                      
                      <div className="flex space-x-2">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inactive Recurring Expenses */}
      {inactiveExpenses.length > 0 && (
        <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Pause className="h-5 w-5 text-gray-600 mr-2" />
              Inactive Recurring Expenses
            </h3>
            <div className="space-y-4">
              {inactiveExpenses.map((expense) => (
                <div key={expense.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl grayscale">{expense.category?.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700">{expense.description}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{expense.category?.name}</span>
                          <span>{expense.frequency}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-700">${expense.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-400">per {expense.frequency.slice(0, -2)}</p>
                      </div>
                      
                      <div className="flex space-x-2">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {recurringExpenses.length === 0 && (
        <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Repeat className="h-8 w-8 text-primary-600" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">No recurring expenses yet</p>
            <p className="text-gray-500 mb-4">Set up your subscriptions and recurring payments to track them automatically</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Recurring Expense</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringExpenses;