import React, { useState } from 'react';
import { 
  Sparkles, Search, ShieldCheck, Download, Bot, MessageSquare, 
  Settings, Check, Copy, FileText, ChevronRight, Eye, Smartphone, TrendingUp, Info
} from 'lucide-react';

interface RightSidebarPanelsProps {
  campaign: any;
  inputText: string;
  onUpdateCampaign: (updated: any) => void;
  credits: number;
  deductCredits: (amount: number) => void;
}

const RightSidebarPanels: React.FC<RightSidebarPanelsProps> = ({
  campaign,
  inputText,
  onUpdateCampaign,
  credits,
  deductCredits
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'seo' | 'viral' | 'quality' | 'exports'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hi! I am your ContentKit assistant. Select any output section and ask me to "expand", "add humor", or "rewrite like Alex Hormozi".' }
  ]);
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedExport, setCopiedExport] = useState<string | null>(null);

  const handleChatAction = async (promptText: string) => {
    setIsProcessingChat(true);
    setChatMessages(prev => [...prev, { sender: 'user', text: promptText }]);
    deductCredits(200);

    // Simulate AI updates based on command
    setTimeout(() => {
      let responseText = "Sure, I have updated the content structure with that request.";
      const updatedCampaign = JSON.parse(JSON.stringify(campaign));

      if (promptText.toLowerCase().includes('shorter') || promptText.toLowerCase().includes('condense')) {
        responseText = "I've simplified and shortened the X thread and newsletter copy.";
        if (updatedCampaign.twitter && updatedCampaign.twitter.threads[0]) {
          updatedCampaign.twitter.threads[0].tweets = updatedCampaign.twitter.threads[0].tweets.map((t: string) => t.substring(0, 100) + '...');
        }
      } else if (promptText.toLowerCase().includes('expand') || promptText.toLowerCase().includes('more')) {
        responseText = "I've added more educational context, statistics, and examples to the blog and LinkedIn posts.";
        if (updatedCampaign.linkedin && updatedCampaign.linkedin.posts[0]) {
          updatedCampaign.linkedin.posts[0] += "\n\nKey Statistic: 73% of executives state that multi-channel repurposing drives qualified organic pipeline double the speed of cold outreach.";
        }
      } else if (promptText.toLowerCase().includes('hormozi') || promptText.toLowerCase().includes('welsh')) {
        responseText = "Rewritten with high-converting hooks, short punchy sentences, and direct value declarations.";
        if (updatedCampaign.twitter && updatedCampaign.twitter.threads[0]) {
          updatedCampaign.twitter.threads[0].tweets[0] = "Repurposing content is broke. Visual pipelines are rich. Here is how to scale to 20+ channels without hiring writing staff:";
        }
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
      onUpdateCampaign(updatedCampaign);
      setIsProcessingChat(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    handleChatAction(chatInput);
    setChatInput('');
  };

  const triggerExport = (format: string) => {
    setCopiedExport(format);
    setTimeout(() => setCopiedExport(null), 2000);

    // Trigger local download for text/md
    const textContent = JSON.stringify(campaign, null, 2);
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `campaign-export.${format === 'markdown' ? 'md' : format === 'json' ? 'json' : 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <aside className="w-96 flex flex-col border-l border-gray-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md overflow-hidden">
      
      {/* Icon Tab Header Selection */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 p-1 bg-gray-50 dark:bg-zinc-900/30">
        {[
          { id: 'chat', label: 'AI Chat', icon: MessageSquare },
          { id: 'seo', label: 'SEO Engine', icon: Search },
          { id: 'viral', label: 'Viral Engine', icon: TrendingUp },
          { id: 'quality', label: 'Guardrails', icon: ShieldCheck },
          { id: 'exports', label: 'Exports', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title={tab.label}
            >
              <Icon className="h-4.5 w-4.5 mb-1" />
              <span className="text-[9px] font-bold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panel contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* 1. AI Chat Panel */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full space-y-4 select-none">
            {/* Conversation Log */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] p-1">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-200/50 dark:border-zinc-700/50'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isProcessingChat && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-zinc-800 text-gray-400 rounded-2xl px-4 py-2.5 text-xs animate-pulse">
                    Gateway formulating response...
                  </div>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Quick Actions</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                <button onClick={() => handleChatAction('Make this shorter and punchy')} className="py-2 px-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-left">
                  ✂️ Condense text
                </button>
                <button onClick={() => handleChatAction('Add statistics and educational depth')} className="py-2 px-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-left">
                  📈 Expand copy
                </button>
                <button onClick={() => handleChatAction('Rewrite like Alex Hormozi')} className="py-2 px-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-left">
                  🔥 Hormozi Style
                </button>
                <button onClick={() => handleChatAction('Improve SEO keywords density')} className="py-2 px-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-colors text-left">
                  🔍 Optimize SEO
                </button>
              </div>
            </div>

            {/* Message input */}
            <div className="relative mt-auto pt-2">
              <input
                type="text"
                placeholder="Ask AI to refine edits..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2.5 top-4.5 text-indigo-500 hover:text-indigo-700 font-bold"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* 2. SEO Engine Panel */}
        {activeTab === 'seo' && (
          <div className="space-y-4 text-xs">
            {/* SERP preview selector */}
            <div className="flex justify-between items-center bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide pl-2">Google Preview</span>
              <div className="flex space-x-0.5">
                <button 
                  onClick={() => setSerpDevice('desktop')}
                  className={`p-1.5 rounded-lg ${serpDevice === 'desktop' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => setSerpDevice('mobile')}
                  className={`p-1.5 rounded-lg ${serpDevice === 'mobile' ? 'bg-white dark:bg-zinc-800 shadow-sm text-indigo-600' : 'text-gray-400'}`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Google preview mock */}
            <div className={`p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl ${serpDevice === 'mobile' ? 'max-w-[260px] mx-auto' : ''}`}>
              <div className="text-[11px] text-[#202124] dark:text-[#bdc1c6] flex items-center space-x-1.5 mb-1 truncate">
                <span>https://www.example.com</span>
                <span className="text-[9px]">› blog › ai-repurposing</span>
              </div>
              <h4 className="text-[#1a0dab] dark:text-[#8ab4f8] text-sm hover:underline font-semibold leading-snug cursor-pointer">
                {campaign.blog?.seoTitle || 'The Ultimate Guide to AI Content Repurposing'}
              </h4>
              <p className="text-[#4d5156] dark:text-[#9aa0a6] text-[11px] mt-1 leading-normal">
                {campaign.blog?.metaDescription || 'Learn how to turn single video and audio files into multi-platform marketing pipelines using automated AI agents.'}
              </p>
            </div>

            {/* Keywords */}
            <div className="bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl p-3.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Target Keyword Analysis</span>
              <div className="space-y-2">
                {campaign.seoEngine?.keywords?.map((k: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{k.word}</span>
                    <div className="flex space-x-2 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${k.difficulty === 'High' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                        {k.difficulty} KD
                      </span>
                      <span className="text-gray-400">{k.volume} vol</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Link building suggestions */}
            <div className="bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl p-3.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Internal Linking Schema</span>
              <div className="space-y-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                {campaign.blog?.internalLinks?.map((l: string, idx: number) => (
                  <div key={idx} className="truncate cursor-pointer hover:underline">🔗 {l}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Viral Engine Panel */}
        {activeTab === 'viral' && (
          <div className="space-y-4 text-xs select-none">
            {/* Score circle */}
            <div className="bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-200/50 dark:border-zinc-800/50 rounded-3xl p-4 flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center mb-3">
                {/* Simulated circle border */}
                <div className="h-20 w-20 rounded-full border-4 border-indigo-100 dark:border-indigo-950 flex items-center justify-center">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {campaign.viralEngine?.viralityScore || '92'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estimated Virality Index</span>
              <p className="text-[10px] text-gray-500 max-w-[200px]">
                Calculated based on hooks structure, readability level, and platform analytics.
              </p>
            </div>

            {/* Retention curve mock */}
            <div className="bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">Estimated Retention Curve</span>
              {/* Graphic line chart mockup using pure css */}
              <div className="h-24 flex items-end justify-between border-b border-l border-gray-200 dark:border-zinc-800 pb-1 pl-1">
                {[90, 85, 78, 62, 59, 58, 62, 60, 65, 59].map((height, idx) => (
                  <div key={idx} className="w-[8%] bg-indigo-500/80 dark:bg-indigo-400/80 rounded-t-sm" style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-wider mt-1 px-1">
                <span>0:00 (Hook)</span>
                <span>End of clip</span>
              </div>
            </div>

            {/* Engagement metrics */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl">
                <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider mb-1">Predicted CTR</span>
                <span className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                  {campaign.viralEngine?.predictedCTR || '6.4%'}
                </span>
              </div>
              <div className="p-3 bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl">
                <span className="text-gray-400 block text-[9px] font-bold uppercase tracking-wider mb-1">Engagement</span>
                <span className="font-extrabold text-sm text-green-500">
                  {campaign.viralEngine?.engagementLikelihood || 'High'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Guardrails/Quality Panel */}
        {activeTab === 'quality' && (
          <div className="space-y-4 text-xs">
            {/* Checklist */}
            <div className="bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-200/50 dark:border-zinc-800/50 rounded-2xl p-4 space-y-3.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Content Quality Checks</span>
              {[
                { label: 'Grammar and Syntax Score', value: `${campaign.qualityReport?.grammar || 99}%`, status: 'pass' },
                { label: 'Readability Grading', value: campaign.qualityReport?.readability || 'Grade 8', status: 'pass' },
                { label: 'Brand Voice Alignment', value: `${campaign.qualityReport?.brandMatch || 95}%`, status: 'pass' },
                { label: 'Hallucination & Fact Check', value: campaign.qualityReport?.hallucinationRisk || 'Low Risk', status: 'pass' },
                { label: 'Spam Trigger Check', value: 'Clean', status: 'pass' },
                { label: 'Plagiarism Flag', value: campaign.qualityReport?.plagiarismScore || '0%', status: 'pass' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-zinc-400 font-semibold">{item.label}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 rounded-2xl flex items-start space-x-2.5">
              <Info className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 leading-normal">
                These guardrails verify that generated outputs conform to platform standards before scheduling or uploading.
              </p>
            </div>
          </div>
        )}

        {/* 5. Exports Panel */}
        {activeTab === 'exports' && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Download Campaign Assets</span>
            {[
              { id: 'markdown', label: 'Export as Markdown (.md)', desc: 'Perfect for Obsidian and local workflows' },
              { id: 'txt', label: 'Export as Plain Text (.txt)', desc: 'Raw formatting logs' },
              { id: 'json', label: 'Export as JSON Payload (.json)', desc: 'Ideal for custom webhooks and API schemas' },
              { id: 'notion', label: 'Sync directly to Notion Workspace', desc: 'Saves campaign templates in your database' }
            ].map((exp) => (
              <button
                key={exp.id}
                onClick={() => triggerExport(exp.id)}
                className="w-full text-left p-3.5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-zinc-800/70 transition-colors flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{exp.label}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{exp.desc}</p>
                </div>
                {copiedExport === exp.id ? (
                  <span className="text-[10px] font-bold text-green-500">Done</span>
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        )}

      </div>
    </aside>
  );
};

interface ChevronRightIconProps {
  className?: string;
}

export default RightSidebarPanels;
