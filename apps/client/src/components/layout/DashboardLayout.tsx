import React, { useState } from 'react';
import { 
  Plus, Search, Settings, CreditCard, Users, BarChart3, 
  FolderHeart, Sparkles, BookOpen, Layers, LogOut, Sun, Moon, Bell, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
  onSearchClick: () => void;
  model: string;
  setModel: (model: string) => void;
  credits: number;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeView,
  setActiveView,
  onSearchClick,
  model,
  setModel,
  credits
}) => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeLibTab, setActiveLibTab] = useState<'mine' | 'shared'>('mine');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const menuItems = [
    { id: 'repurpose', label: 'Repurpose AI', icon: Sparkles },
    { id: 'library', label: 'Content Library', icon: BookOpen },
    { id: 'brandkit', label: 'Brand Kit', icon: FolderHeart },
    { id: 'workflows', label: 'AI Workflows', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team Space', icon: Users },
    { id: 'settings', label: 'Billing & Settings', icon: Settings }
  ];

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-[#09090b] text-gray-100' : 'bg-[#f4f4f5] text-gray-800'}`}>
      
      {/* Sidebar - Modeled directly on Google Stitch */}
      <aside className="w-80 p-4 flex flex-col border-r border-gray-200 dark:border-gray-800 select-none">
        
        {/* Logo and Brand Title */}
        <div className="flex items-center space-x-2.5 px-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">ContentKit</h1>
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">AI PRO</span>
          </div>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-100 dark:border-indigo-900/30">
            BETA
          </span>
        </div>

        {/* Tab Selection: My Projects vs Shared with me */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-200/60 dark:bg-zinc-800/60 rounded-xl mb-4 text-xs font-semibold">
          <button
            onClick={() => { setActiveLibTab('mine'); setActiveView('library'); }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeLibTab === 'mine' && activeView === 'library'
                ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <span>My Projects</span>
          </button>
          <button
            onClick={() => { setActiveLibTab('shared'); setActiveView('library'); }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeLibTab === 'shared' && activeView === 'library'
                ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <span>Shared with me</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative mb-5" onClick={onSearchClick}>
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects... (Ctrl+K)"
            disabled
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-200/50 dark:bg-zinc-800/40 border-0 rounded-xl cursor-pointer text-left focus:outline-none hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors"
          />
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          <div className="px-2 mb-2 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            Navigation
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-200/50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Credits & Profile Panel */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
          {/* Credit balance display */}
          <div className="mb-4 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/40 rounded-2xl">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Credits remaining</span>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{credits.toLocaleString()}</span>
            </div>
            <div className="w-full bg-indigo-100 dark:bg-indigo-950/60 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((credits / 20000) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-sm flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="truncate w-36">
                <p className="text-sm font-bold truncate leading-snug">{user?.name || 'User'}</p>
                <p className="text-[11px] text-gray-500 truncate leading-none">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>
              <button 
                onClick={() => logout()}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-600 dark:text-zinc-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/50 dark:bg-[#09090b]/50 backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              AI MODEL ROUTER
            </span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-gray-100 dark:bg-zinc-800 border-0 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
              <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
              <option value="GPT-4o (OpenAI)">GPT-4o (OpenAI)</option>
              <option value="Llama 3.1 (Groq)">Llama 3.1 (Groq)</option>
              <option value="Mistral Large">Mistral Large</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
            </button>
            <button className="p-2 text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors">
              <HelpCircle className="h-4.5 w-4.5" />
            </button>
          </div>
        </header>

        {/* Dynamic content rendering inside a container */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
