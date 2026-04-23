const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (store files in memory as buffers)
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif, webp, bmp)'));
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files at once
  },
  fileFilter: fileFilter
});

// Single file upload middleware
const uploadSingle = (fieldName = 'image') => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Upload multiple different fields
const uploadFields = (fields) => {
  return upload.fields(fields);
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields
};