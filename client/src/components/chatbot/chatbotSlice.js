// src/components/chatbot/chatbotSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { NEBIUS_API_KEY } from '../../config/apiKeys';

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
};

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    messageAdded(state, action) {
      state.messages.push(action.payload);
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

// Export actions
export const { messageAdded, setLoading, setError, clearMessages } = chatbotSlice.actions;

// Async action for sending messages to AI
export const sendMessage = (message) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Prepare the request body for Nebius API with Meta Llama model
    const requestBody = {
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-fast",
      max_tokens: 512,
      temperature: 0.6,
      top_p: 0.9,
      top_k: 50,
      messages: [
        { role: "system", content: "You are a helpful AI assistant for AgriConnect, an agricultural marketplace platform." },
        { role: "user", content: message }
      ]
    };

    const response = await fetch('https://api.studio.nebius.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEBIUS_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get response from AI');
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Add user message
    dispatch(messageAdded({ role: 'user', content: message }));
    
    // Add AI response
    dispatch(messageAdded({ role: 'assistant', content: aiResponse }));
    
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default chatbotSlice.reducer;