import React from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Share2, 
  Activity, 
  Users, 
  Settings,
  X 
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'files', label: 'Files', icon: FolderOpen },
  { id: 'share', label: 'Share', icon: Share2 },
  { id: 'logs', label: 'Logs', icon: Activity },
  { id: 'collaborate', label: 'Collaborate', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-64 bg-[var(--surface)] border-r border-[var(--border)]
          z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: 'var(--shadow-sm)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center">
                <span className="text-white">☁️</span>
              </div>
              <span className="font-semibold text-[var(--text-primary)]">CloudStore AI</span>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-[var(--background)] rounded-lg"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-[#EFF6FF] dark:bg-[#1E40AF]/20 text-[#2563EB]' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)]'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Storage Info */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="p-3 rounded-lg bg-[var(--background)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-secondary)]">Storage</span>
                <span className="text-sm text-[var(--text-primary)]">75%</span>
              </div>
              <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-full" />
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">
                7.5 GB of 10 GB used
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
