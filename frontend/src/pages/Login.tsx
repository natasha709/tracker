import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { DollarSign, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data.email, data.password);
      login(response.user, response.token);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative">
        <div className="text-center animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-primary-600 to-indigo-600 p-4 rounded-2xl">
                <DollarSign className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome back
            </h2>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-gray-600">
            Sign in to your ExpenseTracker account
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Create one now
            </Link>
          </p>
        </div>

        <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className="input-field w-full"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input-field w-full pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;