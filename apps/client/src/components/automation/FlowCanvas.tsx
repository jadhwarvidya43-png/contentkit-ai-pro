"use client";

import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Trigger: New Asset Uploaded' },
    position: { x: 250, y: 5 },
    className: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100 rounded-md font-medium shadow-sm',
  },
  {
    id: '2',
    data: { label: 'Action: Audio Transcription (Whisper)' },
    position: { x: 250, y: 100 },
    className: 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-md shadow-sm',
  },
  {
    id: '3',
    data: { label: 'Action: AI Summarization' },
    position: { x: 250, y: 200 },
    className: 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-md shadow-sm',
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'Output: Save to Content Library' },
    position: { x: 250, y: 300 },
    className: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100 rounded-md font-medium shadow-sm',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
];

export function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-[600px] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        className="bg-slate-50 dark:bg-slate-950"
      >
        <Controls className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 fill-slate-700 dark:fill-slate-300" />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'input': return '#818cf8';
              case 'output': return '#34d399';
              default: return '#94a3b8';
            }
          }}
          className="bg-white dark:bg-slate-900 mask border-slate-200 dark:border-slate-800"
        />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
