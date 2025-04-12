import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPaperPlane, FaMicrophone, FaStop, FaLeaf, FaSeedling } from 'react-icons/fa';
import { connect } from 'react-redux';
import OpenAI from 'openai';
import ReactMarkdown from 'react-markdown';
import { addProduct } from '../../actions/productActions';
import { ELEVENLABS_API_KEY, ASSEMBLYAI_API_KEY } from '../../config/apiKeys';
import { useTranslation } from 'react-i18next';
import './Chatbot.css';

const Chatbot = ({ auth, addProduct }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('chatbot.greeting') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingIndex, setCurrentSpeakingIndex] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(0);
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const audioRef = useRef(null);

  // Update greeting message when language changes
  useEffect(() => {
    setMessages([{ role: 'assistant', content: t('chatbot.greeting') }]);
  }, [i18n.language, t]);

  // Initialize OpenAI client
  const client = new OpenAI({
    apiKey: "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",
    baseURL: "https://models.inference.ai.azure.com",
    dangerouslyAllowBrowser: true
  });

  // Define available functions for the AI
  const availableFunctions = {
    addProduct: async (args) => {
      if (!auth.isAuthenticated || auth.user?.role !== 'farmer') {
        return { success: false, message: 'Only authenticated farmers can add products' };
      }
      
      try {
        const productData = {
          cropName: args.name,
          description: args.description,
          price: parseFloat(args.price),
          quantity: parseInt(args.quantity),
          unit: args.unit,
          // Add default availableUntil date (30 days from now)
          availableUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        
        await addProduct(productData);
        return { 
          success: true, 
          message: `Successfully added product: ${args.name}` 
        };
      } catch (error) {
        console.error('Error adding product:', error);
        return { 
          success: false, 
          message: 'Failed to add the product. Please try again.' 
        };
      }
    }
  };

  // Define the function schemas for OpenAI
  const functionDefinitions = [
    {
      name: 'addProduct',
      description: 'Add a new agricultural product to the farmer\'s inventory',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the crop or product'
          },
          description: {
            type: 'string',
            description: 'A detailed description of the product'
          },
          price: {
            type: 'string',
            description: 'The price per unit of the product'
          },
          quantity: {
            type: 'string',
            description: 'The available quantity of the product'
          },
          unit: {
            type: 'string',
            description: 'The unit of measurement (e.g., kg, ton, pieces, etc.)'
          }
        },
        required: ['name', 'description', 'price', 'quantity', 'unit']
      }
    }
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize audio context for silence detection
  useEffect(() => {
    return () => {
      // Clean up audio resources when component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      clearTimeout(recordingTimeoutRef.current);
    };
  }, []);

  // Clean up any audio playing when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset all states when opening chat
      stopSpeaking();
    }
  };

  // Function to stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setCurrentSpeakingIndex(null);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Start voice recording with a simple 10-second timer
  const startRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingTimer(0);
      setTranscript('🎙️ Listening...');
      
      // Add a temporary recording message
      const recordingMessage = { 
        role: 'user', 
        content: '🎙️ Listening...', 
        isRecording: true 
      };
      setMessages(prevMessages => [...prevMessages, recordingMessage]);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        await sendToAssemblyAI();
      };

      mediaRecorderRef.current.start(1000); // Collect data in 1-second chunks

      // Start a 10-second timer
      recordingTimeoutRef.current = setTimeout(() => {
        stopRecordingAndProcess();
      }, 10000);

      // Update the timer every second
      recordingTimerRef.current = setInterval(() => {
        setRecordingTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setTranscript('');
      setRecordingTimer(0);
      
      // Remove the temporary recording message
      setMessages(prevMessages => prevMessages.filter(msg => !msg.isRecording));
      
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Error accessing microphone. Please check permissions and try again.' }
      ]);
    }
  };

  // Stop recording and process the audio
  const stopRecordingAndProcess = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      clearTimeout(recordingTimeoutRef.current);
      clearInterval(recordingTimerRef.current);
      
      setIsRecording(false);
      setRecordingTimer(0);
      
      // Update UI
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.isRecording 
            ? { ...msg, content: '📝 Processing audio...' }
            : msg
        )
      );
    }
  };

  // Send audio to AssemblyAI for transcription
  const sendToAssemblyAI = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      
      // Upload the audio file
      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: { authorization: ASSEMBLYAI_API_KEY },
        body: audioBlob
      });
      
      const { upload_url } = await uploadRes.json();

      // Request the transcription
      const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
          "content-type": "application/json"
        },
        body: JSON.stringify({ audio_url: upload_url })
      });

      const { id } = await transcriptRes.json();
      
      // Update the temporary message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.isRecording 
            ? { ...msg, content: '📝 Transcribing...' }
            : msg
        )
      );

      // Poll for results
      let transcriptText = "";
      while (true) {
        const polling = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
          headers: { authorization: ASSEMBLYAI_API_KEY }
        });
        
        const data = await polling.json();

        if (data.status === "completed") {
          transcriptText = data.text;
          break;
        } else if (data.status === "failed") {
          // Update UI with failure message
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.isRecording 
                ? { role: 'user', content: '❌ Transcription failed.' }
                : msg
            )
          );
          setIsRecording(false);
          return;
        }
        
        // Wait before polling again
        await new Promise(r => setTimeout(r, 2000));
      }

      // Replace the temporary message with the transcribed text
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.isRecording 
            ? { role: 'user', content: transcriptText }
            : msg
        )
      );
      
      setIsRecording(false);
      
      // Process the transcribed text with our AI
      await handleAIResponse(transcriptText);
      
    } catch (err) {
      console.error('Error with AssemblyAI:', err);
      
      // Update or remove the temporary message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.isRecording 
            ? { role: 'user', content: '❌ Error with transcription service.' }
            : msg
        )
      );
      
      setIsRecording(false);
    }
  };

  // Handle the AI response and text-to-speech
  const handleAIResponse = async (userInput) => {
    if (!userInput.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Prepare messages for API
      const apiMessages = [
        {
          role: 'system',
          content: `You are an AI assistant for AgriConnect, an agricultural marketplace platform that connects farmers directly with buyers. 
          Provide helpful, concise information about agricultural products, farming practices, and how to use the AgriConnect platform. 
          
          You can help farmers add new products to the marketplace. When a farmer wants to add a product, collect all required information 
          and then use the addProduct function. The required fields are: name, description, price, quantity, and unit.
          
          If a user who is not a farmer or not logged in tries to add a product, kindly explain that only authenticated farmers can add products.
          
          Keep responses friendly and under 150 words unless you need to ask follow-up questions to collect product information.`
        },
        ...messages.filter(msg => !msg.isRecording) // Filter out temporary recording messages
      ];
      
      // Call OpenAI API with function calling enabled
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          ...apiMessages,
          { role: 'user', content: userInput }
        ],
        temperature: 0.7,
        top_p: 1.0,
        max_tokens: 500,
        tools: functionDefinitions.map(def => ({
          type: 'function',
          function: def
        }))
      });
      
      const responseMessage = response.choices[0].message;
      
      // Check if the model wants to call a function
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        // Get the function call details
        const functionCall = responseMessage.tool_calls[0];
        const functionName = functionCall.function.name;
        const functionArgs = JSON.parse(functionCall.function.arguments);
        const toolCallId = functionCall.id;
        
        // Add AI's response message to the chat
        setMessages(prevMessages => [
          ...prevMessages.filter(msg => !msg.isRecording),
          {
            role: 'assistant',
            content: `I'll help you add this product to your inventory.`,
            tool_calls: [functionCall]
          }
        ]);
        
        // Execute the function
        if (functionName in availableFunctions) {
          const functionResult = await availableFunctions[functionName](functionArgs);
          
          // Add function result to the API messages for context
          const toolResponseMessage = {
            role: 'tool',
            tool_call_id: toolCallId,
            content: JSON.stringify(functionResult)
          };
          
          // Add tool response message to the messages list
          const updatedMessages = [
            ...apiMessages,
            { role: 'user', content: userInput },
            responseMessage,
            toolResponseMessage
          ];
          
          // Get AI to respond to the function result
          const functionResponse = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: updatedMessages,
            temperature: 0.7,
            max_tokens: 500
          });
          
          const finalResponse = functionResponse.choices[0].message.content;
          
          // Add AI's response to the function result to the chat
          setMessages(prevMessages => [
            ...prevMessages.filter(msg => !msg.isRecording),
            toolResponseMessage, // Include the tool response for OpenAI's context
            {
              role: 'assistant',
              content: finalResponse
            }
          ]);
          
          // Speak the response
          speakWithElevenLabs(finalResponse);
        }
      } else {
        const assistantResponse = responseMessage.content;
        
        // Add AI response to chat
        setMessages(prevMessages => [
          ...prevMessages.filter(msg => !msg.isRecording), 
          { role: 'assistant', content: assistantResponse }
        ]);
        
        // Speak the response
        speakWithElevenLabs(assistantResponse);
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      setMessages(prevMessages => [
        ...prevMessages.filter(msg => !msg.isRecording), 
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text-to-speech with ElevenLabs
  const speakWithElevenLabs = async (text) => {
    try {
      // Stop any current speech
      stopSpeaking();
      
      const voiceId = "EXAVITQu4vr4xnSDxMaL";

      // Process text to remove markdown formatting for speech
      // Particularly remove asterisks used for emphasis in markdown
      const textForSpeech = text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold (**text**)
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic (*text*)
        .replace(/\_\_?(.*?)\_\_?/g, '$1') // Remove underscores
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
        .replace(/^#+\s*(.*$)/gm, '$1'); // Remove headings

      // Find the index of the most recent assistant message
      const assistantIndex = messages.findIndex(
        msg => msg.role === 'assistant' && msg.content === text
      );
      setCurrentSpeakingIndex(assistantIndex);
      
      // Limit text length to prevent large requests (ElevenLabs has limits)
      const trimmedText = textForSpeech.length > 300 ? 
        textForSpeech.substring(0, 300) + "..." : 
        textForSpeech;

      console.log("Calling ElevenLabs API with text length:", trimmedText.length);
      
      setIsSpeaking(true);
      
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
          "Accept": "audio/mpeg"
        },
        body: JSON.stringify({
          text: trimmedText,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          },
          model_id: "eleven_monolingual_v1" // Specifying model explicitly
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("ElevenLabs API error:", res.status, errorText);
        setIsSpeaking(false);
        throw new Error(`Failed to fetch TTS audio from ElevenLabs: ${res.status} ${errorText}`);
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        setCurrentSpeakingIndex(null);
      };
      
      audio.play();
    } catch (error) {
      console.error("Error speaking with ElevenLabs:", error);
      setIsSpeaking(false);
      setCurrentSpeakingIndex(null);
      // Continue without speech - don't block the chat functionality
    }
  };

  // Handle regular text input submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages.filter(msg => !msg.isRecording), userMessage]);
    setInput('');
    
    // Process with AI
    await handleAIResponse(input);
  };

  // Render function call messages nicely
  const renderMessage = (message, index) => {
    if (message.isRecording) {
      // Render recording/transcribing message
      return (
        <div key={index} className="message user-message recording">
          {message.content}
          {message.content.includes('Listening') && (
            <div className="typing-indicator recording-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div className="recording-timer">
            {recordingTimer}s
          </div>
        </div>
      );
    } else if (message.role === 'assistant' && message.tool_calls) {
      // This is a function call message
      return (
        <div key={index} className="message bot-message">
          <ReactMarkdown>{message.content}</ReactMarkdown>
          <div className="function-call-info">
            <em>Processing your request...</em>
          </div>
        </div>
      );
    } else if (message.role === 'tool') {
      // This is a function result message, we can hide these or style them differently
      return null; // Hide function result messages as they're mostly for the AI
    } else {
      // Normal message with markdown support
      const isSpeakingThis = isSpeaking && currentSpeakingIndex === index;
      
      return (
        <div 
          key={index} 
          className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'} ${isSpeakingThis ? 'speaking' : ''}`}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
          
          {/* Add stop speaking button when this message is being spoken */}
          {isSpeakingThis && message.role === 'assistant' && (
            <button 
              className="stop-speech-button"
              onClick={stopSpeaking}
              aria-label="Stop speaking"
            >
              <FaStop />
            </button>
          )}
        </div>
      );
    }
  };

  return (
    <div className="chatbot-container">
      {/* Floating button */}
      <button 
        className={`chatbot-button ${isOpen ? 'open' : ''}`} 
        onClick={toggleChat}
        aria-label="Chat with AgriConnect Assistant"
      >
        {isOpen ? <FaTimes /> : <FaSeedling />}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>AgriConnect Assistant</h3>
            <button onClick={toggleChat} className="close-button">
              <FaTimes />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => renderMessage(message, index))}
            {isLoading && (
              <div className="message bot-message loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="chatbot-input-form">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your question..."
              disabled={isLoading || isRecording}
            />
            <button 
              type="button" 
              onClick={startRecording}
              disabled={isLoading || isRecording}
              className="mic-button"
              aria-label="Start voice recording"
            >
              <FaMicrophone />
            </button>
            <button 
              type="submit" 
              disabled={isLoading || isRecording || !input.trim()}
              className="send-button"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { addProduct })(Chatbot);
