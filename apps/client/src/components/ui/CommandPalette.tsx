import React, { useEffect, useState, useRef } from 'react';
import { Search, Sparkles, BookOpen, FolderHeart, Layers, BarChart3, Settings, HelpCircle, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: string) => void;
  setModel: (model: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveView,
  setModel
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    { id: 'repurpose', label: 'Repurpose Content', category: 'Navigation', icon: Sparkles, action: () => setActiveView('repurpose') },
    { id: 'library', label: 'Go to Library', category: 'Navigation', icon: BookOpen, action: () => setActiveView('library') },
    { id: 'brandkit', label: 'Open Brand Kit', category: 'Navigation', icon: FolderHeart, action: () => setActiveView('brandkit') },
    { id: 'workflows', label: 'AI Workflows', category: 'Navigation', icon: Layers, action: () => setActiveView('workflows') },
    { id: 'analytics', label: 'View Analytics', category: 'Navigation', icon: BarChart3, action: () => setActiveView('analytics') },
    { id: 'settings', label: 'Billing & Settings', category: 'Navigation', icon: Settings, action: () => setActiveView('settings') },
    { id: 'gemini', label: 'Switch to Gemini 1.5 Pro', category: 'AI Models', icon: Sparkles, action: () => setModel('Gemini 1.5 Pro') },
    { id: 'claude', label: 'Switch to Claude 3.5 Sonnet', category: 'AI Models', icon: Sparkles, action: () => setModel('Claude 3.5 Sonnet') },
    { id: 'gpt4', label: 'Switch to GPT-4o (OpenAI)', category: 'AI Models', icon: Sparkles, action: () => setModel('GPT-4o (OpenAI)') }
  ];

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Spotlight Window */}
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[50vh] animate-fade-in">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-gray-200 dark:border-zinc-800">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
            className="flex-1 text-sm bg-transparent border-0 outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">
            <X className="h-4.5 w-4.5 text-gray-400" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">
              No results found for "{search}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => { item.action(); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400' 
                      : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4.5 w-4.5 text-gray-400" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded-md">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Helper Footer */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 text-[10px] text-gray-400 font-medium flex justify-between items-center select-none">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>ContentKit AI Command Suite</span>
        </div>

      </div>
    </div>
  );
};

export default CommandPalette;
