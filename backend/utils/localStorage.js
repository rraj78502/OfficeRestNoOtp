const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const uploadsRoot = path.join(projectRoot, 'uploads');

const getBaseUrl = () => (process.env.BASE_URL || '').replace(/\/$/, '');

const toAbsolutePath = filePath =>
  path.isAbsolute(filePath) ? filePath : path.join(projectRoot, filePath);

const toRelativeUrlPath = absolutePath => {
  const relativePath = path.relative(projectRoot, absolutePath);
  return `/${relativePath.split(path.sep).join('/')}`;
};

const sanitizeFolderName = folderName =>
  folderName
    .split(/[\\/]/)
    .map(segment => segment.trim())
    .filter(Boolean)
    .join(path.sep);

const ensureFolderExists = async folderPath => {
  const absoluteFolder = path.isAbsolute(folderPath)
    ? folderPath
    : path.join(uploadsRoot, sanitizeFolderName(folderPath || ''));
  await fsp.mkdir(absoluteFolder, { recursive: true });
  return absoluteFolder;
};

const uploadToLocal = async (filePath, folderName = '') => {
  if (!filePath) throw new Error('File path is required for local upload');

  const sourcePath = toAbsolutePath(filePath);
  const fileName = path.basename(sourcePath);
  const destinationFolder = await ensureFolderExists(folderName);
  const destinationPath = path.join(destinationFolder, fileName);

  await fsp.rename(sourcePath, destinationPath);

  const relativePath = toRelativeUrlPath(destinationPath);
  return {
    fileName,
    absolutePath: destinationPath,
    relativePath,
    url: getFileUrl(relativePath),
  };
};

const stripBaseUrl = reference => {
  if (!reference) return '';
  const baseUrl = getBaseUrl();
  if (baseUrl && reference.startsWith(baseUrl)) {
    return reference.slice(baseUrl.length);
  }
  return reference;
};

const resolveUploadsPath = reference => {
  if (!reference) return null;

  let cleaned = stripBaseUrl(reference.trim());

  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const parsed = new URL(cleaned);
      cleaned = parsed.pathname || '';
    } catch (_) {
      return null;
    }
  }

  cleaned = cleaned.replace(/^\/+/, '');

  if (!cleaned.startsWith('uploads')) {
    return null;
  }

  return path.join(projectRoot, cleaned);
};

const deleteLocalFile = async reference => {
  const absolutePath = resolveUploadsPath(reference);
  if (!absolutePath) return;

  try {
    await fsp.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const getFileUrl = relativePath => {
  if (!relativePath) return '';
  const normalized = relativePath.startsWith('/')
    ? relativePath
    : `/${relativePath.replace(/^\/+/, '')}`;
  const baseUrl = getBaseUrl();
  return baseUrl ? `${baseUrl}${normalized}` : normalized;
};

module.exports = {
  uploadToLocal,
  deleteLocalFile,
  getFileUrl,
  ensureFolderExists,
};
