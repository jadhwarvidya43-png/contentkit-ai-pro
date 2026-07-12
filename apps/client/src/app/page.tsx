"use client";
import React, { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import CommandPalette from '../components/ui/CommandPalette';
import RepurposeWorkspace from '../components/dashboard/RepurposeWorkspace';
import RightSidebarPanels from '../components/dashboard/RightSidebarPanels';
import ContentLibrary from '../components/library/ContentLibrary';
import BrandKitWorkspace from '../components/brand-kit/BrandKitWorkspace';
import AutomationWorkflows from '../components/ai-automation/AutomationWorkflows';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import BillingAndSettings from '../components/ui/BillingAndSettings';

import { 
  ArrowLeft, Copy, Check, Calendar, Globe, ExternalLink, 
  CheckCircle, FileText, CheckCircle2, ChevronRight, Play
} from 'lucide-react';
import api from '../services/authService';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('repurpose');
  const [model, setModel] = useState('Gemini 1.5 Pro');
  const [brandKitId, setBrandKitId] = useState('default');
  const [credits, setCredits] = useState(12450);
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Active campaign content loaded
  const [activeCampaign, setActiveCampaign] = useState<any | null>(null);
  const [activeTranscript, setActiveTranscript] = useState('');
  const [activeProjectTitle, setActiveProjectTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Platform tab inside campaign editor
  const [editorTab, setEditorTab] = useState<'twitter' | 'linkedin' | 'blog' | 'newsletter' | 'clips' | 'other' | 'transcript'>('twitter');
  
  // Clipboard copied status
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Schedule publishing states
  const [publishStatus, setPublishStatus] = useState<string | null>(null);

  const handleCampaignGenerated = (campaign: any, transcript: string) => {
    setActiveCampaign(campaign);
    setActiveTranscript(transcript);
    setActiveProjectTitle('Automated Multi-platform Campaign');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const schedulePost = (platform: string) => {
    setPublishStatus(platform);
    setTimeout(() => setPublishStatus(null), 2000);
  };

  const triggerTranslation = async (lang: string) => {
    if (!activeCampaign) return;
    setIsLoading(true);
    try {
      // Simulate backend translate call
      const response = await api.post('/projects/translate', {
        projectId: 'default',
        targetLanguage: lang
      });
      setActiveCampaign(response.data.generatedContent);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
    <DashboardLayout
      activeView={activeView}
      setActiveView={setActiveView}
      onSearchClick={() => setIsCommandPaletteOpen(true)}
      model={model}
      setModel={setModel}
      credits={credits}
    >
      <div className="h-full">
        {/* Spotlight Command Suite */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          setActiveView={setActiveView}
          setModel={setModel}
        />

        {/* 1. Main Workspace Switcher logic */}
        {activeView === 'repurpose' && (
          <div className="h-full">
            {!activeCampaign ? (
              <RepurposeWorkspace
                model={model}
                brandKitId={brandKitId}
                onCampaignGenerated={handleCampaignGenerated}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                deductCredits={(amt) => setCredits(c => Math.max(0, c - amt))}
              />
            ) : (
              /* Campaign Split View Editor Mode */
              <div className="h-full flex flex-col md:flex-row animate-fade-in select-none">
                
                {/* Left/Middle Content Editor Column */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {/* Editor Header line */}
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-4">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => { setActiveCampaign(null); setActiveTranscript(''); }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-xl transition-colors text-gray-500"
                      >
                        <ArrowLeft className="h-4.5 w-4.5" />
                      </button>
                      <div>
                        <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100 leading-snug">{activeProjectTitle}</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">Generated via {model}</p>
                      </div>
                    </div>

                    {/* Target translation dropdown inside editor */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Language Translation</span>
                      <select
                        onChange={(e) => triggerTranslation(e.target.value)}
                        className="bg-gray-50 dark:bg-zinc-800 border-0 text-xs font-semibold rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                      </select>
                    </div>
                  </div>

                  {/* Editors Platform Tab list */}
                  <div className="flex border-b border-gray-150 dark:border-zinc-800/80 pb-2 overflow-x-auto space-x-1">
                    {[
                      { id: 'twitter', label: 'Twitter / X' },
                      { id: 'linkedin', label: 'LinkedIn' },
                      { id: 'blog', label: 'Blog Article' },
                      { id: 'newsletter', label: 'Newsletter' },
                      { id: 'clips', label: 'Video Clips' },
                      { id: 'other', label: 'Substack / Reddit' },
                      { id: 'transcript', label: 'Audio Transcript' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setEditorTab(tab.id as any)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          editorTab === tab.id
                            ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Editors Content Card panels */}
                  <div className="space-y-4">
                    
                    {/* Twitter Tab */}
                    {editorTab === 'twitter' && (
                      <div className="space-y-4">
                        {/* Threads */}
                        <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Twitter/X Thread Drafts</span>
                            <button 
                              onClick={() => copyToClipboard(activeCampaign.twitter.threads[0].tweets.join('\n\n'), 'thread')}
                              className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                            >
                              {copiedKey === 'thread' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                              <span>{copiedKey === 'thread' ? 'Copied' : 'Copy Thread'}</span>
                            </button>
                          </div>

                          <div className="space-y-3.5 border-l-2 border-gray-150 dark:border-zinc-800 pl-4 ml-2">
                            {activeCampaign.twitter.threads[0].tweets.map((tweet: string, idx: number) => (
                              <div key={idx} className="p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200/50 dark:border-zinc-850 rounded-2xl relative">
                                <span className="absolute -left-7 top-4 text-[9px] font-black text-gray-400 bg-white dark:bg-zinc-900 h-5 w-5 rounded-full border border-gray-150 dark:border-zinc-800 flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <textarea
                                  value={tweet}
                                  onChange={(e) => {
                                    const updated = JSON.parse(JSON.stringify(activeCampaign));
                                    updated.twitter.threads[0].tweets[idx] = e.target.value;
                                    setActiveCampaign(updated);
                                  }}
                                  rows={3}
                                  className="w-full bg-transparent border-0 outline-none text-xs focus:ring-0 text-gray-800 dark:text-zinc-200 resize-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Viral Hooks */}
                        <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Generated Hook Alternatives</span>
                          {activeCampaign.twitter.viralHooks.map((h: string, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200/50 dark:border-zinc-850 rounded-2xl text-xs font-semibold">
                              <span className="flex-1 truncate mr-2">{h}</span>
                              <button onClick={() => copyToClipboard(h, `h-${idx}`)} className="text-gray-400 hover:text-indigo-600">
                                {copiedKey === `h-${idx}` ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LinkedIn Tab */}
                    {editorTab === 'linkedin' && (
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">LinkedIn Thought Leadership Post</span>
                            <div className="flex space-x-3 text-xs">
                              <button 
                                onClick={() => schedulePost('linkedin')}
                                className="flex items-center space-x-1 text-gray-500 hover:underline"
                              >
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{publishStatus === 'linkedin' ? 'Scheduled!' : 'Schedule'}</span>
                              </button>
                              <button 
                                onClick={() => copyToClipboard(activeCampaign.linkedin.posts[0], 'linkedin')}
                                className="flex items-center space-x-1 text-indigo-600 hover:underline font-semibold"
                              >
                                {copiedKey === 'linkedin' ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                <span>Copy Post</span>
                              </button>
                            </div>
                          </div>

                          <textarea
                            value={activeCampaign.linkedin.posts[0]}
                            onChange={(e) => {
                              const updated = JSON.parse(JSON.stringify(activeCampaign));
                              updated.linkedin.posts[0] = e.target.value;
                              setActiveCampaign(updated);
                            }}
                            rows={8}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-2xl p-4 text-xs focus:outline-none focus:border-indigo-500 text-gray-800 dark:text-zinc-200"
                          />
                        </div>

                        {/* Carousel Outline */}
                        <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-6 space-y-3 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">LinkedIn Carousel Slides outline</span>
                          <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                            {activeCampaign.linkedin.carouselOutline.map((s: string, idx: number) => (
                              <div key={idx} className="p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200/50 dark:border-zinc-850 rounded-2xl flex items-center space-x-2">
                                <span className="text-[10px] font-black text-indigo-500">{idx + 1}</span>
                                <span className="truncate">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Blog Tab */}
                    {editorTab === 'blog' && (
                      <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SEO Blog Article Guidelines</span>
                          <button 
                            onClick={() => copyToClipboard(activeCampaign.blog.outline.join('\n'), 'blog')}
                            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy Article Outline</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">SEO Title Tag</label>
                            <input
                              type="text"
                              value={activeCampaign.blog.seoTitle}
                              onChange={(e) => {
                                const updated = JSON.parse(JSON.stringify(activeCampaign));
                                updated.blog.seoTitle = e.target.value;
                                setActiveCampaign(updated);
                              }}
                              className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3.5 py-2 text-xs focus:outline-none text-gray-900 dark:text-gray-100"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Meta Description</label>
                            <textarea
                              value={activeCampaign.blog.metaDescription}
                              onChange={(e) => {
                                const updated = JSON.parse(JSON.stringify(activeCampaign));
                                updated.blog.metaDescription = e.target.value;
                                setActiveCampaign(updated);
                              }}
                              rows={2}
                              className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl p-3 text-xs focus:outline-none text-gray-900 dark:text-gray-100"
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block">Outline Headings</span>
                            {activeCampaign.blog.outline.map((h: string, idx: number) => (
                              <div key={idx} className="p-3 bg-gray-50 dark:bg-zinc-955 border border-gray-200/50 dark:border-zinc-850 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                                <span className="text-indigo-500">H{idx === 0 ? 1 : 2}</span>
                                <span>{h}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Newsletter Tab */}
                    {editorTab === 'newsletter' && (
                      <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Newsletter Dispatch</span>
                          <button 
                            onClick={() => copyToClipboard(activeCampaign.newsletter.subject + '\n\n' + activeCampaign.newsletter.introduction, 'email')}
                            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy Email</span>
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Subject Line</label>
                            <input
                              type="text"
                              value={activeCampaign.newsletter.subject}
                              onChange={(e) => {
                                const updated = JSON.parse(JSON.stringify(activeCampaign));
                                updated.newsletter.subject = e.target.value;
                                setActiveCampaign(updated);
                              }}
                              className="w-full bg-gray-50 dark:bg-zinc-955 border border-gray-200 dark:border-zinc-850 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Newsletter Body</label>
                            <textarea
                              value={activeCampaign.newsletter.introduction}
                              onChange={(e) => {
                                const updated = JSON.parse(JSON.stringify(activeCampaign));
                                updated.newsletter.introduction = e.target.value;
                                setActiveCampaign(updated);
                              }}
                              rows={8}
                              className="w-full bg-gray-50 dark:bg-zinc-955 border border-gray-200 dark:border-zinc-850 rounded-xl p-4 text-xs focus:outline-none text-gray-800 dark:text-zinc-200"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Clips Tab */}
                    {editorTab === 'clips' && (
                      <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Opus Clip Highlight Segment</span>
                          <span className="text-xs font-bold text-green-500">Viral score: {activeCampaign.videoClips[0].score}/100</span>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-zinc-955 border border-gray-200/50 dark:border-zinc-850 rounded-2xl space-y-3 text-xs">
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Segment Duration</span>
                            <span className="font-extrabold text-gray-900 dark:text-gray-100">{activeCampaign.videoClips[0].title}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Extracted Hook Transcript</span>
                            <p className="italic text-gray-600 dark:text-zinc-400 font-semibold leading-relaxed">"{activeCampaign.videoClips[0].transcript}"</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Subtitles Coord Layout</span>
                            <code className="text-[10px] bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-gray-150 dark:border-zinc-800 block text-indigo-500 truncate">
                              text: "{activeCampaign.videoClips[0].subtitles[0].text}" at time {activeCampaign.videoClips[0].subtitles[0].time} (X:50, Y:70)
                            </code>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Platforms Tab */}
                    {editorTab === 'other' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-5 space-y-3 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Substack Dispatch copy</span>
                          <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed font-semibold">{activeCampaign.otherPlatforms.substack}</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-5 space-y-3 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Reddit Community Post</span>
                          <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed font-semibold">{activeCampaign.otherPlatforms.reddit}</p>
                        </div>
                      </div>
                    )}

                    {/* Audio Transcript Tab */}
                    {editorTab === 'transcript' && (
                      <div className="bg-white dark:bg-zinc-900 border border-gray-250/70 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Diarized Audio Transcription Logs</span>
                        <div className="p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-2xl max-h-[300px] overflow-y-auto font-mono text-xs text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                          {activeTranscript}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Right Collapsible Panel */}
                <RightSidebarPanels
                  campaign={activeCampaign}
                  inputText={activeTranscript}
                  onUpdateCampaign={setActiveCampaign}
                  credits={credits}
                  deductCredits={(amt) => setCredits(c => Math.max(0, c - amt))}
                />

              </div>
            )}
          </div>
        )}

        {activeView === 'library' && (
          <ContentLibrary
            onSelectProject={(project) => {
              setActiveCampaign(project.generatedContent);
              setActiveTranscript(project.extractedText);
              setActiveProjectTitle(project.title);
              setActiveView('repurpose');
            }}
            credits={credits}
          />
        )}

        {activeView === 'brandkit' && (
          <BrandKitWorkspace
            workspaceId={brandKitId}
            onSaveSuccess={(id) => setBrandKitId(id)}
          />
        )}

        {activeView === 'workflows' && (
          <AutomationWorkflows />
        )}

        {activeView === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {activeView === 'team' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6 text-center select-none py-20">
            <h3 className="text-xl font-bold tracking-tight mb-2">Team Space & Permissions</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 max-w-md mx-auto mb-6">
              Invite your teammates, allocate AI credits, configure role permissions, and track collaborative workspace activities.
            </p>
            <div className="flex justify-center space-x-3">
              <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors">
                Invite Teammate
              </button>
              <button onClick={() => setActiveView('settings')} className="px-4 py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl transition-colors">
                View Audit Logs
              </button>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <BillingAndSettings
            credits={credits}
            addCredits={(amt) => setCredits(c => c + amt)}
            onUpgradePlan={(plan) => setCurrentPlan(plan)}
            currentPlan={currentPlan}
          />
        )}
      </div>
    </DashboardLayout>
  </ProtectedRoute>
  );
};

export default Dashboard;




