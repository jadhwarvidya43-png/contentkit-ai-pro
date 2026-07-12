const queueService = require('./queueService');
const { eventBus, EVENT_NAMES } = require('./eventBus');

/**
 * Executes a workflow graph defined by nodes and edges.
 * Currently supports a linear execution or simple directed acyclic graphs (DAGs).
 */
async function executeWorkflow(workflowId, nodes, edges, initialPayload = {}) {
  console.log(`[Workflow Engine] Starting workflow ${workflowId}`);
  
  // Find the root node(s) - nodes with no incoming edges
  const targetNodeIds = new Set(edges.map(e => e.target));
  const rootNodes = nodes.filter(n => !targetNodeIds.has(n.id));

  if (rootNodes.length === 0) {
    throw new Error('Invalid workflow: No root trigger node found.');
  }

  // Trigger the root node(s)
  for (const node of rootNodes) {
    await executeNode(node.id, nodes, edges, initialPayload);
  }
}

async function executeNode(nodeId, nodes, edges, payload) {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return;

  console.log(`[Workflow Engine] Executing node ${node.id} (${node.data.label})`);

  let nextPayload = { ...payload };

  try {
    // 1. Process Action
    if (node.data.label.includes('Transcription')) {
      // Stub: in reality, queue a transcription job
      console.log(`[Workflow Engine] Queueing Transcription...`);
      nextPayload.transcription = 'Transcription successful';
    } else if (node.data.label.includes('AI Summarization')) {
      // Enqueue the AI Gateway job
      const job = await queueService.enqueue({
        type: 'content-generation',
        payload: {
          originalName: nextPayload.originalName || 'Workflow Asset',
          options: {
            model: 'gpt-4o',
            language: 'en'
          }
        },
        priority: 5
      });
      console.log(`[Workflow Engine] Queued AI Summarization Job ${job.id}`);
      nextPayload.jobId = job.id;
    } else if (node.data.label.includes('Save')) {
      console.log(`[Workflow Engine] Saving results...`);
      nextPayload.saved = true;
    }

    // 2. Find downstream nodes and execute them
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      // In a real system, we'd wait for asynchronous jobs to finish before triggering the next node.
      // This requires the Queue Worker to emit events back to the Workflow Engine.
      await executeNode(edge.target, nodes, edges, nextPayload);
    }
  } catch (error) {
    console.error(`[Workflow Engine] Node ${node.id} failed:`, error);
    // Optionally trigger an error path if edges support conditional routing
  }
}

module.exports = {
  executeWorkflow
};
