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
  getOrder
} from '../../actions/orderActions';
import {
  RECORDING_TIMEOUT,
  MAX_SPEECH_LENGTH,
  SYSTEM_PROMPT,
  FUNCTION_DEFINITIONS
} from './ChatbotConfig';
import {
  useAIChat,
  useSpeechToText,
  useTextToSpeech,
  useChatMessages,
  useFunctionCalling
} from './ChatbotHooks';
import { ChatMessageList, ChatInputForm, LanguageSelector } from './ChatbotComponents';
import './Chatbot.css';
import api from '../../utils/api';

// Valid unit values the API accepts for products
const VALID_PRODUCT_UNITS = ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece'];

// Allow-listed fields for PUT /api/products/:id
const PRODUCT_UPDATE_FIELDS = ['cropName', 'description', 'quantity', 'unit', 'price', 'availableUntil', 'status'];

const Chatbot = ({
  auth,
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  createOrder,
  getOrder
}) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState('english');

  // Holds details of a placeOrder call waiting for user confirmation.
  // Shape: { productId, quantityOrdered, deliveryAddress, productSummary } | null
  const pendingOrderRef = useRef(null);

  const messagesEndRef = useRef(null);

  // Get user role for personalized experience
  const userRole = auth.isAuthenticated ? auth.user?.role : 'guest';

  // AI requests are proxied by our server, which holds the provider key.
  const { generateResponse } = useAIChat();

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
    // ─── FARMER FUNCTIONS ────────────────────────────────────────────────────

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
          // Default availableUntil: 30 days from now
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

      const productId = args.productId;
      if (!productId) {
        return { success: false, message: 'Product ID is required to update a product.' };
      }

      // Build an allow-listed update body — only fields the API accepts
      const updateData = {};
      for (const field of PRODUCT_UPDATE_FIELDS) {
        // The model may send 'name' (old schema); map it to 'cropName'
        if (field === 'cropName' && args.name !== undefined) {
          updateData.cropName = args.name;
        } else if (args[field] !== undefined && args[field] !== null) {
          updateData[field] = args[field];
        }
      }

      // Coerce numeric fields
      if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
      if (updateData.quantity !== undefined) updateData.quantity = parseInt(updateData.quantity);

      // Validate unit if provided
      if (updateData.unit && !VALID_PRODUCT_UNITS.includes(updateData.unit)) {
        return {
          success: false,
          message: `Invalid unit "${updateData.unit}". Must be one of: ${VALID_PRODUCT_UNITS.join(', ')}.`
        };
      }

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'No valid fields provided for update. Please specify at least one field to update.'
        };
      }

      try {
        const response = await api.put(`/api/products/${productId}`, updateData);
        const updated = response.data?.data;
        return {
          success: true,
          message: `Successfully updated product: ${updated?.cropName || productId}`,
          product: updated
            ? {
                id: updated._id,
                cropName: updated.cropName,
                price: updated.price,
                quantity: updated.quantity,
                unit: updated.unit,
                status: updated.status
              }
            : null
        };
      } catch (error) {
        console.error('Error updating product:', error);
        const serverMsg = error.response?.data?.message;
        return {
          success: false,
          message: serverMsg || 'Failed to update the product. Please check the product ID and try again.'
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
        // Only pass query params the API actually supports
        const params = new URLSearchParams();
        if (args.status) params.append('status', args.status);
        if (args.limit) params.append('limit', String(args.limit));

        const qs = params.toString();
        const response = await api.get(`/api/orders${qs ? '?' + qs : ''}`);

        const rawOrders = response.data?.data || [];

        if (rawOrders.length > 0) {
          const orders = rawOrders.map(order => ({
            id: order._id,
            product: order.product?.cropName || 'Unknown',
            quantityOrdered: order.quantityOrdered,
            unit: order.product?.unit || '',
            unitPrice: order.unitPriceAtOrder,
            totalPrice: order.totalPrice,
            status: order.status,
            buyerName: order.buyer?.name || 'Unknown',
            deliveryAddress: order.deliveryAddress,
            orderDate: new Date(order.createdAt).toLocaleDateString()
          }));

          return {
            success: true,
            orders,
            count: orders.length,
            message: `Found ${orders.length} order(s) for your products.`
          };
        }

        return {
          success: true,
          orders: [],
          count: 0,
          message: 'No orders found matching your criteria.'
        };
      } catch (error) {
        console.error('Error getting farmer orders:', error);
        const serverMsg = error.response?.data?.message;
        return {
          success: false,
          message: serverMsg || 'Failed to retrieve orders. Please try again.'
        };
      }
    },

    getFarmingTips: async (args) => {
      try {
        let query = "organic farming tips";

        if (args.cropType) query += ` for ${args.cropType}`;
        if (args.season) query += ` in ${args.season} season`;
        if (args.challenge) query += ` for ${args.challenge}`;

        const response = await generateResponse([
          {
            role: 'system',
            content: 'You are an agricultural expert specialising in organic farming. Provide practical, actionable advice for farmers. Be concise and focus on specific techniques that can be implemented immediately.'
          },
          { role: 'user', content: query }
        ]);

        return {
          success: true,
          query,
          advice: response.content,
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

    // ─── WEATHER ─────────────────────────────────────────────────────────────

    getWeatherForecast: async (args) => {
      // Resolve location: use the arg, fall back to the logged-in user's location
      let location = args.location;
      if (!location && auth.isAuthenticated && auth.user?.location) {
        location = auth.user.location;
      }
      if (!location) {
        return {
          success: false,
          message: 'Please provide a location for the weather forecast (e.g. "Pune" or "Nashik, Maharashtra").'
        };
      }

      // Clamp days to 1–7; default 3
      const days = Math.min(7, Math.max(1, parseInt(args.days) || 3));

      try {
        const response = await api.get('/api/weather', {
          params: { location, days }
        });

        const data = response.data?.data;
        if (!data) {
          return { success: false, message: 'No weather data returned from the server.' };
        }

        // data.summary is a ready-made speakable string — feed it directly
        return {
          success: true,
          location: data.location,
          summary: data.summary,
          current: data.current,
          daily: data.daily,
          source: data.source
        };
      } catch (error) {
        console.error('Error getting weather forecast:', error);
        const status = error.response?.status;
        const serverMsg = error.response?.data?.message;
        if (status === 404) {
          return {
            success: false,
            message: serverMsg || `Could not find weather data for "${location}". Try adding a state or district name.`
          };
        }
        return {
          success: false,
          message: serverMsg || 'Failed to retrieve weather forecast. Please try again.'
        };
      }
    },

    // ─── BUYER FUNCTIONS ─────────────────────────────────────────────────────

    searchProducts: async (args) => {
      try {
        const params = new URLSearchParams();

        // Map the model's 'keywords' field to the API's 'cropName' param
        if (args.keywords) params.append('cropName', args.keywords);

        // Pass numeric price filters; coerce strings to numbers
        if (args.minPrice !== undefined && args.minPrice !== null) {
          params.append('minPrice', String(parseFloat(args.minPrice)));
        }
        if (args.maxPrice !== undefined && args.maxPrice !== null) {
          params.append('maxPrice', String(parseFloat(args.maxPrice)));
        }
        if (args.location) params.append('location', args.location);

        // Cap at 5 results to keep voice responses speakable
        params.append('limit', '5');
        params.append('status', 'Available');

        const response = await api.get(`/api/products?${params.toString()}`);
        const raw = response.data?.data || [];

        if (raw.length === 0) {
          return {
            success: true,
            products: [],
            count: 0,
            message: 'No products found matching your criteria.'
          };
        }

        // Shape the results so the model has _id for chaining into placeOrder
        const products = raw.map(p => ({
          id: p._id,
          cropName: p.cropName,
          description: p.description,
          price: p.price,
          unit: p.unit,
          quantityAvailable: p.quantity,
          farmerName: p.farmer?.name || 'Unknown',
          farmerLocation: p.farmer?.location || 'Unknown',
          availableUntil: p.availableUntil
        }));

        return {
          success: true,
          products,
          count: products.length,
          message: `Found ${products.length} product(s) matching your search.`
        };
      } catch (error) {
        console.error('Error searching products:', error);
        const serverMsg = error.response?.data?.message;
        return {
          success: false,
          message: serverMsg || 'Failed to search for products. Please try again.'
        };
      }
    },

    placeOrder: async (args) => {
      if (!auth.isAuthenticated || auth.user?.role !== 'buyer') {
        return { success: false, message: 'Only authenticated buyers can place orders.' };
      }

      const productId = args.productId;
      const quantityOrdered = args.quantityOrdered ? parseInt(args.quantityOrdered) : null;
      const deliveryAddress = args.deliveryAddress ? args.deliveryAddress.trim() : '';
      const confirmed = args.confirmed === true;

      // Validate required fields before doing anything
      if (!productId) {
        return { success: false, message: 'A product ID is required to place an order. Please search for a product first.' };
      }
      if (!quantityOrdered || quantityOrdered < 1) {
        return { success: false, message: 'Please specify a valid quantity (at least 1) to order.' };
      }
      if (!deliveryAddress) {
        return {
          success: false,
          needsDeliveryAddress: true,
          message: 'Please provide a delivery address before placing the order.'
        };
      }
      if (deliveryAddress.length < 10) {
        return {
          success: false,
          needsDeliveryAddress: true,
          message: 'Delivery address is too short. Please provide a full address (at least 10 characters).'
        };
      }

      // If not yet confirmed, fetch product details so we can give a meaningful
      // summary and ask the user to confirm before POSTing.
      if (!confirmed) {
        try {
          const productRes = await api.get(`/api/products/${productId}`);
          const product = productRes.data?.data;

          if (!product) {
            return { success: false, message: 'Could not find product details. Please try again.' };
          }

          const unitPrice = product.price;
          const totalPrice = unitPrice * quantityOrdered;

          // Store the pending order so we can retrieve it on the confirmed call
          pendingOrderRef.current = {
            productId,
            quantityOrdered,
            deliveryAddress,
            cropName: product.cropName,
            unit: product.unit,
            unitPrice,
            totalPrice
          };

          return {
            success: false,
            needsConfirmation: true,
            orderSummary: {
              cropName: product.cropName,
              quantityOrdered,
              unit: product.unit,
              unitPrice,
              totalPrice,
              deliveryAddress
            },
            message:
              `Please confirm your order: ${quantityOrdered} ${product.unit} of ${product.cropName} ` +
              `at ₹${unitPrice}/${product.unit}, total ₹${totalPrice}, ` +
              `to be delivered to "${deliveryAddress}". Reply "yes" to confirm or "no" to cancel.`
          };
        } catch (error) {
          console.error('Error fetching product for order confirmation:', error);
          const serverMsg = error.response?.data?.message;
          return {
            success: false,
            message: serverMsg || 'Could not fetch product details to confirm the order. Please try again.'
          };
        }
      }

      // User confirmed — place the order
      try {
        const response = await api.post('/api/orders', {
          productId,
          quantityOrdered,
          deliveryAddress
        });

        // Clear the pending order
        pendingOrderRef.current = null;

        const order = response.data?.data;
        return {
          success: true,
          orderId: order?._id,
          order: order
            ? {
                id: order._id,
                cropName: order.product?.cropName,
                quantityOrdered: order.quantityOrdered,
                unit: order.product?.unit,
                unitPrice: order.unitPriceAtOrder,
                totalPrice: order.totalPrice,
                status: order.status,
                deliveryAddress: order.deliveryAddress
              }
            : null,
          message: `Order placed successfully! Your order ID is ${order?._id}. Status: ${order?.status}.`
        };
      } catch (error) {
        console.error('Error placing order:', error);
        pendingOrderRef.current = null;
        const status = error.response?.status;
        const serverMsg = error.response?.data?.message;
        if (status === 409) {
          return {
            success: false,
            message: serverMsg || 'This product is out of stock, no longer available, or you cannot order your own listing.'
          };
        }
        if (status === 403) {
          return { success: false, message: 'Only buyers can place orders.' };
        }
        if (status === 400) {
          return { success: false, message: serverMsg || 'Invalid order details. Please check quantity and delivery address.' };
        }
        return {
          success: false,
          message: serverMsg || 'Failed to place your order. Please try again.'
        };
      }
    },

    trackOrder: async (args) => {
      if (!auth.isAuthenticated) {
        return { success: false, message: 'You need to be logged in to track orders.' };
      }

      const orderId = args.orderId ? args.orderId.trim() : '';

      // Helper: fall back to listing recent orders when we can't resolve a single order
      const listRecentOrders = async (reasonMsg) => {
        try {
          const listRes = await api.get('/api/orders?limit=5');
          const orders = (listRes.data?.data || []).map(o => ({
            id: o._id,
            cropName: o.product?.cropName || 'Unknown',
            quantityOrdered: o.quantityOrdered,
            unit: o.product?.unit || '',
            totalPrice: o.totalPrice,
            status: o.status,
            placedAt: new Date(o.createdAt).toLocaleDateString()
          }));
          return {
            success: true,
            fallback: true,
            reason: reasonMsg,
            recentOrders: orders,
            count: orders.length,
            message: orders.length > 0
              ? `${reasonMsg} Here are your ${orders.length} most recent order(s). Which one would you like to track?`
              : `${reasonMsg} You have no recent orders.`
          };
        } catch (listError) {
          console.error('Error listing recent orders:', listError);
          return {
            success: false,
            message: `${reasonMsg} Could not retrieve your recent orders either. Please try again.`
          };
        }
      };

      // If no order ID provided, jump straight to listing recent orders
      if (!orderId) {
        return listRecentOrders("No order ID was provided.");
      }

      // Basic MongoDB ObjectId format check (24 hex characters)
      const looksLikeObjectId = /^[a-f0-9]{24}$/i.test(orderId);
      if (!looksLikeObjectId) {
        return listRecentOrders(`"${orderId}" doesn't look like a valid order ID.`);
      }

      try {
        const response = await api.get(`/api/orders/${orderId}`);
        const order = response.data?.data;

        if (!order) {
          return listRecentOrders('Order not found.');
        }

        return {
          success: true,
          order: {
            id: order._id,
            cropName: order.product?.cropName || 'Unknown',
            quantityOrdered: order.quantityOrdered,
            unit: order.product?.unit || '',
            unitPrice: order.unitPriceAtOrder,
            totalPrice: order.totalPrice,
            status: order.status,
            farmerName: order.farmer?.name || 'Unknown',
            farmerLocation: order.farmer?.location || '',
            farmerPhone: order.farmer?.phone || '',
            deliveryAddress: order.deliveryAddress,
            placedAt: new Date(order.createdAt).toLocaleDateString()
          },
          message: `Your order for ${order.quantityOrdered} ${order.product?.unit || ''} of ${order.product?.cropName || 'the product'} is currently ${order.status}.`
        };
      } catch (error) {
        console.error('Error tracking order:', error);
        const status = error.response?.status;
        const serverMsg = error.response?.data?.message;
        if (status === 400 || status === 403) {
          return listRecentOrders(serverMsg || `Could not access order "${orderId}".`);
        }
        const fallbackMsg = serverMsg || `Could not retrieve order "${orderId}".`;
        return listRecentOrders(fallbackMsg);
      }
    }
  }), [
    auth,
    addProduct,
    updateProduct,
    deleteProduct,
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

      // Call the server-side AI proxy with function calling enabled
      const { content, toolCalls } = await generateResponse(
        [...apiMessages, { role: 'user', content: userInput }],
        FUNCTION_DEFINITIONS
      );

      // Check if the model wants to call a function
      if (toolCalls && toolCalls.length > 0) {
        // Get the function call details
        const functionCall = toolCalls[0];
        const toolCallId = functionCall.id;

        // Add AI's response message to the chat
        addAssistantMessage(
          content || "Let me help with that...",
          toolCalls
        );

        try {
          // Execute the function
          const functionResult = await executeFunction(functionCall);

          // Add function result as a tool message
          addToolMessage(toolCallId, functionResult);

          // Get AI to respond to the function result
          const secondApiMessages = [
            { role: 'system', content: personalizedSystemPrompt },
            ...messages.filter(msg => !msg.isRecording),
          ];

          const functionResponse = await generateResponse(secondApiMessages);

          const finalResponse = functionResponse.content;

          // Add AI's response to the chat
          addAssistantMessage(finalResponse);

          // Speak the response in the current language
          await speakText(finalResponse, MAX_SPEECH_LENGTH, messages.length + 1, speechLanguage);
        } catch (functionError) {
          console.error('Function execution error:', functionError);
          addAssistantMessage(t('chatbot.function_error'));
        }
      } else {
        const assistantResponse = content;

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
  } = useSpeechToText(handleTranscriptionComplete, handleTranscriptionError);

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
