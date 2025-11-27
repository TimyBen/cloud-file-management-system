import React, { useState } from 'react';
import { 
  User,
  Lock,
  Bell,
  Palette,
  HardDrive,
  Shield,
  AlertTriangle,
  Mail,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [notifications, setNotifications] = useState({
    uploads: true,
    shares: true,
    comments: false,
    aiAnalysis: true,
    weekly: true,
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[var(--text-primary)] mb-1">Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-[var(--text-primary)]">Profile</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--surface)] border-2 border-[var(--surface)] flex items-center justify-center hover:bg-[var(--background)] transition-colors">
                <svg className="w-4 h-4 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          
          <button className="px-4 py-2 rounded-xl bg-[#2563EB] text-white hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-[var(--text-primary)]">Change Password</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
              >
                {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">Confirm New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          
          <button className="px-4 py-2 rounded-xl bg-[#2563EB] text-white hover:opacity-90 transition-opacity">
            Update Password
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-[var(--text-primary)]">Notifications</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries({
            uploads: 'File uploads',
            shares: 'Share notifications',
            comments: 'Comments and mentions',
            aiAnalysis: 'AI analysis results',
            weekly: 'Weekly summary email',
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm text-[var(--text-primary)]">{label}</label>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications] ? 'bg-[#2563EB]' : 'bg-[var(--border)]'
                }`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications[key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-[var(--text-primary)]">Appearance</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-primary)] mb-1">Theme</p>
              <p className="text-xs text-[var(--text-tertiary)]">Choose your interface theme</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`px-4 py-2 rounded-xl border transition-colors ${
                  theme === 'light'
                    ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-[#1E40AF]/20 text-[#2563EB]'
                    : 'border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)]'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`px-4 py-2 rounded-xl border transition-colors ${
                  theme === 'dark'
                    ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-[#1E40AF]/20 text-[#2563EB]'
                    : 'border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)]'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Plan */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-[var(--text-primary)]">Storage Plan</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-secondary)]">Current Plan: Free</span>
              <span className="text-sm text-[var(--text-primary)]">7.5 GB / 10 GB</span>
            </div>
            <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-full" />
            </div>
          </div>
          <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white hover:opacity-90 transition-opacity">
            Upgrade to Pro
          </button>
          <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-tertiary)]">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-[#10B981]" />
              <span>100 GB Storage</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-[#10B981]" />
              <span>Advanced AI</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-[#10B981]" />
              <span>Priority Support</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-[#10B981]" />
              <span>Team Features</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-[var(--text-primary)]">Security</h3>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background)] transition-colors">
            <span className="text-sm text-[var(--text-primary)]">Two-factor authentication</span>
            <span className="text-xs text-[var(--text-tertiary)]">Not enabled</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background)] transition-colors">
            <span className="text-sm text-[var(--text-primary)]">Active sessions</span>
            <span className="text-xs text-[var(--text-tertiary)]">2 devices</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background)] transition-colors">
            <span className="text-sm text-[var(--text-primary)]">Login history</span>
            <span className="text-xs text-[var(--text-tertiary)]">View</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl bg-[var(--surface)] border border-[#EF4444] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] dark:bg-[#EF4444]/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <h3 className="text-[#EF4444]">Danger Zone</h3>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-primary)] mb-1">Delete Account</p>
              <p className="text-xs text-[var(--text-tertiary)]">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-[#EF4444] text-white hover:opacity-90 transition-opacity">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
