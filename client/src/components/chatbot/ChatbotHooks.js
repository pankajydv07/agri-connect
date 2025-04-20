import { useState, useEffect, useCallback, useRef } from 'react';
import OpenAI from 'openai';
import { OPENAI_MODEL } from './ChatbotConfig';
import axios from 'axios';

/**
 * Custom hook for managing OpenAI API interactions
 */
export const useOpenAI = (apiKey, baseURL) => {
  const openai = useRef(null);

  // Initialize OpenAI client
  useEffect(() => {
    if (!apiKey || !baseURL) return;
    
    openai.current = new OpenAI({
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: true
    });
  }, [apiKey, baseURL]);

  // Function to generate AI response
  const generateResponse = useCallback(async (messages, functions) => {
    if (!openai.current) {
      throw new Error('OpenAI client not initialized');
    }

    const options = {
      model: OPENAI_MODEL,
      messages,
      temperature: 0.7,
      top_p: 1.0,
      max_tokens: 500
    };

    // Add function calling if functions are provided
    if (functions && functions.length > 0) {
      options.tools = functions.map(def => ({
        type: 'function',
        function: def
      }));
    }

    return await openai.current.chat.completions.create(options);
  }, []);

  return { generateResponse };
};

/**
 * Custom hook for managing speech-to-text functionality with multiple providers
 */
export const useSpeechToText = (assemblyAiKey, onTranscriptionComplete, onError) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const audioStreamRef = useRef(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [transcriptStatus, setTranscriptStatus] = useState('');
  const [speechProvider, setSpeechProvider] = useState('google'); // 'google' or 'assemblyai'
  const [recognitionLanguage, setRecognitionLanguage] = useState('en-US');

  // Clean up function
  useEffect(() => {
    return () => {
      stopRecording();
      clearTimeout(recordingTimeoutRef.current);
      clearInterval(recordingTimerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Function to set speech recognition language
  const setLanguage = useCallback((language) => {
    let langCode;
    
    switch(language) {
      case 'hindi':
        langCode = 'hi-IN';
        break;
      case 'telugu':
        langCode = 'te-IN';
        break;
      case 'english':
      default:
        langCode = 'en-US';
    }
    
    setRecognitionLanguage(langCode);
    return langCode;
  }, []);

  // Function to change speech provider
  const changeProvider = useCallback((provider) => {
    if (provider === 'google' || provider === 'assemblyai') {
      setSpeechProvider(provider);
    }
  }, []);

  // Google Cloud Speech Transcription
  const transcribeWithGoogle = useCallback(async (audioBlob) => {
    try {
      setTranscriptStatus('processing');
      
      // Create a FormData object to send the audio
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', recognitionLanguage);
      
      // Send to our server endpoint
      const response = await axios.post('/api/speech/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.transcript) {
        setTranscriptStatus('completed');
        return response.data.transcript;
      } else {
        throw new Error('No transcript returned');
      }
    } catch (error) {
      setTranscriptStatus('error');
      throw error;
    }
  }, [recognitionLanguage]);

  // AssemblyAI Transcription
  const transcribeWithAssemblyAI = useCallback(async (audioBlob) => {
    try {
      setTranscriptStatus('processing');
      
      // Upload the audio file
      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: { authorization: assemblyAiKey },
        body: audioBlob
      });
      
      const { upload_url } = await uploadRes.json();

      // Request the transcription
      const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          authorization: assemblyAiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({ 
          audio_url: upload_url,
          language_code: recognitionLanguage.split('-')[0] // Convert "en-US" to "en"
        })
      });

      const { id } = await transcriptRes.json();
      
      setTranscriptStatus('transcribing');

      // Poll for results
      let transcriptText = "";
      while (true) {
        const polling = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
          headers: { authorization: assemblyAiKey }
        });
        
        const data = await polling.json();

        if (data.status === "completed") {
          transcriptText = data.text || "";
          break;
        } else if (data.status === "failed") {
          throw new Error('Transcription failed');
        }
        
        // Wait before polling again
        await new Promise(r => setTimeout(r, 2000));
      }

      setTranscriptStatus('completed');
      return transcriptText;
    } catch (error) {
      setTranscriptStatus('error');
      throw error;
    }
  }, [assemblyAiKey, recognitionLanguage]);

  // Function to start recording
  const startRecording = useCallback(async (timeoutMs, language = null) => {
    try {
      // Update language if provided
      if (language) {
        setLanguage(language);
      }
      
      setIsRecording(true);
      setRecordingTimer(0);
      setTranscriptStatus('listening');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Choose the transcription provider
          let transcriptText = "";
          if (speechProvider === 'google') {
            transcriptText = await transcribeWithGoogle(audioBlob);
          } else {
            transcriptText = await transcribeWithAssemblyAI(audioBlob);
          }
          
          // Stop all tracks on the stream
          if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
          }
          
          onTranscriptionComplete(transcriptText);
        } catch (err) {
          console.error("Transcription error:", err);
          onError(err);
        }
      };

      mediaRecorderRef.current.start(1000); // Collect data in 1-second chunks

      // Start a timer
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, timeoutMs);

      // Update the timer every second
      recordingTimerRef.current = setInterval(() => {
        setRecordingTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } catch (error) {
      setIsRecording(false);
      setRecordingTimer(0);
      setTranscriptStatus('error');
      onError(error);
    }
  }, [transcribeWithGoogle, transcribeWithAssemblyAI, speechProvider, onTranscriptionComplete, onError, setLanguage]);

  // Function to stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      clearTimeout(recordingTimeoutRef.current);
      clearInterval(recordingTimerRef.current);
      
      setIsRecording(false);
      setRecordingTimer(0);
    }
  }, []);

  return {
    isRecording,
    recordingTimer,
    transcriptStatus,
    recognitionLanguage,
    startRecording,
    stopRecording,
    setLanguage,
    changeProvider
  };
};

/**
 * Custom hook for managing text-to-speech functionality
 */
export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(null);
  const audioRef = useRef(null);

  // Map chatbot language codes to Google TTS language codes
  const getTTSLanguageCode = (language) => {
    switch(language) {
      case 'hindi':
        return 'hi-IN';
      case 'telugu':
        return 'te-IN';
      case 'english':
      default:
        return 'en-US';
    }
  };

  const speakText = async (text, maxLength, messageIndex, language = 'english') => {
    if (!text) return;
    
    try {
      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsSpeaking(true);
      setCurrentSpeakingIndex(messageIndex);
      
      // Truncate text if it exceeds maxLength
      const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
      
      // Get the correct TTS language code
      const ttsLanguage = getTTSLanguageCode(language);
      console.log('Sending text to TTS:', truncatedText);
      console.log('Language:', language, 'TTS Language:', ttsLanguage);
      
      const response = await fetch('http://localhost:5000/api/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: truncatedText,
          language: ttsLanguage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      console.log('Received audio file:', data.file);
      
      // Create a new audio element
      const audio = new Audio();
      audioRef.current = audio;
      
      // Set up event listeners
      audio.oncanplaythrough = () => {
        console.log('Audio is ready to play');
        audio.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsSpeaking(false);
          setCurrentSpeakingIndex(null);
        });
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        setIsSpeaking(false);
        setCurrentSpeakingIndex(null);
      };
      
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
        setCurrentSpeakingIndex(null);
      };
      
      // Set the source and start loading
      audio.src = data.file;
      
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentSpeakingIndex(null);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { isSpeaking, currentSpeakingIndex, speakText, stopSpeaking };
};

/**
 * Custom hook for managing chat messages
 */
export const useChatMessages = (initialGreeting) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: initialGreeting }
  ]);

  // Update greeting when language changes
  useEffect(() => {
    if (initialGreeting) {
      setMessages([{ role: 'assistant', content: initialGreeting }]);
    }
  }, [initialGreeting]);

  // Add a user message
  const addUserMessage = useCallback((content) => {
    setMessages(prevMessages => [
      ...prevMessages.filter(msg => !msg.isRecording),
      { role: 'user', content }
    ]);
  }, []);

  // Add an assistant message
  const addAssistantMessage = useCallback((content, toolCalls = null) => {
    const message = { role: 'assistant', content };
    if (toolCalls) {
      message.tool_calls = toolCalls;
    }
    setMessages(prevMessages => [
      ...prevMessages.filter(msg => !msg.isRecording),
      message
    ]);
    return message;
  }, []);

  // Add a tool/function response message
  const addToolMessage = useCallback((toolCallId, content) => {
    const message = { 
      role: 'tool', 
      tool_call_id: toolCallId, 
      content: typeof content === 'string' ? content : JSON.stringify(content)
    };
    setMessages(prevMessages => [...prevMessages, message]);
    return message;
  }, []);

  // Add or update a temporary message (like for recording status)
  const updateTemporaryMessage = useCallback((content, isRecording = true) => {
    setMessages(prevMessages => {
      // Check if there's already a recording message
      const recordingMsgIndex = prevMessages.findIndex(msg => msg.isRecording);
      
      if (recordingMsgIndex >= 0) {
        // Update existing recording message
        const newMessages = [...prevMessages];
        newMessages[recordingMsgIndex] = { 
          role: 'user', 
          content, 
          isRecording 
        };
        return newMessages;
      } else {
        // Add new recording message
        return [
          ...prevMessages,
          { role: 'user', content, isRecording }
        ];
      }
    });
  }, []);

  // Remove temporary messages
  const removeTemporaryMessages = useCallback(() => {
    setMessages(prevMessages => prevMessages.filter(msg => !msg.isRecording));
  }, []);

  return {
    messages,
    addUserMessage,
    addAssistantMessage,
    addToolMessage,
    updateTemporaryMessage,
    removeTemporaryMessages
  };
};

/**
 * Custom hook for function calling capabilities
 */
export const useFunctionCalling = (availableFunctions) => {
  // Execute a function call
  const executeFunction = useCallback(async (functionCall) => {
    const functionName = functionCall.function.name;
    const functionArgs = JSON.parse(functionCall.function.arguments);
    
    if (functionName in availableFunctions) {
      return await availableFunctions[functionName](functionArgs);
    }
    
    throw new Error(`Function ${functionName} is not implemented`);
  }, [availableFunctions]);

  return { executeFunction };
};