import React from 'react';
import { 
  HardDrive, 
  FileText, 
  Share2, 
  Activity,
  Upload,
  FolderPlus,
  Users,
  Sparkles,
  TrendingUp,
  Clock,
  MoreVertical
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const storageData = [
  { name: 'Documents', value: 3000, color: '#2563EB' },
  { name: 'Images', value: 2000, color: '#3B82F6' },
  { name: 'Videos', value: 1500, color: '#60A5FA' },
  { name: 'Other', value: 1000, color: '#93C5FD' },
];

const activityData = [
  { day: 'Mon', uploads: 12 },
  { day: 'Tue', uploads: 19 },
  { day: 'Wed', uploads: 8 },
  { day: 'Thu', uploads: 15 },
  { day: 'Fri', uploads: 22 },
  { day: 'Sat', uploads: 9 },
  { day: 'Sun', uploads: 6 },
];

const recentFiles = [
  { name: 'Project Proposal.pdf', size: '2.4 MB', modified: '2 hours ago', type: 'pdf' },
  { name: 'Design Mockups.fig', size: '8.1 MB', modified: '5 hours ago', type: 'design' },
  { name: 'Financial Report Q4.xlsx', size: '1.2 MB', modified: '1 day ago', type: 'spreadsheet' },
  { name: 'Presentation.pptx', size: '5.6 MB', modified: '2 days ago', type: 'presentation' },
];

const recentActivity = [
  { action: 'Uploaded', file: 'Project Proposal.pdf', time: '2 hours ago', icon: Upload },
  { action: 'Shared', file: 'Design Mockups.fig', time: '3 hours ago', icon: Share2 },
  { action: 'AI Analyzed', file: 'Financial Report Q4.xlsx', time: '5 hours ago', icon: Sparkles },
  { action: 'Created folder', file: 'Q4 Documents', time: '1 day ago', icon: FolderPlus },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[var(--text-primary)] mb-1">Dashboard</h1>
          <p className="text-[var(--text-secondary)]">Welcome back! Here's your storage overview</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors flex items-center gap-2">
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white hover:opacity-90 transition-opacity flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload File</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Storage */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-[#1E40AF]/20 flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-[#2563EB]" />
            </div>
            <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-sm mb-1">Storage Used</p>
            <p className="text-2xl text-[var(--text-primary)]">7.5 GB</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">of 10 GB</p>
          </div>
        </div>

        {/* Total Files */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] dark:bg-[#10B981]/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#10B981]" />
            </div>
            <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +8%
            </span>
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-sm mb-1">Total Files</p>
            <p className="text-2xl text-[var(--text-primary)]">1,248</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Across all folders</p>
          </div>
        </div>

        {/* Shared Items */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] dark:bg-[#F59E0B]/20 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +15%
            </span>
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-sm mb-1">Shared Items</p>
            <p className="text-2xl text-[var(--text-primary)]">84</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">With 12 people</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#FCE7F3] dark:bg-[#EC4899]/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#EC4899]" />
            </div>
            <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +24%
            </span>
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-sm mb-1">Activity Today</p>
            <p className="text-2xl text-[var(--text-primary)]">47</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Actions performed</p>
          </div>
        </div>
      </div>

      {/* Charts and Recent Files Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Usage Chart */}
        <div className="lg:col-span-1 p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-[var(--text-primary)] mb-6">Storage Usage</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {storageData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[var(--text-secondary)]">{item.name}</span>
                </div>
                <span className="text-[var(--text-primary)]">{(item.value / 1000).toFixed(1)} GB</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="text-[var(--text-primary)] mb-6">Weekly Activity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <XAxis 
                  dataKey="day" 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--text-tertiary)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="uploads" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Files and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Files */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[var(--text-primary)]">Recent Files</h3>
            <button className="text-sm text-[#2563EB] hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {recentFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--background)] transition-colors group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] dark:bg-[#1E40AF]/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{file.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{file.size} • {file.modified}</p>
                  </div>
                </div>
                <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[var(--text-primary)]">Recent Activity</h3>
            <button className="text-sm text-[#2563EB] hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] dark:bg-[#1E40AF]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#2563EB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">
                      <span className="font-medium">{activity.action}</span> {activity.file}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF]" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-white">
            <h3 className="text-white mb-2">Try AI-Powered Analysis</h3>
            <p className="text-white/80">Extract insights, summarize documents, and chat with your files using AI</p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-white text-[#2563EB] hover:bg-white/90 transition-colors flex items-center gap-2 justify-center md:justify-start">
            <Sparkles className="w-5 h-5" />
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
