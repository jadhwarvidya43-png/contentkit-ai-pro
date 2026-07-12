import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Star, Pin, Archive, Trash2, Copy, 
  RotateCcw, Eye, Folder, Tag, Sparkles, FolderPlus, ArrowUpRight
} from 'lucide-react';
import api from '../../services/authService';

interface ContentLibraryProps {
  onSelectProject: (project: any) => void;
  credits: number;
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({
  onSelectProject,
  credits
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'favorites' | 'pinned' | 'trash'>('all');
  const [search, setSearch] = useState('');
  const [folders, setFolders] = useState<string[]>(['Campaigns', 'Socials', 'Drafts']);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Load projects from database
  const loadProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const toggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const project = projects.find(p => p._id === id);
    if (!project) return;
    try {
      const response = await api.put(`/projects/${id}`, {
        title: project.title,
        generatedContent: project.generatedContent
      });
      // Mock toggle on local state
      setProjects(prev => prev.map(p => p._id === id ? { ...p, isFavorite: !p.isFavorite } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const duplicateProject = async (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await api.post('/projects', {
        userId: project.userId,
        title: `${project.title} (Copy)`,
        inputType: project.inputType,
        inputData: project.inputData
      });
      setProjects(prev => [response.data, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders(prev => [...prev, newFolderName]);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'favorites' && !p.isFavorite) return false;
    if (filter === 'pinned' && !p.isPinned) return false;
    return p.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Header and actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Content Library</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Manage, categorize, and schedule your repurposed campaign templates.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsCreatingFolder(!isCreatingFolder)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl transition-all"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Create Folder</span>
          </button>
        </div>
      </div>

      {/* New folder creation panel */}
      {isCreatingFolder && (
        <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-sm flex items-center space-x-3 shadow-md animate-fade-in">
          <input
            type="text"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 focus:outline-none"
          />
          <button onClick={createFolder} className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
            Save
          </button>
        </div>
      )}

      {/* Folders & collections display */}
      <div className="grid grid-cols-4 gap-4">
        {folders.map((folder, idx) => (
          <div key={idx} className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <Folder className="h-5 w-5 text-indigo-500" />
              <span className="text-xs font-bold">{folder}</span>
            </div>
            <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-500 font-bold px-2 py-0.5 rounded-md">
              {idx * 2 + 1} items
            </span>
          </div>
        ))}
      </div>

      {/* Filter and Library Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
        <div className="flex space-x-2">
          {(['all', 'favorites', 'pinned'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                filter === t
                  ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center">
          <BookOpen className="h-10 w-10 text-gray-400 mb-3" />
          <h4 className="text-sm font-bold text-gray-600 dark:text-zinc-400">Library is empty</h4>
          <p className="text-xs text-gray-400 mt-1">Start by uploading content on the Repurpose workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredProjects.map((p) => (
            <div
              key={p._id}
              onClick={() => onSelectProject(p)}
              className="p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl hover:shadow-md cursor-pointer transition-all flex flex-col hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide px-2 py-0.5 bg-indigo-50 dark:bg-zinc-800 rounded">
                  {p.inputType}
                </span>
                <div className="flex space-x-1.5">
                  <button 
                    onClick={(e) => toggleFavorite(p._id, e)} 
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                  >
                    <Star className={`h-4 w-4 ${p.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </button>
                  <button 
                    onClick={(e) => duplicateProject(p, e)} 
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4 text-gray-400 hover:text-gray-700" />
                  </button>
                  <button 
                    onClick={(e) => deleteProject(p._id, e)} 
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 truncate mb-1">
                {p.title}
              </h4>
              <p className="text-[11px] text-gray-400 truncate mb-4">
                Created: {new Date(p.createdAt).toLocaleDateString()}
              </p>

              <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-100 dark:border-zinc-800/80 text-[10px] font-bold text-gray-400">
                <span className="flex items-center space-x-1">
                  <Tag className="h-3 w-3" />
                  <span>Campaign Drafts</span>
                </span>
                <span className="flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
                  Load Workspace <ArrowUpRight className="h-3 w-3 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ContentLibrary;
