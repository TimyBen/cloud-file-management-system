import React, { useState } from 'react';
import { 
  Users,
  MessageSquare,
  Clock,
  User,
  Send,
  MoreVertical,
  FileText,
  Sparkles,
  Circle
} from 'lucide-react';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
  resolved?: boolean;
}

interface Version {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

const mockComments: Comment[] = [
  { id: '1', user: 'John Doe', avatar: 'JD', message: 'Can we update the revenue numbers?', timestamp: '2 hours ago' },
  { id: '2', user: 'Jane Smith', avatar: 'JS', message: 'I\'ve added the Q4 projections', timestamp: '1 hour ago' },
  { id: '3', user: 'You', avatar: 'YO', message: 'Looks good, approved!', timestamp: '30 minutes ago', resolved: true },
];

const mockVersions: Version[] = [
  { id: '1', user: 'You', action: 'Updated financial data', timestamp: '1 hour ago' },
  { id: '2', user: 'John Doe', action: 'Added charts', timestamp: '3 hours ago' },
  { id: '3', user: 'Jane Smith', action: 'Initial upload', timestamp: '1 day ago' },
];

const activeUsers = [
  { name: 'John Doe', avatar: 'JD', color: 'from-[#2563EB] to-[#1E40AF]', online: true },
  { name: 'Jane Smith', avatar: 'JS', color: 'from-[#10B981] to-[#059669]', online: true },
  { name: 'Mike Johnson', avatar: 'MJ', color: 'from-[#F59E0B] to-[#D97706]', online: false },
];

export const CollaborationPage: React.FC = () => {
  const [newComment, setNewComment] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    // Add comment logic
    setNewComment('');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // Add message logic
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Left side - Document Editor */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="p-4 md:p-6 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-[var(--text-primary)] truncate">Project Collaboration Document</h2>
              <p className="text-sm text-[var(--text-tertiary)]">Last edited 1 hour ago</p>
            </div>
            
            {/* Active Users */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {activeUsers.map((user, index) => (
                  <div key={index} className="relative">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center border-2 border-[var(--surface)] text-white text-xs`}>
                      {user.avatar}
                    </div>
                    {user.online && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-[var(--surface)] rounded-full" />
                    )}
                  </div>
                ))}
              </div>
              <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                <Users className="w-5 h-5 text-[var(--text-tertiary)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 bg-[var(--background)] overflow-auto">
          <div className="max-w-4xl mx-auto bg-[var(--surface)] rounded-xl p-8 md:p-12" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-[var(--text-primary)] mb-2">Q4 Project Review</h1>
                <p className="text-[var(--text-secondary)]">Team Collaboration Document</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-[var(--text-primary)]">Project Overview</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  This document serves as a collaborative space for the team to review and discuss 
                  the Q4 project outcomes. All team members can edit, comment, and contribute to 
                  this shared document in real-time.
                </p>
                
                {/* Inline Comment Indicator */}
                <div className="relative">
                  <p className="text-[var(--text-secondary)] leading-relaxed bg-[#FEF3C7] dark:bg-[#F59E0B]/10 p-3 rounded-lg border-l-4 border-[#F59E0B]">
                    The team achieved a 24% increase in productivity this quarter, exceeding our 
                    initial targets by a significant margin.
                  </p>
                  <button className="absolute -right-2 top-2 w-6 h-6 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-xs">
                    2
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[var(--text-primary)]">Key Achievements</h3>
                <ul className="space-y-2 text-[var(--text-secondary)]">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Successfully delivered all major milestones on schedule</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Improved team collaboration efficiency by 35%</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Implemented AI-powered workflow automation</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[var(--background)] border-l-4 border-[#2563EB]">
                <div className="flex items-start gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-[#2563EB] mt-0.5" />
                  <div>
                    <p className="text-sm text-[var(--text-primary)] mb-1">AI Suggestion</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Consider adding specific metrics and data points to support these achievements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-[var(--border)] bg-[var(--surface)] flex flex-col">
        {/* Tabs */}
        <div className="border-b border-[var(--border)] p-2 flex gap-1">
          <button className="flex-1 py-2 px-3 rounded-lg bg-[#2563EB] text-white text-sm transition-colors">
            Comments
          </button>
          <button className="flex-1 py-2 px-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--background)] text-sm transition-colors">
            Chat
          </button>
          <button className="flex-1 py-2 px-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--background)] text-sm transition-colors">
            History
          </button>
        </div>

        {/* Comments Section */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockComments.map((comment) => (
            <div key={comment.id} className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center text-white text-xs">
                    {comment.avatar}
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{comment.user}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{comment.timestamp}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-[var(--surface)] rounded">
                  <MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                </button>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-2">{comment.message}</p>
              {comment.resolved && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#F0FDF4] dark:bg-[#10B981]/20 text-[#10B981]">
                  ✓ Resolved
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
            />
            <button
              onClick={handleSendComment}
              className="px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Invite Collaborator Modal (floating action button on mobile) */}
      <button className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white flex items-center justify-center z-40" style={{ boxShadow: 'var(--shadow-xl)' }}>
        <Users className="w-6 h-6" />
      </button>
    </div>
  );
};
