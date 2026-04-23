const cloudinary = require('cloudinary').v2;
const { env } = require('./env');

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.Cloudname,
  api_key: env.APIKey,
  api_secret: env.APISecret
});

// Test the configuration
const testCloudinaryConnection = () => {
  if (!env.Cloudname || 
      !env.APIKey || 
      !env.APISecret) {
    console.warn('⚠️ Cloudinary credentials not configured. Image upload will not work.');
    console.warn('Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env file');
    return false;
  }
  console.log('✅ Cloudinary configured successfully');
  return true;
};

// Upload image to Cloudinary
const uploadToCloudinary = async (fileBuffer, folder = 'recipenest') => {
  try {
    if (!testCloudinaryConnection()) {
      throw new Error('Cloudinary not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format
            });
          }
        }
      );
      
      // Pass the buffer to the upload stream
      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!testCloudinaryConnection()) {
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

// Upload base64 image (for testing)
const uploadBase64Image = async (base64String, folder = 'recipenest') => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  testCloudinaryConnection,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadBase64Image
};