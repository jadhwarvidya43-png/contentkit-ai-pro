const Project = require('../../models/Project');
const { generateCampaign } = require('../ai/gateway');

async function generateContent({ projectId, sourceText, brandKit = null, model = 'gpt-4o', targetLanguage = 'English' }) {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const textToProcess = sourceText || project.extractedText || project.inputData;
  if (!textToProcess) {
    throw new Error('No source text available for content generation');
  }

  const result = await generateCampaign(textToProcess, brandKit, model, targetLanguage);

  const contentVersion = {
    ...result,
    generatedAt: new Date().toISOString(),
    targetLanguage,
    model
  };

  // Store current generation as top-level, push to history
  const history = project.generatedContent.history || [];
  if (project.generatedContent.generatedAt) {
    history.push({
      generatedAt: project.generatedContent.generatedAt,
      targetLanguage: project.generatedContent.targetLanguage || 'English',
      model: project.generatedContent.model || 'unknown'
    });
  }

  project.generatedContent = { ...contentVersion, history };
  await project.save();

  return project.generatedContent;
}

async function translateContent(projectId, targetLanguage) {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const sourceText = project.extractedText || project.inputData;
  const model = project.generatedContent.metadata?.modelUsed || 'gpt-4o';

  return generateContent({
    projectId,
    sourceText,
    brandKit: null,
    model,
    targetLanguage
  });
}

async function getContentHistory(projectId) {
  const project = await Project.findById(projectId).lean();
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const history = project.generatedContent?.history || [];
  const current = project.generatedContent?.generatedAt
    ? {
        generatedAt: project.generatedContent.generatedAt,
        targetLanguage: project.generatedContent.targetLanguage,
        model: project.generatedContent.model
      }
    : null;

  const versions = current ? [...history, current] : history;
  return versions.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
}

module.exports = {
  generateContent,
  translateContent,
  getContentHistory
};
