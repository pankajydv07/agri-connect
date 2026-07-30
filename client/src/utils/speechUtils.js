// src/utils/speechUtils.js
//
// Browser-side recording helpers. Transcription and synthesis are proxied by
// our server so that no speech-provider API key is ever shipped to the client.
import api, { resolveApiUrl } from './api';

// Start recording audio
export const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];
      
      return new Promise((resolve, reject) => {
        mediaRecorder.ondataavailable = (e) => {
          audioChunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          resolve({ audioBlob, stream });
        };
        
        mediaRecorder.onerror = (err) => {
          reject(err);
        };
        
        mediaRecorder.start();
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  };
  
  // Stop recording and clean up
  export const stopRecording = (mediaRecorder, stream) => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      
      // Stop all audio tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  
  // Transcribe audio via our server (which holds the speech provider key).
  export const transcribeAudio = async (audioBlob, language = 'en-US') => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('language', language);

    const { data } = await api.post('/api/speech/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (!data || !data.transcript) {
      throw new Error('No transcript returned');
    }

    return data.transcript;
  };

  // Convert text to speech via our server (which holds the TTS provider key).
  export const textToSpeech = async (text, language = 'en-US') => {
    const { data } = await api.post('/api/speak', { message: text, language });

    if (!data || !data.file) {
      throw new Error('Failed to get speech synthesis');
    }

    return resolveApiUrl(data.file);
  };
