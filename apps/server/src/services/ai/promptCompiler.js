'use strict';

const OUTPUT_SCHEMA = `{
  "metadata": { "modelUsed": "String", "targetLanguage": "String", "tokenCount": "Number", "costUSD": "Number" },
  "analysis": { "mainTopic": "String", "subtopics": ["String"], "audience": "String", "tone": "String", "style": "String", "painPoints": ["String"] },
  "twitter": { "threads": [{ "title": "String", "tweets": ["String"] }], "tweetIdeas": ["String"], "viralHooks": ["String"] },
  "linkedin": { "posts": ["String"], "carouselOutline": ["String"] },
  "blog": { "seoTitle": "String", "metaDescription": "String", "outline": ["String"], "faqs": [{ "question": "String", "answer": "String" }], "internalLinks": ["String"] },
  "newsletter": { "subject": "String", "introduction": "String", "ctaText": "String" },
  "videoClips": [{ "title": "String", "score": "Number", "transcript": "String", "subtitles": [{ "text": "String", "time": "String" }] }],
  "otherPlatforms": { "substack": "String", "reddit": "String" },
  "seoEngine": { "readabilityScore": "Number", "keywordDensity": [{ "keyword": "String", "density": "String" }], "keywords": [{ "word": "String", "difficulty": "String", "volume": "String" }] }
}`;

/**
 * Compiles the system and user messages for a campaign generation prompt.
 *
 * @param {object} params
 * @param {string} params.sourceText – raw content to repurpose
 * @param {object} [params.brandKit] – brand context object
 * @param {string} [params.targetLanguage] – output language, default 'English'
 * @param {string} [params.outputSchema] – custom JSON schema override
 * @returns {{ systemMessage: string, userMessage: string }}
 */
function compilePrompt({ sourceText, brandKit, targetLanguage = 'English', outputSchema }) {
  const brand = brandKit || {};
  const brandName = brand.brandName || 'ContentKit';
  const style = brand.writingStyle || 'Professional & Persuasive';
  const audience = brand.targetAudience || 'Digital Marketers';
  const cta = (brand.products && brand.products.length > 0)
    ? brand.products[0].cta
    : 'Get started today';

  const schema = outputSchema || OUTPUT_SCHEMA;

  const systemMessage = [
    'You are an expert marketing copywriter and content strategist.',
    'Your task is to take input source text and repurpose it into a complete, high-quality, multi-platform marketing campaign.',
    '',
    '## Formatting Rules',
    '- Output ONLY valid JSON matching the schema below. No markdown, no commentary.',
    '- Every string field must contain substantive, publication-ready content.',
    '- Twitter threads should have 4-6 tweets each. LinkedIn posts should be 150-300 words.',
    '',
    '## Brand Context',
    `- Brand Name: ${brandName}`,
    `- Writing Style: ${style}`,
    `- Target Audience: ${audience}`,
    `- Call To Action: ${cta}`,
    '',
    `## Target Language: ${targetLanguage}`,
    '',
    '## JSON Output Schema',
    schema,
  ].join('\n');

  const userMessage = `Repurpose the following source text into a full marketing campaign:\n\n${sourceText}`;

  return { systemMessage, userMessage };
}

module.exports = { compilePrompt };
