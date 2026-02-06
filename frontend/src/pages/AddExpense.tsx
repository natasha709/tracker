import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { categoryApi, expenseApi } from '../lib/api';

interface ExpenseForm {
  categoryId: string;
  amount: number;
  description: string;
  date: string;
}

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: categories = [] } = useQuery('categories', categoryApi.getCategories);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExpenseForm>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0], // Today's date
    },
  });

  const createExpenseMutation = useMutation(expenseApi.createExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries('expenses');
      queryClient.invalidateQueries('analytics');
      toast.success('Expense added successfully!');
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add expense');
    },
  });

  const onSubmit = async (data: ExpenseForm) => {
    setIsLoading(true);
    try {
      await createExpenseMutation.mutateAsync({
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description,
        date: new Date(data.date),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
            <p className="text-gray-600">Track your spending by adding a new expense</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              {...register('categoryId', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a category</option>
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

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount ($)
            </label>
            <input
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                valueAsNumber: true,
              })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              {...register('description')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="What did you spend on?"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              {...register('date', { required: 'Date is required' })}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Expense'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;