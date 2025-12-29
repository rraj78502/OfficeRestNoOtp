const path = require('path');
const {
  uploadToLocal,
  deleteLocalFile,
  ensureFolderExists,
  getFileUrl,
} = require('../utils/localStorage');

const getSubfolderByMimeType = mimetype => {
  if (!mimetype) return 'Others';
  if (mimetype.startsWith('image/')) return 'Images';
  if (mimetype.startsWith('video/')) return 'Videos';
  if (
    mimetype === 'application/pdf' ||
    mimetype.includes('word')
  ) return 'Documents';
  return 'Others';
};

const buildFolderName = (context = 'General', mimetype) => {
  const safeContext = context || 'General';
  const subfolder = getSubfolderByMimeType(mimetype);
  return path.join(safeContext, subfolder);
};

const uploadFileWithFolderLogic = async (filePath, mimetype, context = 'General') => {
  const folderName = buildFolderName(context, mimetype);
  const result = await uploadToLocal(filePath, folderName);
  return {
    ...result,
    path: result.relativePath,
  };
};

const deleteFileFromStorage = async reference => {
  await deleteLocalFile(reference);
};

module.exports = {
  uploadFileWithFolderLogic,
  deleteFileFromStorage,
  ensureFolderExists,
  getFileUrl,
};
