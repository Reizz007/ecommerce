import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  INITIAL_MESSAGE,
  QUICK_PROMPTS,
  sendAiChatMessage
} from '../utils/aiChatEngine';
import {
  Send,
  X,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ShoppingBag,
  CreditCard
} from 'lucide-react';

/**
 * Custom Customer Support Agent Icon matching user's reference image:
 * A friendly customer support silhouette with headset & boom microphone.
 */
function SupportHeadsetIcon({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Head shape */}
      <circle cx="18" cy="18" r="9.5" fill="currentColor" />
      {/* Smile / Mouth */}
      <path
        d="M14.5 19.8C15.3 21.2 16.5 21.8 18 21.8C19.5 21.8 20.7 21.2 21.5 19.8"
        stroke="#10b981"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Headphone Band */}
      <path
        d="M8.5 18C8.5 12.8 12.8 8.5 18 8.5C23.2 8.5 27.5 12.8 27.5 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Left Ear Cup */}
      <rect x="7" y="15" width="3" height="7" rx="1.5" fill="currentColor" />
      {/* Right Ear Cup */}
      <rect x="26" y="15" width="3" height="7" rx="1.5" fill="currentColor" />
      {/* Headset Mic Boom curving to mouth */}
      <path
        d="M27.5 19.5C27.5 24 23.5 26.5 19.5 26.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Mic Tip */}
      <circle cx="18.5" cy="26.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

export default function AiChatBot() {
  const {
    totalUSD,
    setIsCheckoutOpen,
    setIsAccountOpen,
    addToast
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('synapse_ai_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [INITIAL_MESSAGE];
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(() => {
    try {
      return !sessionStorage.getItem('synapse_chat_tooltip_dismissed');
    } catch {
      return true;
    }
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('synapse_ai_chat_messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // focus input when opened
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, isTyping]);

  // Handle send message
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return;

    const userMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const result = await sendAiChatMessage(text, [...messages, userMessage], totalUSD);

      // Natural slight delay for typing simulation
      setTimeout(() => {
        const botMessage = {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: result.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: result.quickReplies,
          actions: result.actions
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 450);
    } catch (err) {
      setIsTyping(false);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    sessionStorage.removeItem('synapse_ai_chat_messages');
    addToast('Chat conversation refreshed', 'info');
  };

  // Execute message actions
  const handleAction = (action) => {
    if (!action) return;

    if (action.type === 'open_checkout') {
      setIsCheckoutOpen(true);
      addToast('Opening instant KHQR checkout', 'info');
      if (window.innerWidth < 768) setIsOpen(false);
    } else if (action.type === 'open_account') {
      setIsAccountOpen(true);
      addToast('Opening customer dashboard & license keys', 'info');
      if (window.innerWidth < 768) setIsOpen(false);
    } else if (action.type === 'browse_tools') {
      const section = document.getElementById('tools');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        addToast('Navigating to AI Tools Catalog', 'info');
        if (window.innerWidth < 768) setIsOpen(false);
      }
    } else if (action.type === 'link' && action.url) {
      window.open(action.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Dismiss proactive tooltip
  const handleDismissTooltip = (e) => {
    e.stopPropagation();
    setShowTooltip(false);
    sessionStorage.setItem('synapse_chat_tooltip_dismissed', 'true');
  };

  // Render markdown-like text smoothly
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');

    return lines.map((line, lIdx) => {
      // Empty line spacer
      if (!line.trim()) {
        return <div key={lIdx} className="ai-chat-line-gap" />;
      }

      // Headers (### Header)
      if (line.startsWith('### ')) {
        return (
          <h4 key={lIdx} className="ai-chat-heading">
            {line.replace('### ', '')}
          </h4>
        );
      }

      // Bullet lists
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
      // Numbered lists
      const isNumbered = /^\d+\.\s/.test(line.trim());

      const content = isBullet
        ? line.trim().replace(/^[-•]\s*/, '')
        : isNumbered
        ? line.trim().replace(/^\d+\.\s*/, '')
        : line;

      // Parse bold **text** and code `code`
      const parts = [];
      const regex = /(\*\*.*?\*\*|`.*?`)/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        const token = match[0];
        if (token.startsWith('**') && token.endsWith('**')) {
          parts.push(<strong key={match.index}>{token.slice(2, -2)}</strong>);
        } else if (token.startsWith('`') && token.endsWith('`')) {
          parts.push(
            <code key={match.index} className="ai-chat-code-pill">
              {token.slice(1, -1)}
            </code>
          );
        }
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      if (isBullet) {
        return (
          <div key={lIdx} className="ai-chat-bullet-item">
            <span className="ai-chat-bullet-dot">•</span>
            <span>{parts}</span>
          </div>
        );
      }

      if (isNumbered) {
        const numMatch = line.trim().match(/^(\d+)\./);
        const number = numMatch ? numMatch[1] : '•';
        return (
          <div key={lIdx} className="ai-chat-numbered-item">
            <span className="ai-chat-number-badge">{number}</span>
            <span>{parts}</span>
          </div>
        );
      }

      return (
        <p key={lIdx} className="ai-chat-paragraph">
          {parts}
        </p>
      );
    });
  };

  return (
    <>
      {/* =========================================================================
          FLOATING LAUNCHER BUTTON (Bottom Right - Exactly matches user's screenshot)
          ========================================================================= */}
      <div className="ai-chat-launcher-wrapper">
        {/* Proactive Greeting Tooltip / Speech Bubble */}
        {showTooltip && !isOpen && (
          <div
            className="ai-chat-tooltip-bubble"
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
          >
            <div className="ai-chat-tooltip-content">
              <span className="ai-chat-tooltip-title">👋 Need help paying with KHQR?</span>
              <span className="ai-chat-tooltip-desc">Ask our AI Support assistant 24/7!</span>
            </div>
            <button
              type="button"
              className="ai-chat-tooltip-close"
              onClick={handleDismissTooltip}
              aria-label="Dismiss chat hint"
            >
              <X size={14} />
            </button>
            <div className="ai-chat-tooltip-arrow" />
          </div>
        )}

        {/* Circular Green Support Button */}
        <button
          type="button"
          className={`ai-chat-launcher-btn ${isOpen ? 'active' : ''}`}
          onClick={() => {
            setIsOpen(!isOpen);
            if (showTooltip) setShowTooltip(false);
          }}
          aria-label={isOpen ? 'Close AI Support Chat' : 'Open AI Support Chat'}
          title="Dyzzstore AI Support & Payment Guide"
        >
          {/* Online green pulsing glow effect */}
          <span className="ai-chat-pulse-ring" />
          
          {isOpen ? (
            <X size={26} className="ai-chat-close-icon" />
          ) : (
            <div className="ai-chat-icon-container">
              <SupportHeadsetIcon size={30} className="ai-chat-avatar-svg" />
              <span className="ai-chat-online-badge" />
            </div>
          )}
        </button>
      </div>

      {/* =========================================================================
          AI SUPPORT CHAT WINDOW MODAL
          ========================================================================= */}
      {isOpen && (
        <div className="ai-chat-window-container" role="dialog" aria-modal="true" aria-label="Dyzzstore AI Support">
          {/* Window Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-header-avatar">
                <SupportHeadsetIcon size={22} className="text-white" />
                <span className="ai-chat-header-status-dot" />
              </div>
              <div className="ai-chat-header-text">
                <h3 className="ai-chat-title">
                  Dyzzstore AI Support <Sparkles size={14} className="inline text-amber-400" />
                </h3>
                <p className="ai-chat-subtitle">
                  <span className="status-live-dot" /> Online • Instant KHQR Guide
                </p>
              </div>
            </div>

            <div className="ai-chat-header-actions">
              <button
                type="button"
                className="ai-chat-header-btn"
                onClick={handleResetChat}
                title="Restart conversation"
                aria-label="Restart conversation"
              >
                <RotateCcw size={16} />
              </button>
              <button
                type="button"
                className="ai-chat-header-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Close chat window"
              >
                <ChevronDown size={19} />
              </button>
            </div>
          </div>

          {/* Quick FAQ / Prompt Chips Bar */}
          <div className="ai-chat-quick-chips">
            <div className="ai-chat-chips-scroll">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="ai-chat-chip-btn"
                  onClick={() => handleSendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="ai-chat-messages-area">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`ai-chat-message-row ${isBot ? 'bot-row' : 'user-row'}`}
                >
                  {isBot && (
                    <div className="ai-chat-message-avatar">
                      <SupportHeadsetIcon size={16} />
                    </div>
                  )}

                  <div className={`ai-chat-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
                    {/* Render message body */}
                    <div className="ai-chat-text-body">
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Interactive Action Buttons */}
                    {isBot && msg.actions && msg.actions.length > 0 && (
                      <div className="ai-chat-actions-container">
                        {msg.actions.map((act, actIdx) => (
                          <button
                            key={actIdx}
                            type="button"
                            className="ai-chat-action-button"
                            onClick={() => handleAction(act)}
                          >
                            <span>{act.label}</span>
                            {act.type === 'link' ? (
                              <ExternalLink size={13} />
                            ) : act.type === 'open_checkout' ? (
                              <CreditCard size={13} />
                            ) : (
                              <ShoppingBag size={13} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Secondary Quick Reply Suggestions */}
                    {isBot && msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="ai-chat-inline-replies">
                        {msg.quickReplies.map((qr, qrIdx) => (
                          <button
                            key={qrIdx}
                            type="button"
                            className="ai-chat-inline-reply-btn"
                            onClick={() => handleSendMessage(qr)}
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="ai-chat-timestamp">{msg.timestamp}</div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="ai-chat-message-row bot-row">
                <div className="ai-chat-message-avatar">
                  <SupportHeadsetIcon size={16} />
                </div>
                <div className="ai-chat-bubble bot-bubble typing-bubble">
                  <div className="ai-chat-typing-dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Send Area */}
          <form
            className="ai-chat-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="ai-chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything (e.g. How to pay, tools, licenses...)"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="ai-chat-send-btn"
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Footer branding guarantee */}
          <div className="ai-chat-footer-bar">
            <span>🛡️ Powered by Dyzzstore AI • Automated KHQR Delivery</span>
          </div>
        </div>
      )}
    </>
  );
}
