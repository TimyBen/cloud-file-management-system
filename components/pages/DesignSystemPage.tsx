import React from 'react';
import { 
  Download, 
  Upload, 
  Share2, 
  Sparkles, 
  Check, 
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-[var(--text-primary)] mb-2">Design System</h1>
        <p className="text-[var(--text-secondary)]">CloudStore AI Component Library & Style Guide</p>
      </div>

      {/* Colors */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl bg-[#2563EB]" />
            <p className="text-sm text-[var(--text-primary)]">Primary</p>
            <p className="text-xs text-[var(--text-tertiary)]">#2563EB</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl bg-[#1E40AF]" />
            <p className="text-sm text-[var(--text-primary)]">Primary Dark</p>
            <p className="text-xs text-[var(--text-tertiary)]">#1E40AF</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl bg-[#10B981]" />
            <p className="text-sm text-[var(--text-primary)]">Success</p>
            <p className="text-xs text-[var(--text-tertiary)]">#10B981</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl bg-[#EF4444]" />
            <p className="text-sm text-[var(--text-primary)]">Error</p>
            <p className="text-xs text-[var(--text-tertiary)]">#EF4444</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl bg-[#F59E0B]" />
            <p className="text-sm text-[var(--text-primary)]">Warning</p>
            <p className="text-xs text-[var(--text-tertiary)]">#F59E0B</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl bg-[var(--background)] border border-[var(--border)]" />
            <p className="text-sm text-[var(--text-primary)]">Background</p>
            <p className="text-xs text-[var(--text-tertiary)]">CSS Variable</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl bg-[var(--surface)] border border-[var(--border)]" />
            <p className="text-sm text-[var(--text-primary)]">Surface</p>
            <p className="text-xs text-[var(--text-tertiary)]">CSS Variable</p>
          </div>
          <div className="space-y-2">
            <div className="w-full h-24 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF]" />
            <p className="text-sm text-[var(--text-primary)]">Gradient</p>
            <p className="text-xs text-[var(--text-tertiary)]">Primary</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Typography</h2>
        <div className="space-y-4 p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <h1 className="text-[var(--text-primary)]">Heading 1</h1>
          <h2 className="text-[var(--text-primary)]">Heading 2</h2>
          <h3 className="text-[var(--text-primary)]">Heading 3</h3>
          <h4 className="text-[var(--text-primary)]">Heading 4</h4>
          <h5 className="text-[var(--text-primary)]">Heading 5</h5>
          <h6 className="text-[var(--text-primary)]">Heading 6</h6>
          <p className="text-[var(--text-primary)]">Body text - Regular paragraph with normal weight</p>
          <p className="text-[var(--text-secondary)]">Secondary text - Used for less important information</p>
          <p className="text-[var(--text-tertiary)]">Tertiary text - Used for hints and metadata</p>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white hover:opacity-90 transition-opacity flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Primary Button
          </button>
          <button className="px-6 py-3 rounded-xl bg-[#2563EB] text-white hover:opacity-90 transition-opacity">
            Primary Solid
          </button>
          <button className="px-6 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors">
            Secondary
          </button>
          <button className="px-6 py-3 rounded-xl border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] dark:hover:bg-[#1E40AF]/20 transition-colors">
            Outline
          </button>
          <button className="px-6 py-3 rounded-xl text-[#2563EB] hover:bg-[#EFF6FF] dark:hover:bg-[#1E40AF]/20 transition-colors">
            Ghost
          </button>
          <button className="px-6 py-3 rounded-xl bg-[#EF4444] text-white hover:opacity-90 transition-opacity">
            Danger
          </button>
          <button className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Form Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">Text Input</label>
            <input
              type="text"
              placeholder="Enter text..."
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-primary)] mb-2">Email Input</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-[var(--text-primary)] mb-2">Textarea</label>
            <textarea
              placeholder="Enter longer text..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
              />
              <span className="text-sm text-[var(--text-primary)]">Checkbox</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="radio"
                className="w-4 h-4 border-[var(--border)] text-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
              />
              <span className="text-sm text-[var(--text-primary)]">Radio Button</span>
            </label>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-[#1E40AF]/20 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h4 className="text-[var(--text-primary)] mb-2">Card Title</h4>
            <p className="text-sm text-[var(--text-secondary)]">Card description with some example text content.</p>
          </div>
          <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-md)' }}>
            <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] dark:bg-[#10B981]/20 flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-[#10B981]" />
            </div>
            <h4 className="text-[var(--text-primary)] mb-2">Elevated Card</h4>
            <p className="text-sm text-[var(--text-secondary)]">Card with medium shadow elevation.</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1E40AF]" style={{ boxShadow: 'var(--shadow-lg)' }}>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-white mb-2">Gradient Card</h4>
            <p className="text-sm text-white/80">Card with gradient background.</p>
          </div>
        </div>
      </section>

      {/* Badges & Tags */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Badges & Tags</h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 rounded-lg bg-[#EFF6FF] dark:bg-[#1E40AF]/20 text-[#2563EB] text-sm">
            Primary
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#F0FDF4] dark:bg-[#10B981]/20 text-[#10B981] text-sm">
            Success
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#F59E0B] text-sm">
            Warning
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#FEE2E2] dark:bg-[#EF4444]/20 text-[#EF4444] text-sm">
            Error
          </span>
          <span className="px-3 py-1 rounded-full bg-[#EFF6FF] dark:bg-[#1E40AF]/20 text-[#2563EB] text-sm">
            Pill Badge
          </span>
        </div>
      </section>

      {/* Alerts */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Alerts</h2>
        <div className="space-y-3 max-w-2xl">
          <div className="p-4 rounded-xl bg-[#EFF6FF] dark:bg-[#1E40AF]/20 border-l-4 border-[#2563EB] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
            <div>
              <p className="text-sm text-[var(--text-primary)] mb-1">Info Alert</p>
              <p className="text-sm text-[var(--text-secondary)]">This is an informational message.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#F0FDF4] dark:bg-[#10B981]/20 border-l-4 border-[#10B981] flex items-start gap-3">
            <Check className="w-5 h-5 text-[#10B981] flex-shrink-0" />
            <div>
              <p className="text-sm text-[var(--text-primary)] mb-1">Success Alert</p>
              <p className="text-sm text-[var(--text-secondary)]">Your action was completed successfully.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#FEF3C7] dark:bg-[#F59E0B]/20 border-l-4 border-[#F59E0B] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
            <div>
              <p className="text-sm text-[var(--text-primary)] mb-1">Warning Alert</p>
              <p className="text-sm text-[var(--text-secondary)]">Please be careful with this action.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#FEE2E2] dark:bg-[#EF4444]/20 border-l-4 border-[#EF4444] flex items-start gap-3">
            <X className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
            <div>
              <p className="text-sm text-[var(--text-primary)] mb-1">Error Alert</p>
              <p className="text-sm text-[var(--text-secondary)]">An error occurred. Please try again.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Spacing Scale</h2>
        <div className="space-y-2">
          {[4, 8, 12, 16, 24, 32, 48, 64].map((size) => (
            <div key={size} className="flex items-center gap-4">
              <div className="w-20 text-sm text-[var(--text-tertiary)]">{size}px</div>
              <div className="h-8 rounded bg-[#2563EB]" style={{ width: `${size}px` }} />
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Border Radius</h2>
        <div className="flex flex-wrap gap-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-[#2563EB] rounded-lg mb-2" />
            <p className="text-sm text-[var(--text-tertiary)]">8px (lg)</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-[#2563EB] rounded-xl mb-2" />
            <p className="text-sm text-[var(--text-tertiary)]">12px (xl)</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-[#2563EB] rounded-2xl mb-2" />
            <p className="text-sm text-[var(--text-tertiary)]">16px (2xl)</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-[#2563EB] rounded-full mb-2" />
            <p className="text-sm text-[var(--text-tertiary)]">full</p>
          </div>
        </div>
      </section>

      {/* Shadows */}
      <section className="space-y-4">
        <h2 className="text-[var(--text-primary)]">Shadows</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['sm', 'md', 'lg', 'xl'].map((size) => (
            <div key={size} className="text-center">
              <div 
                className="w-full h-24 bg-[var(--surface)] rounded-xl mb-2"
                style={{ boxShadow: `var(--shadow-${size})` }}
              />
              <p className="text-sm text-[var(--text-tertiary)]">Shadow {size}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
