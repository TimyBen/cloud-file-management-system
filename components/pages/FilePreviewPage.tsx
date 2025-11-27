import React from 'react';
import { 
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  Edit,
  Sparkles,
  Star,
  MoreVertical,
  FileText,
  Calendar,
  HardDrive,
  User
} from 'lucide-react';

export const FilePreviewPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Left side - Preview */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-[var(--text-primary)] truncate">Q4 Financial Report.pdf</h2>
                <p className="text-sm text-[var(--text-tertiary)]">2.4 MB • Modified 2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                <Star className="w-5 h-5 text-[var(--text-tertiary)]" />
              </button>
              <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors hidden sm:block">
                <MoreVertical className="w-5 h-5 text-[var(--text-tertiary)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-4 md:p-6 bg-[var(--background)] overflow-auto">
          <div className="max-w-4xl mx-auto bg-[var(--surface)] rounded-xl p-8 md:p-12" style={{ boxShadow: 'var(--shadow-lg)' }}>
            {/* Simulated PDF Preview */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-[var(--text-primary)] mb-2">Q4 Financial Report</h1>
                <p className="text-[var(--text-secondary)]">Fiscal Year 2024</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-[var(--text-primary)]">Executive Summary</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                  fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                  culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[var(--text-primary)]">Financial Highlights</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[var(--background)]">
                    <p className="text-sm text-[var(--text-tertiary)] mb-1">Revenue</p>
                    <p className="text-xl text-[var(--text-primary)]">$2.4M</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--background)]">
                    <p className="text-sm text-[var(--text-tertiary)] mb-1">Growth</p>
                    <p className="text-xl text-[var(--text-primary)]">+24%</p>
                  </div>
                </div>
              </div>

              <div className="h-48 bg-[var(--background)] rounded-lg flex items-center justify-center">
                <FileText className="w-16 h-16 text-[var(--text-tertiary)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Metadata & Actions */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[var(--border)] bg-[var(--surface)] p-6 space-y-6 overflow-y-auto">
        {/* Actions */}
        <div className="space-y-2">
          <h3 className="text-[var(--text-primary)] mb-3">Actions</h3>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white hover:opacity-90 transition-opacity">
            <Sparkles className="w-5 h-5" />
            <span>AI Analyze</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors">
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors">
            <Edit className="w-5 h-5" />
            <span>Rename</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--background)] text-[#EF4444] hover:bg-[var(--border)] transition-colors">
            <Trash2 className="w-5 h-5" />
            <span>Delete</span>
          </button>
        </div>

        {/* File Info */}
        <div className="pt-6 border-t border-[var(--border)] space-y-4">
          <h3 className="text-[var(--text-primary)] mb-3">File Information</h3>
          
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-[var(--text-tertiary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Type</p>
              <p className="text-sm text-[var(--text-primary)]">PDF Document</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <HardDrive className="w-5 h-5 text-[var(--text-tertiary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Size</p>
              <p className="text-sm text-[var(--text-primary)]">2.4 MB</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[var(--text-tertiary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Modified</p>
              <p className="text-sm text-[var(--text-primary)]">Nov 14, 2024 at 2:30 PM</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-[var(--text-tertiary)] mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Owner</p>
              <p className="text-sm text-[var(--text-primary)]">You</p>
            </div>
          </div>
        </div>

        {/* Shared With */}
        <div className="pt-6 border-t border-[var(--border)] space-y-3">
          <h3 className="text-[var(--text-primary)] mb-3">Shared With</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--text-primary)]">John Doe</p>
              <p className="text-xs text-[var(--text-tertiary)]">Can edit</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--text-primary)]">Jane Smith</p>
              <p className="text-xs text-[var(--text-tertiary)]">Can view</p>
            </div>
          </div>
          <button className="w-full py-2 rounded-lg text-sm text-[#2563EB] hover:bg-[var(--background)] transition-colors">
            + Add people
          </button>
        </div>

        {/* Activity */}
        <div className="pt-6 border-t border-[var(--border)] space-y-3">
          <h3 className="text-[var(--text-primary)] mb-3">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-[var(--text-primary)]">You uploaded this file</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">2 hours ago</p>
            </div>
            <div className="text-sm">
              <p className="text-[var(--text-primary)]">Shared with John Doe</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">3 hours ago</p>
            </div>
            <div className="text-sm">
              <p className="text-[var(--text-primary)]">AI Analysis completed</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
