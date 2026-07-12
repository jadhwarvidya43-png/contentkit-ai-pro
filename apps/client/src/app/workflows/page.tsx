import { FlowCanvas } from '@/components/automation/FlowCanvas';
import React from 'react';

export default function WorkflowsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Automation Builder</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Design your custom content pipelines by dragging and dropping actions onto the canvas.
        </p>
      </div>
      
      <div className="w-full">
        <FlowCanvas />
      </div>
    </div>
  );
}
