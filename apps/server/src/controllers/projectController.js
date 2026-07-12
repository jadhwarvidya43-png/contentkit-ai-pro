const asyncHandler = require('express-async-handler');
const projectService = require('../services/domain/projectService');
const contentService = require('../services/domain/contentService');
const brandService = require('../services/domain/brandService');

// Simulate extraction with Whisper + Diarization + Silence logs
const extractTextWithDiarization = async (inputType, inputData) => {
  if (inputType === 'text') return inputData;
  
  // Return speaker diarized transcript mock
  return `Speaker 1 [0:00]: Hello and welcome. Today we are discussing content distribution.
Speaker 2 [0:15]: Thanks for having me. The biggest challenge brands face is scaling creation without dilution.
Speaker 1 [0:35]: Exactly. Let's look at how visual pipelines can automate this process.`;
};

const createProject = asyncHandler(async (req, res) => {
  const { userId, title, inputType, inputData, brandKitId, modelName, targetLanguage, workspaceId } = req.body;

  if (!userId || !title || !inputType || !inputData) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Get brand kit if supplied
  let brand = null;
  if (brandKitId) {
    try {
      brand = await brandService.getBrandKit(brandKitId);
    } catch (e) {
      // ignore
    }
  }

  const extractedText = await extractTextWithDiarization(inputType, inputData);

  // 1. Create project first (without generated content yet)
  const project = await projectService.createProject({
    userId,
    title,
    inputType,
    inputData,
    extractedText,
    workspaceId: workspaceId || 'default'
  });

  // 2. Generate content via AI Gateway
  await contentService.generateContent({
    projectId: project._id,
    sourceText: extractedText,
    brandKit: brand,
    model: modelName,
    targetLanguage
  });

  // 3. Fetch final project state
  const finalProject = await projectService.getProjectById(project._id);

  res.status(201).json(finalProject);
});

const getProjects = asyncHandler(async (req, res) => {
  const workspaceId = req.query.workspaceId || 'default';
  const filters = {
    userId: req.user._id,
    ...req.query
  };
  const result = await projectService.getProjectsByWorkspace(workspaceId, filters);
  res.json(result.projects);
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  res.json(project);
});

const updateProject = asyncHandler(async (req, res) => {
  const updatedProject = await projectService.updateProject(req.params.id, req.body);
  res.json(updatedProject);
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  res.json({ message: 'Project removed' });
});

const translateContent = asyncHandler(async (req, res) => {
  const { projectId, targetLanguage } = req.body;
  const content = await contentService.translateContent(projectId, targetLanguage);
  res.json({ message: 'Translation successful', generatedContent: content });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  translateContent
};
