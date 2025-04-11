// src/components/chatbot/ChatbotWidget.js
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { BsFillChatFill, BsMicFill, BsStopFill, BsSendFill } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import './ChatbotWidget.css';
import { addProduct } from '../../actions/productActions';
import { ASSEMBLYAI_API_KEY, ELEVENLABS_API_KEY, NEBIUS_API_KEY } from '../../config/apiKeys';

const ChatbotWidget = ({ auth, addProduct }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AgriConnect assistant. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(new Audio());

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);
    
    try {
      // Process the message with AI
      await processAIResponse(inputMessage);
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.' 
      }]);
    }
    
    setIsProcessing(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendToAssemblyAI(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Auto stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I couldn\'t access your microphone. Please check your browser permissions and try again.' 
      }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const sendToAssemblyAI = async (audioBlob) => {
    setIsProcessing(true);
    try {
      // First upload the audio file
      const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          'authorization': ASSEMBLYAI_API_KEY // Replace with your AssemblyAI API key
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
          'authorization': ASSEMBLYAI_API_KEY, // Replace with your AssemblyAI API key
          'content-type': 'application/json'
        },
        body: JSON.stringify({ audio_url: upload_url })
      });
      
      if (!transcriptResponse.ok) {
        throw new Error('Failed to request transcription');
      }
      
      const { id } = await transcriptResponse.json();
      
      // Poll for transcription result
      let transcriptText = '';
      while (true) {
        const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
          headers: { 
            'authorization': ASSEMBLYAI_API_KEY // Replace with your AssemblyAI API key
          }
        });
        
        if (!pollingResponse.ok) {
          throw new Error('Failed to poll for transcription');
        }
        
        const data = await pollingResponse.json();
        
        if (data.status === 'completed') {
          transcriptText = data.text;
          break;
        } else if (data.status === 'error') {
          throw new Error('Transcription failed');
        }
        
        // Wait 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (transcriptText.trim()) {
        // Add transcribed message to chat
        setMessages(prev => [...prev, { role: 'user', content: transcriptText }]);
        
        // Process the transcribed text with AI
        await processAIResponse(transcriptText);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'I couldn\'t hear anything. Please try speaking again.' 
        }]);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble processing your voice input. Please try again or type your message.' 
      }]);
    }
    
    setIsProcessing(false);
  };

  const processAIResponse = async (userInput) => {
    try {
      // Define available functions for authenticated users
      const availableFunctions = {
        addProduct: {
          name: "addProduct",
          description: "Add a new agricultural product to the marketplace",
          parameters: {
            type: "object",
            properties: {
              cropName: {
                type: "string",
                description: "Name of the crop or agricultural product"
              },
              description: {
                type: "string",
                description: "Detailed description of the product"
              },
              quantity: {
                type: "number",
                description: "Available quantity of the product"
              },
              unit: {
                type: "string",
                description: "Unit of measurement (e.g., kg, ton, etc.)"
              },
              price: {
                type: "number",
                description: "Price per unit"
              },
              availableUntil: {
                type: "string",
                description: "Date until which the product is available (YYYY-MM-DD format)"
              }
            },
            required: ["cropName", "description", "quantity", "unit", "price", "availableUntil"]
          }
        }
      };

      // Prepare messages for the AI
      const systemMessage = auth.isAuthenticated 
        ? `You are an AI assistant for AgriConnect, an agricultural marketplace platform. You help farmers list products and buyers find products. 
           ${auth.user && auth.user.role === 'farmer' ? 'The user is a farmer who can add products to the marketplace.' : 
           auth.user && auth.user.role === 'buyer' ? 'The user is a buyer looking for agricultural products.' : 
           'The user is browsing the marketplace.'}
           
           If a farmer wants to add a product, collect all required information (crop name, description, quantity, unit, price, and availability date) and use the addProduct function.
           Format dates as YYYY-MM-DD.
           Be helpful, concise, and friendly.`
        : `You are an AI assistant for AgriConnect, an agricultural marketplace platform. You help users navigate the platform and answer questions about agricultural products.
           Currently, the user is not logged in, so they cannot add products or place orders. Encourage them to log in or register if they want to use these features.
           Be helpful, concise, and friendly.`;

      // Prepare the request body
      const requestBody = {
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct-fast",
        max_tokens: 512,
        temperature: 0.6,
        top_p: 0.9,
        top_k: 50,
        messages: [
          { role: "system", content: systemMessage },
          ...messages.filter(msg => msg.role !== 'system'),
          { role: "user", content: userInput }
        ]
      };

      // Add function calling capabilities for authenticated users
      if (auth.isAuthenticated && auth.user.role === 'farmer') {
        requestBody.functions = [availableFunctions.addProduct];
      }

      // Send request to Nebius API
      const response = await fetch('https://api.studio.nebius.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NEBIUS_API_KEY}` // Replace with your Nebius API key
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Handle function calling if present
      if (data.choices[0].message.function_call && auth.isAuthenticated) {
        const functionCall = data.choices[0].message.function_call;
        
        if (functionCall.name === 'addProduct' && auth.user.role === 'farmer') {
          // Parse the function arguments
          const args = JSON.parse(functionCall.arguments);
          
          // Add the product using Redux action
          const result = await addProduct(args);
          
          // Add function call message to chat
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `I'm adding your product "${args.cropName}" to the marketplace...`
          }]);
          
          // Add result message
          if (result.success) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `Great! Your product "${args.cropName}" has been successfully added to the marketplace.`
            }]);
          } else {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `Sorry, there was an issue adding your product: ${result.error}`
            }]);
          }
        }
      } else {
        // Regular message response
        const aiMessage = data.choices[0].message.content;
        setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
        
        // Convert AI response to speech
        if (aiMessage) {
          speakWithElevenLabs(aiMessage);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.' 
      }]);
    }
  };

  const speakWithElevenLabs = async (text) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      setIsSpeaking(true);
      
      const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream", {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY, // Replace with your ElevenLabs API key
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
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onended = () => {
        setIsSpeaking(false);
      };
      
      audioRef.current.play();
    } catch (error) {
      console.error('Error converting text to speech:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-widget">
      {/* Floating Button */}
      <button 
        className={`chatbot-toggle-button ${isOpen ? 'open' : ''}`} 
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        <BsFillChatFill size={24} />
      </button>
      
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>AgriConnect Assistant</h3>
            <button onClick={toggleChat} className="close-button" aria-label="Close chat">
              <FaTimes />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                {message.content}
              </div>
            ))}
            {isProcessing && (
              <div className="message assistant-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isRecording || isProcessing}
            />
            <div className="chatbot-controls">
              {isSpeaking ? (
                <button 
                  onClick={stopSpeaking} 
                  className="control-button stop-button"
                  disabled={isProcessing || isRecording}
                  aria-label="Stop speaking"
                >
                  <BsStopFill size={20} />
                </button>
              ) : isRecording ? (
                <button 
                  onClick={stopRecording} 
                  className="control-button stop-button"
                  aria-label="Stop recording"
                >
                  <BsStopFill size={20} />
                </button>
              ) : (
                <button 
                  onClick={startRecording} 
                  className="control-button mic-button"
                  disabled={isProcessing}
                  aria-label="Start recording"
                >
                  <BsMicFill size={20} />
                </button>
              )}
              <button 
                onClick={handleSendMessage} 
                className="control-button send-button"
                disabled={isRecording || isProcessing || inputMessage.trim() === ''}
                aria-label="Send message"
              >
                <BsSendFill size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { addProduct })(ChatbotWidget);
