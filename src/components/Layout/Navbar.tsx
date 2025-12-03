import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, LayoutDashboard, Shield, LogOut, Home, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar = ({ currentView, onNavigate }: NavbarProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EduTest Pro</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => handleNavigate('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                currentView === 'home'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              Home
            </button>

            <button
              onClick={() => handleNavigate('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNavigate('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5" />
                Admin
              </button>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>

              <button
                onClick={signOut}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>

              <button
                onClick={() => handleNavigate('home')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                  currentView === 'home'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5" />
                Home
              </button>

              <button
                onClick={() => handleNavigate('dashboard')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>

              {isAdmin && (
                <button
                  onClick={() => handleNavigate('admin')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                    currentView === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </button>
              )}

              <button
                onClick={signOut}
                className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition mt-2 border-t border-gray-200"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
