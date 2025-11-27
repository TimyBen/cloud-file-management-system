import React, { useState } from 'react';
import { 
  Activity,
  Upload,
  Download,
  Share2,
  Trash2,
  Edit,
  FolderPlus,
  Sparkles,
  User,
  Clock,
  Filter,
  Calendar
} from 'lucide-react';

interface LogEntry {
  id: string;
  action: string;
  file: string;
  user: string;
  timestamp: string;
  type: 'upload' | 'download' | 'share' | 'delete' | 'edit' | 'folder' | 'ai';
}

const mockLogs: LogEntry[] = [
  { id: '1', action: 'Uploaded', file: 'Q4 Report.pdf', user: 'You', timestamp: '2 hours ago', type: 'upload' },
  { id: '2', action: 'Shared', file: 'Design Mockups.fig', user: 'You', timestamp: '3 hours ago', type: 'share' },
  { id: '3', action: 'Downloaded', file: 'Budget 2024.xlsx', user: 'John Doe', timestamp: '5 hours ago', type: 'download' },
  { id: '4', action: 'AI Analyzed', file: 'Financial Report.pdf', user: 'You', timestamp: '5 hours ago', type: 'ai' },
  { id: '5', action: 'Edited', file: 'Meeting Notes.docx', user: 'Jane Smith', timestamp: '1 day ago', type: 'edit' },
  { id: '6', action: 'Created folder', file: 'Q4 Documents', user: 'You', timestamp: '1 day ago', type: 'folder' },
  { id: '7', action: 'Deleted', file: 'Old Presentation.pptx', user: 'You', timestamp: '2 days ago', type: 'delete' },
  { id: '8', action: 'Shared', file: 'Project Files', user: 'John Doe', timestamp: '2 days ago', type: 'share' },
  { id: '9', action: 'Uploaded', file: 'Screenshot 2024.png', user: 'Jane Smith', timestamp: '3 days ago', type: 'upload' },
  { id: '10', action: 'AI Analyzed', file: 'Contract.pdf', user: 'You', timestamp: '3 days ago', type: 'ai' },
];

const getActionIcon = (type: string) => {
  switch (type) {
    case 'upload':
      return <Upload className="w-4 h-4" />;
    case 'download':
      return <Download className="w-4 h-4" />;
    case 'share':
      return <Share2 className="w-4 h-4" />;
    case 'delete':
      return <Trash2 className="w-4 h-4" />;
    case 'edit':
      return <Edit className="w-4 h-4" />;
    case 'folder':
      return <FolderPlus className="w-4 h-4" />;
    case 'ai':
      return <Sparkles className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActionColor = (type: string) => {
  switch (type) {
    case 'upload':
      return 'bg-[#EFF6FF] dark:bg-[#1E40AF]/20 text-[#2563EB]';
    case 'download':
      return 'bg-[#F0FDF4] dark:bg-[#10B981]/20 text-[#10B981]';
    case 'share':
      return 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#F59E0B]';
    case 'delete':
      return 'bg-[#FEE2E2] dark:bg-[#EF4444]/20 text-[#EF4444]';
    case 'edit':
      return 'bg-[#EDE9FE] dark:bg-[#8B5CF6]/20 text-[#8B5CF6]';
    case 'folder':
      return 'bg-[#DBEAFE] dark:bg-[#3B82F6]/20 text-[#3B82F6]';
    case 'ai':
      return 'bg-[#FCE7F3] dark:bg-[#EC4899]/20 text-[#EC4899]';
    default:
      return 'bg-[var(--background)] text-[var(--text-primary)]';
  }
};

export const ActivityLogsPage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  const filteredLogs = mockLogs.filter(log => 
    filterType === 'all' ? true : log.type === filterType
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[var(--text-primary)] mb-1">Activity Logs</h1>
          <p className="text-[var(--text-secondary)]">Track all actions and changes in your workspace</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-2xl text-[var(--text-primary)] mb-1">47</p>
          <p className="text-sm text-[var(--text-secondary)]">Today</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-2xl text-[var(--text-primary)] mb-1">312</p>
          <p className="text-sm text-[var(--text-secondary)]">This Week</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-2xl text-[var(--text-primary)] mb-1">1.2K</p>
          <p className="text-sm text-[var(--text-secondary)]">This Month</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-2xl text-[var(--text-primary)] mb-1">8</p>
          <p className="text-sm text-[var(--text-secondary)]">Active Users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('upload')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'upload'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)]'
            }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setFilterType('share')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'share'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)]'
            }`}
          >
            Shares
          </button>
          <button
            onClick={() => setFilterType('ai')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'ai'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)]'
            }`}
          >
            AI Actions
          </button>
          <button
            onClick={() => setFilterType('delete')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'delete'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)]'
            }`}
          >
            Deletions
          </button>
        </div>
        
        <button className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors flex items-center gap-2 justify-center">
          <Calendar className="w-4 h-4" />
          <span>Date Range</span>
        </button>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-6">
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <div key={log.id} className="relative">
                {/* Timeline line */}
                {index !== filteredLogs.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-[var(--border)]" />
                )}
                
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getActionColor(log.type)}`}>
                    {getActionIcon(log.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                      <p className="text-sm text-[var(--text-primary)]">
                        <span className="font-medium">{log.user}</span> {log.action.toLowerCase()}{' '}
                        <span className="font-medium">{log.file}</span>
                      </p>
                      <div className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getActionColor(log.type)}`}>
                        {log.action}
                      </span>
                      {log.user !== 'You' && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-[var(--text-tertiary)]" />
                          <span className="text-xs text-[var(--text-tertiary)]">{log.user}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-6 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors">
          Load More
        </button>
      </div>
    </div>
  );
};
