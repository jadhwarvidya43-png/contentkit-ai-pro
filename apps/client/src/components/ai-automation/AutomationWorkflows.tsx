import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, Play, Trash2, CheckCircle2, AlertTriangle, 
  HelpCircle, Sparkles, Network, ArrowRight, Save, Clock
} from 'lucide-react';
import api from '../../services/authService';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'logic';
  label: string;
  desc: string;
  status: 'idle' | 'success' | 'failed';
}

const AutomationWorkflows = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<any | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Default visual nodes for n8n/Make-style canvas
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', type: 'trigger', label: 'YouTube RSS Ingestion', desc: 'Triggers when a new video is uploaded', status: 'idle' },
    { id: '2', type: 'action', label: 'Whisper & Diarize Speaker', desc: 'Transcribes audio and extracts voice profiles', status: 'idle' },
    { id: '3', type: 'action', label: 'SEO & Viral Engines', desc: 'Analyzes readability, keyword density, CTR', status: 'idle' },
    { id: '4', type: 'action', label: 'Platform Generator', desc: 'Generates Blog, X Thread, LinkedIn outlines', status: 'idle' },
    { id: '5', type: 'action', label: 'Translate to Spanish', desc: 'Applies Spanish language locale translations', status: 'idle' },
    { id: '6', type: 'logic', label: 'Conditional approval gate', desc: 'Pauses for manual editor sign-off', status: 'idle' },
    { id: '7', type: 'action', label: 'Publish to LinkedIn / Substack', desc: 'Direct API dispatch scheduling', status: 'idle' }
  ]);

  const loadWorkflows = async () => {
    try {
      const response = await api.get('/workflows');
      setWorkflows(response.data);
      if (response.data.length > 0) {
        setActiveWorkflow(response.data[0]);
        if (response.data[0].nodes && response.data[0].nodes.length > 0) {
          setNodes(response.data[0].nodes);
        }
      }
    } catch (err) {
      console.log('No workflows found, using visual presets.');
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const addNode = (category: 'trigger' | 'action' | 'logic') => {
    const presets = {
      trigger: { label: 'Webhook Endpoint Trigger', desc: 'Listen for external POST requests' },
      action: { label: 'Rewrite with Brand Kit', desc: 'Grounds drafted output in brand guidelines' },
      logic: { label: 'Delay execution log', desc: 'Pause automation for 2 hours' }
    };
    const newNode: WorkflowNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: category,
      label: presets[category].label,
      desc: presets[category].desc,
      status: 'idle'
    };
    setNodes(prev => [...prev, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const saveWorkflow = async () => {
    setIsSaving(true);
    try {
      const response = await api.post('/workflows', {
        name: activeWorkflow?.name || 'Content Repurposing pipeline',
        nodes,
        edges: [],
        isActive: activeWorkflow?.isActive || false
      });
      setActiveWorkflow(response.data);
      alert('Workflow saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerExecution = async () => {
    setIsRunning(true);
    
    // Simulate node execution sequence
    for (let i = 0; i < nodes.length; i++) {
      setNodes(prev => prev.map((n, idx) => idx === i ? { ...n, status: 'success' } : n));
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setIsRunning(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">AI Automation Workflows</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Design visual, n8n-style pipelines to automate your transcription and distribution queues.</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={saveWorkflow}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Workflow</span>
          </button>
          <button
            onClick={triggerExecution}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{isRunning ? 'Running Pipeline...' : 'Test Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Workspace canvas grid */}
      <div className="grid grid-cols-4 gap-6">
        
        {/* Node Library palette */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Node Library</h3>
          
          <div className="space-y-2">
            {[
              { type: 'trigger', label: 'Add Trigger Node', bg: 'bg-green-500/10 text-green-600 dark:text-green-400' },
              { type: 'action', label: 'Add Action Node', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
              { type: 'logic', label: 'Add Logic Node', bg: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' }
            ].map((btn) => (
              <button
                key={btn.type}
                onClick={() => addNode(btn.type as any)}
                className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-gray-200 dark:hover:border-zinc-800 ${btn.bg}`}
              >
                <Plus className="h-4 w-4" />
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Pipeline Canvas */}
        <div className="col-span-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col space-y-6 relative overflow-hidden min-h-[500px]">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* Workflow details */}
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200/50 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-bold">
              <Network className="h-4 w-4 text-indigo-500" />
              <span>Visual Canvas Editor</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Cron Trigger: Every Monday 9:00 AM</span>
            </div>
          </div>

          {/* Connected visual node list */}
          <div className="flex flex-col items-center justify-center space-y-4 relative z-10 flex-1 py-8">
            {nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                {/* Node Card */}
                <div className={`w-full max-w-md p-4 rounded-2xl border transition-all flex items-center justify-between shadow-sm bg-white dark:bg-zinc-950 ${
                  node.status === 'success' 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-gray-200 dark:border-zinc-800/80 hover:border-indigo-500/50'
                }`}>
                  <div className="flex items-center space-x-3.5">
                    {/* Visual indicators */}
                    <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                      node.type === 'trigger' 
                        ? 'bg-green-500/10 text-green-600' 
                        : node.type === 'logic' 
                          ? 'bg-yellow-500/10 text-yellow-600' 
                          : 'bg-indigo-500/10 text-indigo-600'
                    }`}>
                      {node.type[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{node.label}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{node.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {node.status === 'success' && (
                      <CheckCircle2 className="h-4.5 w-4.5 text-green-500 animate-bounce" />
                    )}
                    <button onClick={() => removeNode(node.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Arrow Connector */}
                {idx < nodes.length - 1 && (
                  <div className="h-6 w-0.5 bg-gray-200 dark:bg-zinc-800 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};

export default AutomationWorkflows;
