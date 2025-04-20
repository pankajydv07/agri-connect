const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const path = require('path');

// Load the Google credentials JSON file
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: 'key.json', // <-- Update this with your actual key file path
});

// Voice configurations for different languages
const voiceConfigs = {
  'en-US': {
    languageCode: 'en-US',
    name: 'en-US-Neural2-F',
    ssmlGender: 'FEMALE'
  },
  'hi-IN': {
    languageCode: 'hi-IN',
    name: 'hi-IN-Neural2-A',
    ssmlGender: 'FEMALE'
  },
  'te-IN': {
    languageCode: 'te-IN',
    name: 'te-IN-Standard-A',
    ssmlGender: 'FEMALE'
  }
};

const convertTextToSpeech = async (text, filename = 'output.mp3', language = 'en-US') => {
  try {
    console.log('Converting text to speech:', text);
    console.log('Language:', language);
    
    // Get voice configuration based on language
    const voiceConfig = voiceConfigs[language] || voiceConfigs['en-US'];
    console.log('Using voice config:', voiceConfig);
    
    const request = {
      input: { text },
      voice: voiceConfig,
      audioConfig: { 
        audioEncoding: 'MP3',
        pitch: 0,
        speakingRate: 1.0
      },
    };

    console.log('Sending request to Google TTS');
    const [response] = await client.synthesizeSpeech(request);
    console.log('Received response from Google TTS');

    const writeFile = util.promisify(fs.writeFile);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    
    const filePath = path.join(uploadsDir, filename);
    console.log('Writing audio file to:', filePath);
    
    await writeFile(filePath, response.audioContent, 'binary');
    console.log('Audio file written successfully');
    
    return filename;
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    throw error;
  }
};

module.exports = convertTextToSpeech; 