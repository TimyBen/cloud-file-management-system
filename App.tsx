import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { Dashboard } from './components/pages/Dashboard';
import { FilesPage } from './components/pages/FilesPage';
import { FilePreviewPage } from './components/pages/FilePreviewPage';
import { AIAnalysisPage } from './components/pages/AIAnalysisPage';
import { SharePage } from './components/pages/SharePage';
import { ActivityLogsPage } from './components/pages/ActivityLogsPage';
import { CollaborationPage } from './components/pages/CollaborationPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { DesignSystemPage } from './components/pages/DesignSystemPage';

type Page = 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'files' 
  | 'file-preview'
  | 'ai-analysis'
  | 'share' 
  | 'logs' 
  | 'collaborate' 
  | 'settings'
  | 'design-system';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>(user ? 'dashboard' : 'login');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  // Auth pages
  if (!user) {
    if (currentPage === 'register') {
      return <RegisterPage onNavigateToLogin={() => setCurrentPage('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setCurrentPage('register')} />;
  }

  // Map page IDs to components
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'files':
        return <FilesPage />;
      case 'file-preview':
        return <FilePreviewPage onBack={() => setCurrentPage('files')} />;
      case 'ai-analysis':
        return <AIAnalysisPage onBack={() => setCurrentPage('files')} />;
      case 'share':
        return <SharePage />;
      case 'logs':
        return <ActivityLogsPage />;
      case 'collaborate':
        return <CollaborationPage />;
      case 'settings':
        return <SettingsPage />;
      case 'design-system':
        return <DesignSystemPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar 
        activePage={currentPage}
        onNavigate={(page) => handleNavigate(page as Page)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>

        {/* Design System Toggle - Hidden in production */}
        <button
          onClick={() => setCurrentPage('design-system')}
          className="hidden lg:block fixed bottom-6 right-6 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors text-sm z-50"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          View Design System
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
