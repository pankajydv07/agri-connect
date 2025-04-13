import React, { memo } from 'react';
import { FaStop } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
// Import the FaMicrophone and FaPaperPlane at the top
import { FaMicrophone, FaPaperPlane } from 'react-icons/fa';

/**
 * Component for rendering a single chat message
 */
export const ChatMessage = memo(({ 
  message, 
  index, 
  isSpeaking, 
  currentSpeakingIndex, 
  recordingTimer,
  onStopSpeaking 
}) => {
  if (message.isRecording) {
    // Render recording/transcribing message
    return (
      <div className="message user-message recording">
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
      <div className="message bot-message">
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
        className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'} ${isSpeakingThis ? 'speaking' : ''}`}
      >
        <ReactMarkdown>{message.content}</ReactMarkdown>
        
        {/* Add stop speaking button when this message is being spoken */}
        {isSpeakingThis && message.role === 'assistant' && (
          <button 
            className="stop-speech-button"
            onClick={onStopSpeaking}
            aria-label="Stop speaking"
          >
            <FaStop />
          </button>
        )}
      </div>
    );
  }
});

/**
 * Component for the chat message list
 */
export const ChatMessageList = memo(({ 
  messages, 
  isLoading, 
  isSpeaking, 
  currentSpeakingIndex, 
  recordingTimer,
  onStopSpeaking,
  messagesEndRef 
}) => {
  return (
    <div className="chatbot-messages">
      {messages.map((message, index) => (
        <ChatMessage 
          key={`${message.role}-${index}`}
          message={message} 
          index={index}
          isSpeaking={isSpeaking}
          currentSpeakingIndex={currentSpeakingIndex}
          recordingTimer={recordingTimer}
          onStopSpeaking={onStopSpeaking}
        />
      ))}
      
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
  );
});

/**
 * Component for the chat input area
 */
export const ChatInputForm = memo(({ 
  input, 
  isLoading, 
  isRecording, 
  onInputChange, 
  onSubmit, 
  onStartRecording 
}) => {
  return (
    <form onSubmit={onSubmit} className="chatbot-input-form">
      <input
        type="text"
        value={input}
        onChange={onInputChange}
        placeholder="Type your question..."
        disabled={isLoading || isRecording}
      />
      <button 
        type="button" 
        onClick={onStartRecording}
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
  );
});

