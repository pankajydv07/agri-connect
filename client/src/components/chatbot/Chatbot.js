import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FaTimes, FaSeedling } from 'react-icons/fa';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  getProducts 
} from '../../actions/productActions';
import { 
  createOrder, 
  getOrder, 
  getOrders 
} from '../../actions/orderActions';
import { ELEVENLABS_API_KEY, ASSEMBLYAI_API_KEY } from '../../config/apiKeys';
import { 
  RECORDING_TIMEOUT, 
  VOICE_ID, 
  MAX_SPEECH_LENGTH,
  SYSTEM_PROMPT,
  FUNCTION_DEFINITIONS 
} from './ChatbotConfig';
import { 
  useOpenAI, 
  useSpeechToText, 
  useTextToSpeech, 
  useChatMessages,
  useFunctionCalling 
} from './ChatbotHooks';
import { ChatMessageList, ChatInputForm, LanguageSelector } from './ChatbotComponents';
import './Chatbot.css';
import axios from 'axios';

const Chatbot = ({ 
  auth, 
  addProduct, 
  updateProduct,
  deleteProduct,
  getProducts, 
  createOrder, 
  getOrder,
  getOrders 
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('english');
  
  const messagesEndRef = useRef(null);

  // Get user role for personalized experience
  const userRole = auth.isAuthenticated ? auth.user?.role : 'guest';

  // Initialize OpenAI client
  const { generateResponse } = useOpenAI(
    "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",
    "https://models.github.ai/inference"
  );

  // Create a personalized system prompt by replacing the role placeholder
  const personalizedSystemPrompt = useMemo(() => {
    let roleDescription;
    
    if (!auth.isAuthenticated) {
      roleDescription = 'not logged in';
    } else if (auth.user?.role === 'farmer') {
      roleDescription = 'a farmer';
    } else if (auth.user?.role === 'buyer') {
      roleDescription = 'a buyer';
    } else if (auth.user?.role === 'admin') {
      roleDescription = 'an admin';
    } else {
      roleDescription = 'not logged in';
    }
    
    return SYSTEM_PROMPT.replace('{{ROLE}}', roleDescription);
  }, [auth.isAuthenticated, auth.user?.role]);

  // Define available functions for the AI
  const availableFunctions = useMemo(() => ({
    // FARMER FUNCTIONS
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
    },

    updateProduct: async (args) => {
      if (!auth.isAuthenticated || auth.user?.role !== 'farmer') {
        return { success: false, message: 'Only authenticated farmers can update products' };
      }
      
      try {
        const productId = args.productId;
        
        // Create an object with only the fields that were provided
        const updateData = {};
        if (args.name) updateData.cropName = args.name;
        if (args.description) updateData.description = args.description;
        if (args.price) updateData.price = parseFloat(args.price);
        if (args.quantity) updateData.quantity = parseInt(args.quantity);
        if (args.unit) updateData.unit = args.unit;
        
        // Don't make an API call if no fields were provided to update
        if (Object.keys(updateData).length === 0) {
          return { 
            success: false, 
            message: 'No fields provided for update. Please specify at least one field to update.' 
          };
        }
        
        await updateProduct(productId, updateData);
        
        return { 
          success: true, 
          message: `Successfully updated product with ID: ${productId}` 
        };
      } catch (error) {
        console.error('Error updating product:', error);
        return { 
          success: false, 
          message: 'Failed to update the product. Please check the product ID and try again.' 
        };
      }
    },

    deleteProduct: async (args) => {
      if (!auth.isAuthenticated || auth.user?.role !== 'farmer') {
        return { success: false, message: 'Only authenticated farmers can delete products' };
      }
      
      try {
        const productId = args.productId;
        const confirmDelete = args.confirmDelete;
        
        // Double check confirmation to prevent accidental deletion
        if (!confirmDelete) {
          return {
            success: false,
            message: 'Product deletion requires confirmation. Please confirm that you want to delete this product.'
          };
        }
        
        await deleteProduct(productId);
        
        return { 
          success: true, 
          message: `Successfully deleted product with ID: ${productId}` 
        };
      } catch (error) {
        console.error('Error deleting product:', error);
        return { 
          success: false, 
          message: 'Failed to delete the product. Please check the product ID and try again.' 
        };
      }
    },

    getFarmerOrders: async (args) => {
      if (!auth.isAuthenticated || auth.user?.role !== 'farmer') {
        return { success: false, message: 'Only authenticated farmers can view their orders' };
      }
      
      try {
        // Create a query string for filtered search if parameters are provided
        const queryParams = [];
        
        if (args.status) {
          queryParams.push(`status=${encodeURIComponent(args.status)}`);
        }
        
        if (args.startDate) {
          queryParams.push(`startDate=${encodeURIComponent(args.startDate)}`);
        }
        
        if (args.endDate) {
          queryParams.push(`endDate=${encodeURIComponent(args.endDate)}`);
        }
        
        // Add a specific query parameter to get only orders for this farmer's products
        queryParams.push('farmerView=true');
        
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        
        // Call the API to get orders
        const response = await axios.get(`/api/orders${queryString}`);
        
        // Format orders for chat display
        if (response.data.data && response.data.data.length > 0) {
          const orders = response.data.data.map(order => ({
            id: order._id,
            product: order.product.cropName,
            quantity: order.quantity,
            total: order.totalAmount,
            status: order.status,
            buyerName: order.user.name,
            orderDate: new Date(order.createdAt).toLocaleDateString()
          }));
          
          return {
            success: true,
            orders,
            count: orders.length,
            message: `Found ${orders.length} orders for your products.`
          };
        } else {
          return {
            success: true,
            orders: [],
            count: 0,
            message: 'No orders found matching your criteria.'
          };
        }
      } catch (error) {
        console.error('Error getting farmer orders:', error);
        return { 
          success: false, 
          message: 'Failed to retrieve orders. Please try again.' 
        };
      }
    },

    getFarmingTips: async (args) => {
      try {
        // Create a query for farming tips
        let query = "organic farming tips";
        
        if (args.cropType) {
          query += ` for ${args.cropType}`;
        }
        
        if (args.season) {
          query += ` in ${args.season} season`;
        }
        
        if (args.challenge) {
          query += ` for ${args.challenge}`;
        }
        
        // Use the OpenAI API directly for this to get dynamic farming advice
        const response = await generateResponse([
          { role: 'system', content: 'You are an agricultural expert specializing in organic farming. Provide practical, actionable advice for farmers. Be concise and focus on specific techniques that can be implemented immediately.' },
          { role: 'user', content: query }
        ]);
        
        const farmingAdvice = response.choices[0].message.content;
        
        return {
          success: true,
          query,
          advice: farmingAdvice,
          message: 'Here are some organic farming tips that might help.'
        };
      } catch (error) {
        console.error('Error getting farming tips:', error);
        return { 
          success: false, 
          message: 'Failed to retrieve farming tips. Please try again.' 
        };
      }
    },

    getWeatherForecast: async (args) => {
      try {
        const location = args.location;
        const days = args.days || 3; // Default to 3-day forecast
        
        // Simulate weather forecast with mock data (in production, would use real weather API)
        const weatherTypes = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Thunderstorm'];
        const forecast = [];
        
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
          const forecastDate = new Date();
          forecastDate.setDate(today.getDate() + i);
          
          // Create a deterministic but somewhat random weather based on location and date
          const locationSeed = location.length;
          const dateSeed = forecastDate.getDate();
          const weatherIndex = (locationSeed + dateSeed + i) % weatherTypes.length;
          
          // Temperature fluctuates between 18-32°C
          const minTemp = 18 + ((locationSeed + i) % 7);
          const maxTemp = minTemp + 5 + (dateSeed % 5);
          
          forecast.push({
            date: forecastDate.toLocaleDateString(),
            weather: weatherTypes[weatherIndex],
            minTemp: minTemp,
            maxTemp: maxTemp,
            precipitation: weatherIndex > 2 ? (10 + ((weatherIndex - 2) * 15)) + '%' : '0%',
            humidity: 50 + (weatherIndex * 5) + '%',
            windSpeed: (5 + (weatherIndex * 2)) + ' km/h'
          });
        }
        
        return {
          success: true,
          location,
          forecast,
          message: `Weather forecast for ${location} for the next ${days} days.`
        };
      } catch (error) {
        console.error('Error getting weather forecast:', error);
        return { 
          success: false, 
          message: 'Failed to retrieve weather forecast. Please try again.' 
        };
      }
    },

    // BUYER FUNCTIONS
    searchProducts: async (args) => {
      try {
        // Build the query string from the provided parameters
        const queryParams = [];
        
        if (args.keywords) {
          queryParams.push(`search=${encodeURIComponent(args.keywords)}`);
        }
        
        if (args.category) {
          queryParams.push(`category=${encodeURIComponent(args.category)}`);
        }
        
        if (args.minPrice) {
          queryParams.push(`minPrice=${encodeURIComponent(args.minPrice)}`);
        }
        
        if (args.maxPrice) {
          queryParams.push(`maxPrice=${encodeURIComponent(args.maxPrice)}`);
        }
        
        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
        
        // Get products with the built query string
        const response = await getProducts(queryString);
        
        // Format the products for display in chat
        const productsResponse = {
          success: true,
          products: response?.payload?.data || [],
          count: response?.payload?.data?.length || 0,
          message: response?.payload?.data?.length > 0 
            ? `Found ${response.payload.data.length} products matching your criteria.` 
            : 'No products found matching your criteria.'
        };
        
        return productsResponse;
      } catch (error) {
        console.error('Error searching products:', error);
        return { 
          success: false, 
          message: 'Failed to search for products. Please try again.'
        };
      }
    },

    placeOrder: async (args) => {
      if (!auth.isAuthenticated || auth.user?.role !== 'buyer') {
        return { success: false, message: 'Only authenticated buyers can place orders' };
      }
      
      try {
        const orderData = {
          product: args.productId,
          quantity: parseInt(args.quantity),
          shippingAddress: args.deliveryAddress,
          requestedDeliveryDate: args.deliveryDate || null
        };
        
        const response = await createOrder(orderData);
        
        if (response) {
          return { 
            success: true, 
            orderId: response._id,
            message: `Order placed successfully! Your order ID is: ${response._id}`
          };
        } else {
          throw new Error('Failed to create order');
        }
      } catch (error) {
        console.error('Error placing order:', error);
        return { 
          success: false, 
          message: 'Failed to place your order. Please try again.'
        };
      }
    },

    trackOrder: async (args) => {
      if (!auth.isAuthenticated) {
        return { success: false, message: 'You need to be logged in to track orders' };
      }
      
      try {
        const response = await getOrder(args.orderId);
        
        if (response?.payload) {
          const order = response.payload;
          
          // Format the order status for the chatbot to display
          return {
            success: true,
            order: {
              id: order._id,
              status: order.status,
              product: order.product.cropName,
              quantity: order.quantity,
              total: order.totalAmount,
              placedAt: new Date(order.createdAt).toLocaleDateString(),
              estimatedDelivery: order.requestedDeliveryDate ? 
                new Date(order.requestedDeliveryDate).toLocaleDateString() : 
                'Not specified'
            },
            message: `Your order for ${order.quantity} ${order.product.unit} of ${order.product.cropName} is currently ${order.status}.`
          };
        } else {
          return {
            success: false,
            message: 'Order not found. Please check the order ID and try again.'
          };
        }
      } catch (error) {
        console.error('Error tracking order:', error);
        return { 
          success: false, 
          message: 'Failed to track your order. Please try again.'
        };
      }
    }
  }), [
    auth, 
    addProduct, 
    updateProduct,
    deleteProduct,
    getProducts, 
    createOrder, 
    getOrder,
    generateResponse
  ]);

  // Use custom hooks for managing chat state and functionality
  const { executeFunction } = useFunctionCalling(availableFunctions);
  
  // Get a personalized greeting based on user role
  const getPersonalizedGreeting = useCallback(() => {
    if (!auth.isAuthenticated) {
      return t('chatbot.greeting_guest');
    } else if (auth.user?.role === 'farmer') {
      return t('chatbot.greeting_farmer', { name: auth.user.name });
    } else if (auth.user?.role === 'buyer') {
      return t('chatbot.greeting_buyer', { name: auth.user.name });
    } else {
      return t('chatbot.greeting');
    }
  }, [auth.isAuthenticated, auth.user, t]);

  const { 
    messages, 
    addUserMessage, 
    addAssistantMessage, 
    addToolMessage,
    updateTemporaryMessage,
    removeTemporaryMessages
  } = useChatMessages(getPersonalizedGreeting());

  // Update greeting message when auth state changes
  useEffect(() => {
    // Only update if there's just the greeting message
    if (messages.length === 1 && messages[0].role === 'assistant') {
      messages[0].content = getPersonalizedGreeting();
    }
  }, [auth.isAuthenticated, auth.user, getPersonalizedGreeting, messages]);

  const { 
    isSpeaking, 
    currentSpeakingIndex, 
    speakText, 
    stopSpeaking 
  } = useTextToSpeech();
  
  // Define handleAIResponse first before it's used in other callbacks
  const handleAIResponse = useCallback(async (userInput) => {
    if (!userInput?.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Prepare messages for API (filtering out recording messages)
      const apiMessages = [
        { role: 'system', content: personalizedSystemPrompt },
        ...messages.filter(msg => !msg.isRecording && msg.role !== 'tool')
      ];
      
      // Call OpenAI API with function calling enabled
      const response = await generateResponse(
        [...apiMessages, { role: 'user', content: userInput }],
        FUNCTION_DEFINITIONS
      );
      
      const responseMessage = response.choices[0].message;
      
      // Check if the model wants to call a function
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        // Get the function call details
        const functionCall = responseMessage.tool_calls[0];
        const toolCallId = functionCall.id;
        
        // Add AI's response message to the chat
        addAssistantMessage(
          responseMessage.content || "Let me help with that...",
          responseMessage.tool_calls
        );
        
        try {
          // Execute the function
          const functionResult = await executeFunction(functionCall);
          
          // Add function result as a tool message
          const toolMessage = addToolMessage(toolCallId, functionResult);
          
          // Get AI to respond to the function result
          const secondApiMessages = [
            { role: 'system', content: personalizedSystemPrompt },
            ...messages.filter(msg => !msg.isRecording),
          ];
          
          const functionResponse = await generateResponse(secondApiMessages);
          
          const finalResponse = functionResponse.choices[0].message.content;
          
          // Add AI's response to the chat
          addAssistantMessage(finalResponse);
          
          // Speak the response in the current language
          await speakText(finalResponse, MAX_SPEECH_LENGTH, messages.length + 1, speechLanguage);
        } catch (functionError) {
          console.error('Function execution error:', functionError);
          addAssistantMessage(t('chatbot.function_error'));
        }
      } else {
        const assistantResponse = responseMessage.content;
        
        // Add AI response to chat
        addAssistantMessage(assistantResponse);
        
        // Speak the response in the current language
        await speakText(assistantResponse, MAX_SPEECH_LENGTH, messages.length, speechLanguage);
      }
    } catch (error) {
      console.error('Error calling AI API:', error);
      addAssistantMessage(t('chatbot.api_error'));
    } finally {
      setIsLoading(false);
    }
  }, [
    messages, 
    generateResponse, 
    executeFunction, 
    addAssistantMessage, 
    addToolMessage, 
    speakText, 
    t,
    personalizedSystemPrompt,
    speechLanguage
  ]);

  // Speech to text handlers - defined after handleAIResponse
  const handleTranscriptionComplete = useCallback((transcriptText) => {
    if (transcriptText && transcriptText.trim()) {
      // Replace the temporary message with the transcribed text
      addUserMessage(transcriptText);
      // Process the transcribed text with our AI
      handleAIResponse(transcriptText);
    } else {
      removeTemporaryMessages();
      addAssistantMessage(t('chatbot.transcription_empty'));
    }
  }, [addUserMessage, addAssistantMessage, removeTemporaryMessages, t, handleAIResponse]);

  const handleTranscriptionError = useCallback((error) => {
    console.error('Transcription error:', error);
    removeTemporaryMessages();
    addAssistantMessage(t('chatbot.transcription_error'));
  }, [removeTemporaryMessages, addAssistantMessage, t]);

  const { 
    isRecording, 
    recordingTimer, 
    transcriptStatus, 
    startRecording, 
    stopRecording,
    setLanguage
  } = useSpeechToText(
    ASSEMBLYAI_API_KEY, 
    handleTranscriptionComplete, 
    handleTranscriptionError
  );

  // Handle language change
  const handleLanguageChange = useCallback((language) => {
    setSpeechLanguage(language);
    setLanguage(language);
  }, [setLanguage]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Clean up function for component unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  // Update temporary message when transcription status changes
  useEffect(() => {
    if (isRecording) {
      let content = '🎙️ Listening...';
      
      if (transcriptStatus === 'processing') {
        content = '📝 Processing audio...';
      } else if (transcriptStatus === 'transcribing') {
        content = '📝 Transcribing...';
      }
      
      updateTemporaryMessage(content);
    }
  }, [isRecording, transcriptStatus, updateTemporaryMessage]);

  const toggleChat = useCallback(() => {
    setIsOpen(prevIsOpen => {
      if (prevIsOpen) return false;
      // Reset all states when opening chat
      stopSpeaking();
      return true;
    });
  }, [stopSpeaking]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  // Start voice recording
  const handleStartRecording = useCallback(async () => {
    try {
      // Add a temporary recording message to show status
      updateTemporaryMessage('🎙️ Listening...');
      // Start recording with timeout and current language
      await startRecording(RECORDING_TIMEOUT, speechLanguage);
    } catch (error) {
      console.error('Error starting recording:', error);
      removeTemporaryMessages();
      addAssistantMessage(t('chatbot.recording_error'));
    }
  }, [updateTemporaryMessage, startRecording, removeTemporaryMessages, addAssistantMessage, t, speechLanguage]);

  // Handle regular text input submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    addUserMessage(input);
    
    // Clear input
    setInput('');
    
    // Process with AI
    handleAIResponse(input);
  }, [input, addUserMessage, handleAIResponse]);

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
            <LanguageSelector 
              currentLanguage={speechLanguage}
              onLanguageChange={handleLanguageChange}
            />
            <button onClick={toggleChat} className="close-button">
              <FaTimes />
            </button>
          </div>
          
          <ChatMessageList 
            messages={messages}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
            currentSpeakingIndex={currentSpeakingIndex}
            recordingTimer={recordingTimer}
            onStopSpeaking={stopSpeaking}
            messagesEndRef={messagesEndRef}
          />
          
          <ChatInputForm 
            input={input}
            isLoading={isLoading}
            isRecording={isRecording}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onStartRecording={handleStartRecording}
          />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { addProduct, updateProduct, deleteProduct, getProducts, createOrder, getOrder })(Chatbot);
