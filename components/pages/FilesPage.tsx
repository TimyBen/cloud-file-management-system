import React, { useState } from 'react';
import { 
  Grid3x3, 
  List, 
  Upload, 
  FolderPlus, 
  Search,
  Filter,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Video,
  Folder,
  Download,
  Share2,
  Trash2,
  Edit,
  Sparkles,
  Star,
  Clock
} from 'lucide-react';

interface File {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'image' | 'video' | 'document';
  size?: string;
  modified: string;
  starred?: boolean;
}

const mockFiles: File[] = [
  { id: '1', name: 'Projects', type: 'folder', modified: '2 days ago' },
  { id: '2', name: 'Documents', type: 'folder', modified: '1 week ago' },
  { id: '3', name: 'Q4 Report.pdf', type: 'pdf', size: '2.4 MB', modified: '2 hours ago', starred: true },
  { id: '4', name: 'Design Mockups.png', type: 'image', size: '8.1 MB', modified: '5 hours ago' },
  { id: '5', name: 'Presentation.mp4', type: 'video', size: '45.2 MB', modified: '1 day ago' },
  { id: '6', name: 'Budget 2024.xlsx', type: 'document', size: '1.2 MB', modified: '3 days ago' },
  { id: '7', name: 'Meeting Notes.docx', type: 'document', size: '856 KB', modified: '4 days ago', starred: true },
  { id: '8', name: 'Website Screenshots', type: 'folder', modified: '1 week ago' },
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'folder':
      return <Folder className="w-5 h-5 text-[#F59E0B]" />;
    case 'pdf':
      return <FileText className="w-5 h-5 text-[#EF4444]" />;
    case 'image':
      return <ImageIcon className="w-5 h-5 text-[#10B981]" />;
    case 'video':
      return <Video className="w-5 h-5 text-[#8B5CF6]" />;
    default:
      return <FileText className="w-5 h-5 text-[#2563EB]" />;
  }
};

export const FilesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[var(--text-primary)] mb-1">Files</h1>
          <p className="text-[var(--text-secondary)]">Manage and organize your files</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors flex items-center gap-2">
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>

        {/* Filters and View Toggle */}
        <div className="flex gap-2">
          <button className="px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          
          <div className="flex rounded-xl bg-[var(--surface)] border border-[var(--border)] p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[#2563EB] text-white' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[#2563EB] text-white' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button className="text-[#2563EB] hover:underline">My Files</button>
        <span className="text-[var(--text-tertiary)]">/</span>
        <span className="text-[var(--text-secondary)]">All Files</span>
      </div>

      {/* Files Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockFiles.map((file) => (
            <div
              key={file.id}
              className="group p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[#2563EB] transition-all cursor-pointer"
              style={{ boxShadow: 'var(--shadow-sm)' }}
              onClick={() => setSelectedFile(file.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--background)] flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.starred && <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />}
                  <button className="p-1 hover:bg-[var(--background)] rounded">
                    <MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--text-primary)] truncate mb-1">{file.name}</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {file.size ? `${file.size} • ` : ''}{file.modified}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <table className="w-full">
            <thead className="bg-[var(--background)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-[var(--text-secondary)]">Name</th>
                <th className="text-left px-6 py-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">Size</th>
                <th className="text-left px-6 py-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">Modified</th>
                <th className="text-right px-6 py-3 text-sm text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockFiles.map((file) => (
                <tr 
                  key={file.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--background)] cursor-pointer"
                  onClick={() => setSelectedFile(file.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <span className="text-sm text-[var(--text-primary)]">{file.name}</span>
                      {file.starred && <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                    {file.size || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)] hidden lg:table-cell">
                    {file.modified}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors">
                        <Download className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </button>
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
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-lg" style={{ boxShadow: 'var(--shadow-xl)' }}>
            <h3 className="text-[var(--text-primary)] mb-4">Upload Files</h3>
            
            {/* Drag and Drop Area */}
            <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center mb-4 hover:border-[#2563EB] transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <p className="text-[var(--text-primary)] mb-2">Drag and drop files here</p>
              <p className="text-sm text-[var(--text-tertiary)] mb-4">or</p>
              <button className="px-4 py-2 rounded-xl bg-[#2563EB] text-white hover:opacity-90 transition-opacity">
                Browse Files
              </button>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Uploading file.pdf</span>
                <span className="text-[var(--text-primary)]">75%</span>
              </div>
              <div className="w-full h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-[#2563EB] to-[#1E40AF] rounded-full" />
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white hover:opacity-90 transition-opacity">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Action Menu */}
      {selectedFile && (
        <div className="fixed bottom-4 right-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2 z-40" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[var(--background)] text-[var(--text-primary)] w-full transition-colors">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[var(--background)] text-[var(--text-primary)] w-full transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[var(--background)] text-[var(--text-primary)] w-full transition-colors">
            <Edit className="w-4 h-4" />
            <span>Rename</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[var(--background)] text-[var(--text-primary)] w-full transition-colors">
            <Sparkles className="w-4 h-4" />
            <span>AI Analyze</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[var(--background)] text-[#EF4444] w-full transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
          <button 
            onClick={() => setSelectedFile(null)}
            className="w-full px-4 py-2 rounded-lg bg-[var(--background)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
