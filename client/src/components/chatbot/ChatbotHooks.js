import { useState, useEffect, useCallback, useRef } from 'react';
import api, { resolveApiUrl } from '../../utils/api';

/**
 * Normalize the assistant payload returned by POST /api/ai/chat.
 *
 * The server owns the provider credentials and the model choice; the browser
 * only ever sees `{ success, data: { message, toolCalls } }`.
 */
const normalizeAssistantMessage = (data) => {
  const raw = data?.message;
  const content =
    typeof raw === 'string' ? raw : raw?.content ?? '';

  return {
    content,
    toolCalls: data?.toolCalls || raw?.tool_calls || []
  };
};

/**
 * Custom hook for talking to the server-side AI proxy.
 *
 * No provider API key exists in the client: the request is authenticated with
 * the user's JWT (attached by the shared axios instance) and the server calls
 * the model on our behalf.
 */
export const useAIChat = () => {
  const generateResponse = useCallback(async (messages, functions) => {
    const payload = { messages };

    // Function/tool definitions are forwarded in OpenAI tool shape.
    if (functions && functions.length > 0) {
      payload.tools = functions.map(def => ({
        type: 'function',
        function: def
      }));
    }

    const res = await api.post('/api/ai/chat', payload);

    if (!res.data || res.data.success === false) {
      throw new Error(res.data?.message || 'AI request failed');
    }

    return normalizeAssistantMessage(res.data.data);
  }, []);

  return { generateResponse };
};

/**
 * Custom hook for managing speech-to-text functionality.
 *
 * Transcription is always performed server-side (POST /api/speech/transcribe).
 * The previous browser-side AssemblyAI provider has been removed because it
 * required shipping a provider API key to the client.
 */
export const useSpeechToText = (onTranscriptionComplete, onError) => {
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const audioStreamRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [transcriptStatus, setTranscriptStatus] = useState('');
  const [recognitionLanguage, setRecognitionLanguage] = useState('en-US');

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

  // Server-side transcription (the server holds the speech provider key).
  const transcribeAudio = useCallback(async (audioBlob) => {
    try {
      setTranscriptStatus('processing');

      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('language', recognitionLanguage);

      const response = await api.post('/api/speech/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.transcript) {
        setTranscriptStatus('completed');
        return response.data.transcript;
      }

      throw new Error('No transcript returned');
    } catch (error) {
      setTranscriptStatus('error');
      throw error;
    }
  }, [recognitionLanguage]);

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

  // Release the recorder, timers and microphone track on unmount.
  useEffect(() => {
    return () => {
      stopRecording();
      clearTimeout(recordingTimeoutRef.current);
      clearInterval(recordingTimerRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopRecording]);

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

          const transcriptText = await transcribeAudio(audioBlob);

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
  }, [transcribeAudio, stopRecording, onTranscriptionComplete, onError, setLanguage]);

  return {
    isRecording,
    recordingTimer,
    transcriptStatus,
    recognitionLanguage,
    startRecording,
    stopRecording,
    setLanguage
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

      // Synthesis happens server-side; the server holds the TTS provider key.
      const { data } = await api.post('/api/speak', {
        message: truncatedText,
        language: ttsLanguage
      });

      if (!data || !data.file) {
        throw new Error('Failed to generate speech');
      }

      // Create a new audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Set up event listeners
      audio.oncanplaythrough = () => {
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
        setIsSpeaking(false);
        setCurrentSpeakingIndex(null);
      };

      // The server returns a URL path; resolve it against the API origin.
      audio.src = resolveApiUrl(data.file);

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