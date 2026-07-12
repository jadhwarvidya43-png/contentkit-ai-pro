const Workspace = require('../../models/Workspace');
const WorkspaceMember = require('../../models/WorkspaceMember');
const { eventBus, EVENT_NAMES } = require('../eventBus');

async function createWorkspace({ name, ownerId }) {
  const workspace = await Workspace.create({ name, ownerId });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: ownerId,
    role: 'owner'
  });

  eventBus.emit(EVENT_NAMES.WORKSPACE_CREATED, {
    workspaceId: workspace._id,
    name: workspace.name,
    ownerId
  });

  return workspace;
}

async function getWorkspace(id) {
  const workspace = await Workspace.findById(id);
  if (!workspace) {
    throw new Error(`Workspace not found: ${id}`);
  }
  return workspace;
}

async function getUserWorkspaces(userId) {
  const memberships = await WorkspaceMember.find({ userId }).lean();
  const workspaceIds = memberships.map((m) => m.workspaceId);
  const workspaces = await Workspace.find({ _id: { $in: workspaceIds } }).lean();

  return workspaces.map((ws) => {
    const membership = memberships.find(
      (m) => String(m.workspaceId) === String(ws._id)
    );
    return { ...ws, role: membership ? membership.role : 'viewer' };
  });
}

async function inviteMember({ workspaceId, userId, role = 'editor', invitedBy }) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const existing = await WorkspaceMember.findOne({ workspaceId, userId });
  if (existing) {
    throw new Error('User is already a member of this workspace');
  }

  const member = await WorkspaceMember.create({
    workspaceId,
    userId,
    role,
    invitedBy
  });

  eventBus.emit(EVENT_NAMES.USER_INVITED, {
    workspaceId,
    invitedUserId: userId,
    role,
    invitedBy
  });

  return member;
}

async function removeMember(workspaceId, userId) {
  const member = await WorkspaceMember.findOne({ workspaceId, userId });
  if (!member) {
    throw new Error('Member not found in workspace');
  }
  if (member.role === 'owner') {
    throw new Error('Cannot remove workspace owner');
  }
  await WorkspaceMember.deleteOne({ _id: member._id });
  return { removed: true, userId, workspaceId };
}

async function updateMemberRole(workspaceId, userId, role) {
  const member = await WorkspaceMember.findOneAndUpdate(
    { workspaceId, userId },
    { role },
    { new: true }
  );
  if (!member) {
    throw new Error('Member not found in workspace');
  }
  return member;
}

module.exports = {
  createWorkspace,
  getWorkspace,
  getUserWorkspaces,
  inviteMember,
  removeMember,
  updateMemberRole
};
