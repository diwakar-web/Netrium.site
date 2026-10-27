import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { 
  X, 
  SendHorizontal, 
  RotateCcw, 
  Copy, 
  Check, 
  Bot, 
  User
} from 'lucide-react';
import { useAiAssistant } from '../context/AiAssistantContext';
import './NetAiDrawer.css';

/**
 * Lightweight, safe Markdown & Code Renderer for NetAI responses
 */
function MarkdownRenderer({ content }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyCode = async (codeSnippet, index) => {
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1600);
    } catch (err) {
      console.error('Failed to copy code snippet:', err);
    }
  };

  // Split by fenced code blocks: ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let blockCounter = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'text',
      code: match[2].trim(),
      index: blockCounter++
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return (
    <div className="netai-markdown-body">
      {parts.map((part, pIdx) => {
        if (part.type === 'code') {
          return (
            <div key={`code-${pIdx}`} className="netai-code-block">
              <div className="code-header">
                <span className="code-lang">{part.lang || 'code'}</span>
                <button
                  type="button"
                  className="code-copy-btn"
                  onClick={() => handleCopyCode(part.code, part.index)}
                >
                  {copiedIndex === part.index ? (
                    <>
                      <Check size={12} className="copy-ok-icon" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre>
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        // Render formatted text lines (headers, bold, lists, quotes, inline code)
        const lines = part.content.split('\n');
        return (
          <div key={`text-${pIdx}`} className="netai-text-block">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <div key={lIdx} className="line-break" />;
              }

              // H3
              if (trimmed.startsWith('### ')) {
                return <h3 key={lIdx} className="md-h3">{trimmed.replace(/^###\s+/, '')}</h3>;
              }
              // H2
              if (trimmed.startsWith('## ')) {
                return <h2 key={lIdx} className="md-h2">{trimmed.replace(/^##\s+/, '')}</h2>;
              }
              // H1
              if (trimmed.startsWith('# ')) {
                return <h1 key={lIdx} className="md-h1">{trimmed.replace(/^#\s+/, '')}</h1>;
              }
              // Blockquote
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lIdx} className="md-quote">
                    {trimmed.replace(/^>\s+/, '')}
                  </blockquote>
                );
              }
              // Bullet item
              if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                const itemText = trimmed.replace(/^[*|-]\s+/, '');
                return (
                  <div key={lIdx} className="md-bullet">
                    <span className="bullet-dot" />
                    <span>{renderInlineFormatting(itemText)}</span>
                  </div>
                );
              }
              // Numbered item
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="md-num-item">
                    <span className="num-prefix">{numMatch[1]}.</span>
                    <span>{renderInlineFormatting(numMatch[2])}</span>
                  </div>
                );
              }

              return (
                <p key={lIdx} className="md-paragraph">
                  {renderInlineFormatting(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Handles bold (**text**), italics (*text*), and inline code (`code`)
 */
function renderInlineFormatting(str) {
  const segments = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIdx = 0;
  let m;

  while ((m = regex.exec(str)) !== null) {
    if (m.index > lastIdx) {
      segments.push(str.substring(lastIdx, m.index));
    }
    const token = m[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      segments.push(
        <code key={m.index} className="md-inline-code">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      segments.push(
        <strong key={m.index} className="md-bold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      segments.push(
        <em key={m.index} className="md-italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIdx = m.index + token.length;
  }

  if (lastIdx < str.length) {
    segments.push(str.substring(lastIdx));
  }

  return segments;
}

export default function NetAiDrawer() {
  const {
    isOpen,
    closeDrawer,
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    clearChat,
    isLoading,
    inputRef
  } = useAiAssistant();

  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const messagesEndRef = useRef(null);
  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Setup GSAP initial offscreen positions matching StaggeredMenu
  useLayoutEffect(() => {
    if (!mounted) return;
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      if (!panel) return;

      let layers = [];
      if (preContainer) {
        layers = Array.from(preContainer.querySelectorAll('.netai-prelayer'));
      }
      preLayerElsRef.current = layers;

      gsap.set([panel, ...layers], { xPercent: 100, opacity: 1, visibility: 'hidden' });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1, visibility: 'hidden' });
      }
    });
    return () => ctx.revert();
  }, [mounted]);

  // Open animation timeline matching StaggeredMenu style
  const playOpen = useCallback(() => {
    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    if (!panel) return;

    let layers = preLayerElsRef.current;
    if (preContainer && (!layers || !layers.length)) {
      layers = Array.from(preContainer.querySelectorAll('.netai-prelayer'));
      preLayerElsRef.current = layers;
    }

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    const tl = gsap.timeline({
      onStart: () => {
        busyRef.current = true;
        gsap.set([panel, ...layers], { visibility: 'visible' });
        if (preContainer) gsap.set(preContainer, { visibility: 'visible' });
      },
      onComplete: () => {
        busyRef.current = false;
        inputRef.current?.focus();
      }
    });

    // Stagger sliding layers from right (100% -> 0%)
    layers.forEach((layer, idx) => {
      tl.fromTo(
        layer,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.5, ease: 'power4.out' },
        idx * 0.07
      );
    });

    const panelStartTime = layers.length ? 0.07 * (layers.length - 1) + 0.08 : 0;
    tl.fromTo(
      panel,
      { xPercent: 100 },
      { xPercent: 0, duration: 0.65, ease: 'power4.out' },
      panelStartTime
    );

    openTlRef.current = tl;
  }, [inputRef]);

  // Close animation matching StaggeredMenu style
  const playClose = useCallback(() => {
    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    if (!panel) return;

    const layers = preLayerElsRef.current;
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    busyRef.current = true;
    const all = [panel, ...layers];

    closeTweenRef.current = gsap.to(all, {
      xPercent: 100,
      duration: 0.38,
      ease: 'power3.in',
      stagger: -0.04,
      onComplete: () => {
        gsap.set(all, { visibility: 'hidden' });
        if (preContainer) gsap.set(preContainer, { visibility: 'hidden' });
        busyRef.current = false;
      }
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      playOpen();
    } else {
      playClose();
    }
  }, [isOpen, mounted, playOpen, playClose]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDrawer]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div 
        className={`netai-backdrop-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* GSAP Prelayers with Netrium Green Palette */}
      <div 
        ref={preLayersRef} 
        className="netai-prelayers" 
        aria-hidden="true"
      >
        <div className="netai-prelayer" style={{ background: '#00bf63' }} />
        <div className="netai-prelayer" style={{ background: '#022c22' }} />
        <div className="netai-prelayer" style={{ background: '#071610' }} />
      </div>

      {/* Main Sliding Panel pinned to Right Edge */}
      <aside 
        ref={panelRef} 
        className="netai-drawer-panel"
        role="dialog"
        aria-label="NetAI Engineering Co-Pilot"
      >
        {/* Header */}
        <header className="netai-drawer-header">
          <div className="header-brand">
            <span className="brand-title">
              <span className="brand-net">Net</span>
              <span className="brand-ai">AI</span>
            </span>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="action-icon-btn"
              onClick={clearChat}
              title="Clear conversation"
              aria-label="Clear chat"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              className="action-icon-btn close-btn"
              onClick={closeDrawer}
              title="Close NetAI panel (Esc)"
              aria-label="Close NetAI drawer"
            >
              <X size={17} />
            </button>
          </div>
        </header>

        {/* Chat Messages Body */}
        <div className="netai-messages-container">
          {messages.length === 0 && (
            <div className="netai-empty-state">
              <p>Ask NetAI anything, or highlight text on the site to inspect or translate.</p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id} 
                className={`netai-message-row ${isUser ? 'user-row' : 'assistant-row'}`}
              >
                <div className="message-avatar">
                  {isUser ? <User size={13} /> : <Bot size={13} />}
                </div>

                <div className="message-content-wrapper">
                  <div className="message-meta-header">
                    <span className="sender-name">{isUser ? 'You' : 'NetAI'}</span>
                  </div>

                  <div className="message-bubble">
                    {isUser ? (
                      <div className="user-message-text">{msg.text}</div>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Thinking / Typing Animation */}
          {isLoading && (
            <div className="netai-message-row assistant-row loading-row">
              <div className="message-avatar">
                <Bot size={13} />
              </div>
              <div className="message-content-wrapper">
                <div className="message-bubble thinking-bubble">
                  <div className="thinking-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="thinking-label">NetAI formulating response...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Dock */}
        <footer className="netai-input-dock">
          <div className="input-box-wrapper">
            <textarea
              ref={inputRef}
              rows={1}
              className="netai-textarea"
              placeholder="Ask NetAI..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button
              type="button"
              className={`netai-send-btn ${inputValue.trim() && !isLoading ? 'can-send' : ''}`}
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send query to NetAI"
            >
              <SendHorizontal size={15} />
            </button>
          </div>
        </footer>
      </aside>
    </>,
    document.body
  );
}
