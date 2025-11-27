import React, { useState } from 'react';
import { 
  Share2, 
  Link as LinkIcon, 
  Mail,
  Globe,
  Lock,
  Users,
  Eye,
  Edit,
  MessageSquare,
  X,
  Copy,
  Check,
  MoreVertical,
  FileText
} from 'lucide-react';

interface SharedItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  sharedWith: number;
  permission: 'view' | 'edit' | 'comment';
  lastAccessed: string;
}

const sharedItems: SharedItem[] = [
  { id: '1', name: 'Q4 Report.pdf', type: 'file', sharedWith: 5, permission: 'view', lastAccessed: '2 hours ago' },
  { id: '2', name: 'Design Assets', type: 'folder', sharedWith: 12, permission: 'edit', lastAccessed: '1 day ago' },
  { id: '3', name: 'Meeting Notes.docx', type: 'file', sharedWith: 3, permission: 'comment', lastAccessed: '3 days ago' },
  { id: '4', name: 'Project Files', type: 'folder', sharedWith: 8, permission: 'edit', lastAccessed: '1 week ago' },
];

export const SharePage: React.FC = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [publicLink, setPublicLink] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<'view' | 'edit' | 'comment'>('view');

  const copyLink = () => {
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[var(--text-primary)] mb-1">Shared Files</h1>
          <p className="text-[var(--text-secondary)]">Manage files and folders you've shared</p>
        </div>
        <button 
          onClick={() => setShowShareModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white hover:opacity-90 transition-opacity flex items-center gap-2 justify-center sm:justify-start"
        >
          <Share2 className="w-4 h-4" />
          Share New
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] dark:bg-[#1E40AF]/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-2xl text-[var(--text-primary)]">24</p>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Shared Files</p>
        </div>

        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] dark:bg-[#10B981]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <p className="text-2xl text-[var(--text-primary)]">18</p>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Collaborators</p>
        </div>

        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] dark:bg-[#F59E0B]/20 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-2xl text-[var(--text-primary)]">12</p>
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Public Links</p>
        </div>
      </div>

      {/* Shared Items List */}
      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-[var(--text-primary)]">Shared Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--background)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-[var(--text-secondary)]">Name</th>
                <th className="text-left px-6 py-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">Shared With</th>
                <th className="text-left px-6 py-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">Permission</th>
                <th className="text-left px-6 py-3 text-sm text-[var(--text-secondary)] hidden xl:table-cell">Last Accessed</th>
                <th className="text-right px-6 py-3 text-sm text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sharedItems.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--background)]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.type === 'folder' ? (
                        <div className="w-10 h-10 rounded-lg bg-[#FEF3C7] dark:bg-[#F59E0B]/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#F59E0B]" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] dark:bg-[#1E40AF]/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-[#2563EB]" />
                        </div>
                      )}
                      <span className="text-sm text-[var(--text-primary)]">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{item.sharedWith} people</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ${
                      item.permission === 'edit' 
                        ? 'bg-[#EFF6FF] dark:bg-[#1E40AF]/20 text-[#2563EB]'
                        : item.permission === 'comment'
                        ? 'bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#F59E0B]'
                        : 'bg-[#F0FDF4] dark:bg-[#10B981]/20 text-[#10B981]'
                    }`}>
                      {item.permission === 'edit' && <Edit className="w-3 h-3" />}
                      {item.permission === 'comment' && <MessageSquare className="w-3 h-3" />}
                      {item.permission === 'view' && <Eye className="w-3 h-3" />}
                      {item.permission.charAt(0).toUpperCase() + item.permission.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)] hidden xl:table-cell">
                    {item.lastAccessed}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                        <Share2 className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </button>
                      <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-2xl w-full max-w-lg" style={{ boxShadow: 'var(--shadow-xl)' }}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h3 className="text-[var(--text-primary)]">Share "Q4 Report.pdf"</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-[var(--background)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-tertiary)]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Add People */}
              <div>
                <label className="block text-sm text-[var(--text-primary)] mb-2">Add people</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                    <input
                      type="email"
                      placeholder="Enter email address"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    />
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-[#2563EB] text-white hover:opacity-90 transition-opacity">
                    Add
                  </button>
                </div>
              </div>

              {/* Permission Selector */}
              <div>
                <label className="block text-sm text-[var(--text-primary)] mb-2">Permission level</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedPermission('view')}
                    className={`p-3 rounded-xl border transition-all ${
                      selectedPermission === 'view'
                        ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-[#1E40AF]/20'
                        : 'border-[var(--border)] bg-[var(--background)]'
                    }`}
                  >
                    <Eye className={`w-5 h-5 mx-auto mb-1 ${
                      selectedPermission === 'view' ? 'text-[#2563EB]' : 'text-[var(--text-tertiary)]'
                    }`} />
                    <p className={`text-sm ${
                      selectedPermission === 'view' ? 'text-[#2563EB]' : 'text-[var(--text-secondary)]'
                    }`}>View</p>
                  </button>
                  <button
                    onClick={() => setSelectedPermission('comment')}
                    className={`p-3 rounded-xl border transition-all ${
                      selectedPermission === 'comment'
                        ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-[#1E40AF]/20'
                        : 'border-[var(--border)] bg-[var(--background)]'
                    }`}
                  >
                    <MessageSquare className={`w-5 h-5 mx-auto mb-1 ${
                      selectedPermission === 'comment' ? 'text-[#2563EB]' : 'text-[var(--text-tertiary)]'
                    }`} />
                    <p className={`text-sm ${
                      selectedPermission === 'comment' ? 'text-[#2563EB]' : 'text-[var(--text-secondary)]'
                    }`}>Comment</p>
                  </button>
                  <button
                    onClick={() => setSelectedPermission('edit')}
                    className={`p-3 rounded-xl border transition-all ${
                      selectedPermission === 'edit'
                        ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-[#1E40AF]/20'
                        : 'border-[var(--border)] bg-[var(--background)]'
                    }`}
                  >
                    <Edit className={`w-5 h-5 mx-auto mb-1 ${
                      selectedPermission === 'edit' ? 'text-[#2563EB]' : 'text-[var(--text-tertiary)]'
                    }`} />
                    <p className={`text-sm ${
                      selectedPermission === 'edit' ? 'text-[#2563EB]' : 'text-[var(--text-secondary)]'
                    }`}>Edit</p>
                  </button>
                </div>
              </div>

              {/* Public Link Toggle */}
              <div className="pt-6 border-t border-[var(--border)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[var(--text-secondary)]" />
                    <span className="text-sm text-[var(--text-primary)]">Public link</span>
                  </div>
                  <button
                    onClick={() => setPublicLink(!publicLink)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      publicLink ? 'bg-[#2563EB]' : 'bg-[var(--border)]'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      publicLink ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                
                {publicLink && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="https://cloudstore.ai/share/abc123"
                      readOnly
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--text-secondary)]"
                    />
                    <button 
                      onClick={copyLink}
                      className="px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
                    >
                      {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* People with Access */}
              <div className="pt-6 border-t border-[var(--border)]">
                <h4 className="text-sm text-[var(--text-primary)] mb-3">People with access</h4>
                <div className="space-y-2">
                  {['John Doe', 'Jane Smith'].map((name, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--background)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] flex items-center justify-center">
                          <span className="text-white text-xs">{name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm text-[var(--text-primary)]">{name}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">Can edit</p>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-[var(--background)] rounded transition-colors">
                        <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-2">
              <button 
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 rounded-xl bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white hover:opacity-90 transition-opacity">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
