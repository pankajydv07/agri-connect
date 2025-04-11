const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Allow only images
  const filetypes = /jpeg|jpg|png|gif|webp/;
  
  // Check the file's MIME type
  const mimetype = filetypes.test(file.mimetype);
  
  // Check the file extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    console.log('File rejected:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB
  fileFilter: fileFilter
});

module.exports = upload;
