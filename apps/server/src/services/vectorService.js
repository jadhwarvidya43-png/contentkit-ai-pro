const VectorDocument = require('../models/VectorDocument');

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'was', 'were',
  'are', 'been', 'has', 'had', 'have', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'this',
  'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they',
  'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our',
  'their', 'what', 'which', 'who', 'whom', 'not', 'no', 'nor', 'so',
  'if', 'then', 'than', 'too', 'very', 'just', 'about', 'up', 'out',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'only', 'own', 'same', 'also', 'how', 'after',
  'before', 'between', 'through', 'during', 'above', 'below', 'into'
]);

function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function computeTFIDF(tokens, corpus) {
  const totalDocs = corpus.length;
  const tf = {};
  const tokenCount = tokens.length;

  if (tokenCount === 0) return {};

  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }

  const vector = {};
  for (const token of Object.keys(tf)) {
    const termFreq = tf[token] / tokenCount;
    let docFreq = 0;
    for (const doc of corpus) {
      if (doc.includes(token)) {
        docFreq++;
      }
    }
    const idf = Math.log((totalDocs + 1) / (docFreq + 1)) + 1;
    vector[token] = termFreq * idf;
  }

  return vector;
}

function cosineSimilarity(vecA, vecB) {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const key of allKeys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;
  return dot / magnitude;
}

async function indexDocument({ workspaceId, sourceType, sourceId, content, metadata = {} }) {
  const tokens = tokenize(content);
  const doc = await VectorDocument.findOneAndUpdate(
    { sourceId },
    {
      workspaceId,
      sourceType,
      sourceId,
      content,
      tokens,
      metadata
    },
    { upsert: true, new: true }
  );
  console.log(`[Vector] Indexed document ${sourceId} (${tokens.length} tokens)`);
  return doc;
}

async function search({ workspaceId, query, topK = 5, sourceType = null }) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const filter = { workspaceId };
  if (sourceType) filter.sourceType = sourceType;

  const docs = await VectorDocument.find(filter).lean();
  if (docs.length === 0) return [];

  const corpus = docs.map((d) => d.tokens);
  const queryVec = computeTFIDF(queryTokens, corpus);

  const scored = docs.map((doc) => {
    const docVec = computeTFIDF(doc.tokens, corpus);
    const score = cosineSimilarity(queryVec, docVec);
    return {
      sourceId: doc.sourceId,
      sourceType: doc.sourceType,
      metadata: doc.metadata,
      score,
      snippet: doc.content.substring(0, 200)
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).filter((r) => r.score > 0);
}

async function deleteBySource(sourceId) {
  const result = await VectorDocument.deleteMany({ sourceId });
  console.log(`[Vector] Deleted documents for source ${sourceId}: ${result.deletedCount}`);
  return result.deletedCount;
}

module.exports = {
  tokenize,
  computeTFIDF,
  cosineSimilarity,
  indexDocument,
  search,
  deleteBySource
};
