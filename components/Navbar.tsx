import React from 'react';
import { Menu, Sun, Moon, LogOut, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header 
      className="sticky top-0 z-30 h-16 bg-[var(--surface)] border-b border-[var(--border)]"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center lg:hidden">
              <span className="text-white">☁️</span>
            </div>
            <h1 className="font-semibold text-[var(--text-primary)] hidden sm:block">
              CloudStore AI
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-[var(--text-secondary)]" />
            ) : (
              <Sun className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
          </button>

          {/* User Menu */}
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background)]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-[var(--text-primary)]">{user.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
