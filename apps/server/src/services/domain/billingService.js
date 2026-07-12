const Workspace = require('../../models/Workspace');
const AuditLog = require('../../models/AuditLog');

async function getCreditsBalance(workspaceId) {
  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  return {
    workspaceId: workspace._id,
    balance: workspace.creditsBalance,
    plan: workspace.plan
  };
}

async function deductCredits(workspaceId, amount, reason) {
  if (amount <= 0) {
    throw new Error('Deduction amount must be positive');
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }
  if (workspace.creditsBalance < amount) {
    throw new Error(`Insufficient credits. Balance: ${workspace.creditsBalance}, Required: ${amount}`);
  }

  workspace.creditsBalance -= amount;
  await workspace.save();

  await AuditLog.create({
    workspaceId: String(workspace._id),
    action: 'credits.deducted',
    resourceType: 'Workspace',
    resourceId: String(workspace._id),
    details: {
      amount,
      reason,
      balanceBefore: workspace.creditsBalance + amount,
      balanceAfter: workspace.creditsBalance
    }
  });

  return {
    workspaceId: workspace._id,
    deducted: amount,
    balance: workspace.creditsBalance,
    reason
  };
}

async function addCredits(workspaceId, amount, reason) {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive');
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  workspace.creditsBalance += amount;
  await workspace.save();

  await AuditLog.create({
    workspaceId: String(workspace._id),
    action: 'credits.added',
    resourceType: 'Workspace',
    resourceId: String(workspace._id),
    details: {
      amount,
      reason,
      balanceBefore: workspace.creditsBalance - amount,
      balanceAfter: workspace.creditsBalance
    }
  });

  return {
    workspaceId: workspace._id,
    added: amount,
    balance: workspace.creditsBalance,
    reason
  };
}

async function getCreditHistory(workspaceId) {
  const history = await AuditLog.find({
    workspaceId: String(workspaceId),
    action: { $in: ['credits.deducted', 'credits.added'] }
  })
    .sort({ createdAt: -1 })
    .lean();

  return history;
}

module.exports = {
  getCreditsBalance,
  deductCredits,
  addCredits,
  getCreditHistory
};
