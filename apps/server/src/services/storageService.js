const Minio = require('minio');
const config = require('../config');

const minioClient = new Minio.Client({
  endPoint: config.storage?.s3Endpoint || 'localhost',
  port: config.storage?.s3Port || 9000,
  useSSL: config.storage?.s3UseSSL || false,
  accessKey: config.storage?.s3AccessKey || 'minioadmin',
  secretKey: config.storage?.s3SecretKey || 'minioadmin'
});

const BUCKET_NAME = config.storage?.s3Bucket || 'contentkit-uploads';

// Ensure bucket exists
async function initializeBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, config.storage?.s3Region || 'us-east-1');
      console.log(`[Storage] Created bucket ${BUCKET_NAME}`);
    }
  } catch (err) {
    console.error(`[Storage] Failed to initialize bucket ${BUCKET_NAME}`, err);
  }
}

// Call on startup
initializeBucket();

async function uploadFile(buffer, filename, mimetype) {
  const objectName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
    'Content-Type': mimetype
  });
  
  // Return the URL or object key depending on whether it's public
  return {
    objectName,
    url: `/api/v1/content/media/${objectName}` // Internal proxy route
  };
}

async function getFileStream(objectName) {
  return await minioClient.getObject(BUCKET_NAME, objectName);
}

module.exports = {
  uploadFile,
  getFileStream,
  minioClient
};
