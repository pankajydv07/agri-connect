// src/utils/speechUtils.js

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
  
  // Transcribe audio using AssemblyAI
  export const transcribeAudio = async (audioBlob, apiKey) => {
    // First upload the audio file
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': apiKey
      },
      body: audioBlob
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio');
    }
    
    const { upload_url } = await uploadResponse.json();
    
    // Then request transcription
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ audio_url: upload_url })
    });
    
    if (!transcriptResponse.ok) {
      throw new Error('Failed to request transcription');
    }
    
    const { id } = await transcriptResponse.json();
    
    // Poll for transcription result
    let attempts = 0;
    const maxAttempts = 60; // Maximum polling attempts (60 seconds)
    
    while (attempts < maxAttempts) {
      const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { 
          'authorization': apiKey
        }
      });
      
      if (!pollingResponse.ok) {
        throw new Error('Failed to poll for transcription');
      }
      
      const data = await pollingResponse.json();
      
      if (data.status === 'completed') {
        return data.text;
      } else if (data.status === 'error') {
        throw new Error('Transcription failed: ' + data.error);
      }
      
      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('Transcription timed out');
  };
  
  // Convert text to speech using ElevenLabs
  export const textToSpeech = async (text, apiKey) => {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream", {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get speech synthesis');
    }
    
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  };
  