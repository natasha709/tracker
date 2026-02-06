import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Target,
  Repeat,
  LogOut,
  DollarSign,
  User,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Add Expense', href: '/add-expense', icon: PlusCircle },
    { name: 'Budgets', href: '/budgets', icon: Target },
    { name: 'Recurring', href: '/recurring', icon: Repeat },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const Sidebar = ({ className = '' }: { className?: string }) => (
    <div className={`flex flex-col h-screen ${className}`}>
      {/* Logo */}
      <div className="flex items-center space-x-3 p-6 border-b border-white/10 flex-shrink-0">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-indigo-400 rounded-xl blur opacity-75"></div>
          <div className="relative bg-gradient-to-r from-primary-500 to-indigo-500 p-2 rounded-xl">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <span className="text-xl font-bold text-white">
            ExpenseTracker
          </span>
          <div className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-yellow-400" />
            <span className="text-xs text-gray-300 font-medium">Pro</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span>{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Hi, {user?.name}
            </p>
            <p className="text-xs text-gray-300 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full mt-3 flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-red-500/20 transition-all duration-200 group"
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-hidden">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                ExpenseTracker
              </span>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Background decoration - Fixed */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Layout;