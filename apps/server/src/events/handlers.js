const { eventBus, EVENT_NAMES } = require('../services/eventBus');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

function onProjectCreated(payload) {
  return AuditLog.create({
    workspaceId: payload.workspaceId || 'default',
    userId: payload.userId || payload.createdBy,
    action: 'project.created',
    resourceType: 'Project',
    resourceId: String(payload.projectId || payload._id),
    details: { title: payload.title }
  }).then(() => {
    console.log(`[Events] AuditLog: project created — ${payload.title}`);
  });
}

function onProjectDeleted(payload) {
  return AuditLog.create({
    workspaceId: payload.workspaceId || 'default',
    userId: payload.userId,
    action: 'project.deleted',
    resourceType: 'Project',
    resourceId: String(payload.projectId),
    details: { title: payload.title }
  }).then(() => {
    console.log(`[Events] AuditLog: project deleted — ${payload.projectId}`);
  });
}

function onBrandKitUpdated(payload) {
  return AuditLog.create({
    workspaceId: payload.workspaceId || 'default',
    userId: payload.userId,
    action: 'brandkit.updated',
    resourceType: 'BrandKit',
    resourceId: String(payload.brandKitId || payload._id),
    details: { brandName: payload.brandName }
  }).then(() => {
    console.log(`[Events] AuditLog: brandkit updated — ${payload.brandName}`);
  });
}

function onAiJobCompleted(payload) {
  return Notification.create({
    userId: payload.createdBy,
    workspaceId: payload.workspaceId,
    title: 'AI Job Completed',
    message: `Your ${payload.type || 'AI'} job has completed successfully.`,
    type: 'success',
    actionUrl: payload.actionUrl || null
  }).then(() => {
    console.log(`[Events] Notification: AI job completed for user ${payload.createdBy}`);
  });
}

function onAiJobFailed(payload) {
  return Notification.create({
    userId: payload.createdBy,
    workspaceId: payload.workspaceId,
    title: 'AI Job Failed',
    message: `Your ${payload.type || 'AI'} job failed: ${payload.error || 'Unknown error'}.`,
    type: 'error',
    actionUrl: payload.actionUrl || null
  }).then(() => {
    console.log(`[Events] Notification: AI job failed for user ${payload.createdBy}`);
  });
}

function onWorkspaceCreated(payload) {
  return AuditLog.create({
    workspaceId: String(payload.workspaceId || payload._id),
    userId: payload.ownerId,
    action: 'workspace.created',
    resourceType: 'Workspace',
    resourceId: String(payload.workspaceId || payload._id),
    details: { name: payload.name }
  }).then(() => {
    console.log(`[Events] AuditLog: workspace created — ${payload.name}`);
  });
}

function onContentPublished(payload) {
  return AuditLog.create({
    workspaceId: payload.workspaceId || 'default',
    userId: payload.userId,
    action: 'content.published',
    resourceType: 'Project',
    resourceId: String(payload.projectId),
    details: { platform: payload.platform }
  }).then(() => {
    console.log(`[Events] AuditLog: content published to ${payload.platform}`);
  });
}

function onWorkflowExecuted(payload) {
  return AuditLog.create({
    workspaceId: payload.workspaceId || 'default',
    userId: payload.userId,
    action: 'workflow.executed',
    resourceType: 'Workflow',
    resourceId: String(payload.workflowId || payload._id),
    details: { name: payload.name, nodeCount: payload.nodeCount }
  }).then(() => {
    console.log(`[Events] AuditLog: workflow executed — ${payload.name}`);
  });
}

function onUserInvited(payload) {
  return Notification.create({
    userId: payload.invitedUserId,
    workspaceId: String(payload.workspaceId),
    title: 'Workspace Invitation',
    message: `You have been invited to join workspace as ${payload.role}.`,
    type: 'info',
    actionUrl: payload.actionUrl || null
  }).then(() => {
    console.log(`[Events] Notification: user invited — ${payload.invitedUserId}`);
  });
}

function registerAllHandlers() {
  eventBus.on(EVENT_NAMES.PROJECT_CREATED, onProjectCreated);
  eventBus.on(EVENT_NAMES.PROJECT_DELETED, onProjectDeleted);
  eventBus.on(EVENT_NAMES.BRANDKIT_UPDATED, onBrandKitUpdated);
  eventBus.on(EVENT_NAMES.AI_JOB_COMPLETED, onAiJobCompleted);
  eventBus.on(EVENT_NAMES.AI_JOB_FAILED, onAiJobFailed);
  eventBus.on(EVENT_NAMES.WORKSPACE_CREATED, onWorkspaceCreated);
  eventBus.on(EVENT_NAMES.CONTENT_PUBLISHED, onContentPublished);
  eventBus.on(EVENT_NAMES.WORKFLOW_EXECUTED, onWorkflowExecuted);
  eventBus.on(EVENT_NAMES.USER_INVITED, onUserInvited);
  console.log('[Events] All event handlers registered');
}

module.exports = { registerAllHandlers };
