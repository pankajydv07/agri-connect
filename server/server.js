const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Import multer for file uploads
const multer = require('multer');
const fs = require('fs');
const { SpeechClient } = require('@google-cloud/speech');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Configure Google Cloud Speech client
const speechClient = new SpeechClient({
  keyFilename: path.join(__dirname, 'google-credentials.json'),
});

// Configure upload middleware for audio files
const audioUpload = multer({ 
  dest: path.join(__dirname, 'uploads/audio/'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Speech-to-text API endpoint
app.post('/api/speech/transcribe', audioUpload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const filePath = req.file.path;
    const audioBytes = fs.readFileSync(filePath);
    const audio = { content: audioBytes.toString('base64') };
    
    // Get language from request or default to English
    const language = req.body.language || 'en-US';
    
    // Configure speech recognition
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: language,
      model: 'default',
      audioChannelCount: 1,
      enableAutomaticPunctuation: true,
      useEnhanced: true
    };
    
    const request = { audio, config };
    
    // Perform speech recognition
    const [response] = await speechClient.recognize(request);
    
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    // Delete the temporary file
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temporary file:', err);
    });
    
    res.json({ transcript: transcription });
  } catch (err) {
    console.error('Speech recognition error:', err);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
