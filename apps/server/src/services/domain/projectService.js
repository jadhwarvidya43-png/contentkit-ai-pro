const Project = require('../../models/Project');
const { eventBus, EVENT_NAMES } = require('../eventBus');

async function createProject(data) {
  const project = await Project.create(data);
  eventBus.emit(EVENT_NAMES.PROJECT_CREATED, {
    projectId: project._id,
    title: project.title,
    userId: project.userId,
    workspaceId: data.workspaceId || 'default'
  });
  return project;
}

async function getProjectsByWorkspace(workspaceId, filters = {}) {
  const query = {};

  if (workspaceId && workspaceId !== 'default') {
    query.workspaceId = workspaceId;
  }
  if (filters.userId) {
    query.userId = filters.userId;
  }
  if (filters.folder) {
    query.folder = filters.folder;
  }
  if (filters.isFavorite !== undefined) {
    query.isFavorite = filters.isFavorite;
  }
  if (filters.isArchived !== undefined) {
    query.isArchived = filters.isArchived;
  } else {
    query.isArchived = false;
  }
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  if (filters.search) {
    query.title = { $regex: filters.search, $options: 'i' };
  }

  const page = parseInt(filters.page, 10) || 1;
  const limit = parseInt(filters.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const sort = filters.sort || { createdAt: -1 };

  const [projects, total] = await Promise.all([
    Project.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Project.countDocuments(query)
  ]);

  return { projects, total, page, pages: Math.ceil(total / limit) };
}

async function getProjectById(id) {
  const project = await Project.findById(id);
  if (!project) {
    throw new Error(`Project not found: ${id}`);
  }
  return project;
}

async function updateProject(id, updates) {
  const project = await Project.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });
  if (!project) {
    throw new Error(`Project not found: ${id}`);
  }
  return project;
}

async function deleteProject(id) {
  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    throw new Error(`Project not found: ${id}`);
  }
  eventBus.emit(EVENT_NAMES.PROJECT_DELETED, {
    projectId: project._id,
    title: project.title,
    userId: project.userId
  });
  return project;
}

async function toggleFavorite(id) {
  const project = await Project.findById(id);
  if (!project) {
    throw new Error(`Project not found: ${id}`);
  }
  project.isFavorite = !project.isFavorite;
  await project.save();
  return project;
}

async function archiveProject(id) {
  const project = await Project.findById(id);
  if (!project) {
    throw new Error(`Project not found: ${id}`);
  }
  project.isArchived = !project.isArchived;
  await project.save();
  return project;
}

module.exports = {
  createProject,
  getProjectsByWorkspace,
  getProjectById,
  updateProject,
  deleteProject,
  toggleFavorite,
  archiveProject
};
