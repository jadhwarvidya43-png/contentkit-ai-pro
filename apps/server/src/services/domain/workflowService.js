const Workflow = require('../../models/Workflow');
const { eventBus, EVENT_NAMES } = require('../eventBus');

async function createWorkflow(data) {
  const workflow = await Workflow.create(data);
  return workflow;
}

async function getWorkflows(workspaceId) {
  return Workflow.find({ workspaceId }).sort({ createdAt: -1 }).lean();
}

async function updateWorkflow(id, updates) {
  const workflow = await Workflow.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });
  if (!workflow) {
    throw new Error(`Workflow not found: ${id}`);
  }
  return workflow;
}

async function deleteWorkflow(id) {
  const workflow = await Workflow.findByIdAndDelete(id);
  if (!workflow) {
    throw new Error(`Workflow not found: ${id}`);
  }
  return workflow;
}

async function executeWorkflow(id) {
  const workflow = await Workflow.findById(id);
  if (!workflow) {
    throw new Error(`Workflow not found: ${id}`);
  }

  const nodes = workflow.nodes || [];
  const executionResults = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const startTime = Date.now();

    try {
      // Update node status to running
      nodes[i] = { ...node, status: 'running', startedAt: new Date().toISOString() };
      workflow.nodes = nodes;
      await workflow.save();

      // Simulate node execution based on type
      const duration = 50 + Math.random() * 100;
      await new Promise((resolve) => setTimeout(resolve, duration));

      // Mark as completed
      nodes[i] = {
        ...nodes[i],
        status: 'completed',
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime
      };
      workflow.nodes = nodes;
      await workflow.save();

      executionResults.push({
        nodeId: node.id || i,
        type: node.type || 'unknown',
        status: 'completed',
        durationMs: Date.now() - startTime
      });
    } catch (err) {
      nodes[i] = {
        ...nodes[i],
        status: 'failed',
        error: err.message,
        completedAt: new Date().toISOString()
      };
      workflow.nodes = nodes;
      await workflow.save();

      executionResults.push({
        nodeId: node.id || i,
        type: node.type || 'unknown',
        status: 'failed',
        error: err.message
      });
      break;
    }
  }

  eventBus.emit(EVENT_NAMES.WORKFLOW_EXECUTED, {
    workflowId: workflow._id,
    name: workflow.name,
    workspaceId: workflow.workspaceId,
    nodeCount: nodes.length,
    results: executionResults
  });

  return { workflow, executionResults };
}

module.exports = {
  createWorkflow,
  getWorkflows,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow
};
