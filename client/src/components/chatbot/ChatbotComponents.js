import React, { memo, useState } from 'react';
import { FaStop, FaGlobe, FaMicrophone, FaPaperPlane, FaChevronDown } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

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
 * Language selector component for speech recognition
 */
export const LanguageSelector = memo(({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = [
    { code: 'english', label: 'English', flag: '🇺🇸' },
    { code: 'hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'telugu', label: 'తెలుగు (Telugu)', flag: '🇮🇳' }
  ];
  
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  
  return (
    <div className="language-selector">
      <button 
        type="button" 
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <FaGlobe className="language-icon" />
        <span className="language-flag">{currentLang.flag}</span>
        <span className="language-label">{currentLang.label}</span>
        <FaChevronDown className={`language-arrow ${isOpen ? 'open' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {languages.map(language => (
            <button
              key={language.code}
              type="button"
              className={`language-option ${currentLanguage === language.code ? 'active' : ''}`}
              onClick={() => {
                onLanguageChange(language.code);
                setIsOpen(false);
              }}
            >
              <span className="language-flag">{language.flag}</span>
              <span className="language-name">{language.label}</span>
            </button>
          ))}
        </div>
      )}
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
    <div className="chatbot-input-container">
      <form onSubmit={onSubmit} className="chatbot-input-form">
        <input
          type="text"
          value={input}
          onChange={onInputChange}
          placeholder="Type your question..."
          disabled={isLoading || isRecording}
          className="chatbot-input"
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
    </div>
  );
});

