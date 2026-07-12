import React, { useState } from 'react';
import { 
  Upload, Play, Link as LinkIcon, FileText, Sparkles, AlertCircle, 
  ArrowRight, Copy, Check, CheckCircle2, ChevronRight, Edit3, Trash2, Globe
} from 'lucide-react';
import api from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface RepurposeWorkspaceProps {
  model: string;
  brandKitId: string;
  onCampaignGenerated: (campaign: any, text: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  deductCredits: (amount: number) => void;
}

const RepurposeWorkspace: React.FC<RepurposeWorkspaceProps> = ({
  model,
  brandKitId,
  onCampaignGenerated,
  isLoading,
  setIsLoading,
  deductCredits
}) => {
  const { user } = useAuth();
  const [inputType, setInputType] = useState<'upload' | 'youtube' | 'website' | 'text'>('text');
  const [inputText, setInputText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Translation options
  const [targetLang, setTargetLang] = useState('English');
  
  // Progress states
  const [progressStep, setProgressStep] = useState(0); // 0 = idle, 1 = uploading, 2 = transcribing, 3 = diarizing, 4 = structuring
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    setIsLoading(true);
    setProgressStep(1);

    // Simulate pipeline loading states
    const steps = [
      { step: 1, delay: 1000 }, // Uploading
      { step: 2, delay: 2000 }, // Whisper Transcribing
      { step: 3, delay: 2000 }, // Speaker Diarization
      { step: 4, delay: 1500 }  // Generating Campaigns
    ];

    for (const stepInfo of steps) {
      await new Promise(resolve => setTimeout(resolve, stepInfo.delay));
      setProgressStep(stepInfo.step + 1);
    }

    try {
      const finalInput = inputType === 'text' 
        ? inputText 
        : inputType === 'upload' 
          ? `File contents: ${selectedFile?.name}` 
          : urlInput;

      // Post to our actual backend server
      const response = await api.post('/projects', {
        userId: user?._id || 'default',
        title: `Repurposed Project: ${urlInput || selectedFile?.name || 'Text campaign'}`,
        inputType,
        inputData: finalInput,
        brandKitId,
        modelName: model,
        targetLanguage: targetLang
      });

      deductCredits(1500); // Deduct credits upon successful generation
      onCampaignGenerated(response.data.generatedContent, response.data.extractedText);
    } catch (err) {
      console.error(err);
      alert('Failed to generate project. Make sure your server is running.');
    } finally {
      setIsLoading(false);
      setProgressStep(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      
      {/* Introduction Bubble */}
      <div className="text-center mb-10 select-none">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome to Stitch Workspaces
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 max-w-xl mx-auto">
          Upload any audio, video, website url, or transcript, and let our multi-agent gateway generate a complete multi-platform campaign in seconds.
        </p>
      </div>

      {/* Input Workspace Selection */}
      {!isLoading && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden animate-fade-in p-6">
          {/* Tabs header */}
          <div className="flex border-b border-gray-200 dark:border-zinc-800 pb-4 mb-6">
            {([ 'text', 'youtube', 'website', 'upload' ] as const).map((tab) => {
              const icons = {
                text: FileText,
                youtube: Play,
                website: LinkIcon,
                upload: Upload
              };
              const Icon = icons[tab];
              const isActive = inputType === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setInputType(tab)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab === 'youtube' ? 'YouTube/Video' : tab === 'website' ? 'Web URL' : tab === 'upload' ? 'Upload Files' : 'Transcript'}</span>
                </button>
              );
            })}
          </div>

          {/* Form Body */}
          <div className="space-y-6">
            {/* Input fields based on type */}
            {inputType === 'text' && (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste raw transcript, article draft, or custom marketing copy here..."
                rows={8}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors"
              />
            )}

            {inputType === 'youtube' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Video URLs</label>
                <div className="relative">
                  <Play className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            {inputType === 'website' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Article / Website URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://blog.example.com/saas-automation-guide"
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            {inputType === 'upload' && (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-50/10' 
                    : 'border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20'
                }`}
              >
                <Upload className="h-10 w-10 text-gray-400 mb-4 animate-bounce" />
                <p className="text-sm font-semibold mb-1">Drag and drop file here</p>
                <p className="text-xs text-gray-400 mb-4">MP4, MOV, MP3, WAV, PDF, DOCX (Max 100MB)</p>
                
                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer">
                  Browse Files
                  <input type="file" onChange={handleFileChange} className="hidden" accept=".mp4,.mov,.mp3,.wav,.pdf,.docx,.txt" />
                </label>

                {selectedFile && (
                  <div className="mt-4 p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl flex items-center space-x-2 text-xs font-semibold">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span className="truncate max-w-xs">{selectedFile.name}</span>
                    <span className="text-gray-400">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            )}

            {/* Translation and configuration line */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Target Language</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-gray-100"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Portuguese">Portuguese</option>
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={startAnalysis}
                  disabled={(inputType === 'text' && !inputText) || (inputType === 'youtube' && !urlInput) || (inputType === 'website' && !urlInput) || (inputType === 'upload' && !selectedFile)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 text-white font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer text-xs uppercase tracking-wider"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Repurpose Campaign</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Progress Analyzer Screen */}
      {isLoading && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center text-center glow-indigo animate-pulse-slow">
          <Sparkles className="h-12 w-12 text-indigo-500 mb-6 animate-spin" />
          
          <h3 className="text-xl font-bold tracking-tight mb-2">Analyzing Media Files...</h3>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mb-6 max-w-sm">
            Our multi-agent gateway is extracting transcription chunks and alignment points.
          </p>

          {/* Steps checklist */}
          <div className="w-full max-w-xs space-y-3 mb-6 text-left text-xs font-semibold">
            {[
              { id: 1, label: 'Uploading file data to Storage R2' },
              { id: 2, label: 'Whisper Transcribing Audio chunks' },
              { id: 3, label: 'Running Speaker Diarization' },
              { id: 4, label: 'Structuring multi-platform campaigns' }
            ].map((step) => {
              const isDone = progressStep > step.id;
              const isCurrent = progressStep === step.id;
              return (
                <div key={step.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : isCurrent ? (
                      <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-[9px] text-gray-400">
                        {step.id}
                      </div>
                    )}
                    <span className={isDone ? 'text-gray-900 dark:text-gray-100 line-through' : isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}>
                      {step.label}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 animate-bounce">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress loader */}
          <div className="w-full max-w-xs bg-gray-100 dark:bg-zinc-950 h-2.5 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(progressStep / 4) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Step {Math.min(progressStep, 4)} of 4 completed
          </span>
        </div>
      )}

    </div>
  );
};

export default RepurposeWorkspace;
