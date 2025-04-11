// cloudConfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary configuration using environment variables
cloudinary.config({
    cloud_name: process.env.CLOUD,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Define storage strategy with Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agri_connect_uploads',  // customize folder name
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});

module.exports = { cloudinary, storage };
