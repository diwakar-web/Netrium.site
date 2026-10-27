import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, Check, Sparkles, Languages } from 'lucide-react';
import { useAiAssistant } from '../context/AiAssistantContext';
import './TextSelectionSlider.css';

export default function TextSelectionSlider() {
  const { openDrawer } = useAiAssistant();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'top' });
  const [selectedText, setSelectedText] = useState('');
  const [copied, setCopied] = useState(false);
  const sliderRef = useRef(null);

  const checkSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setVisible(false);
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 2) {
      setVisible(false);
      return;
    }

    // Ignore if selection is inside inputs, textareas, or NetAI drawer itself
    const anchorNode = selection.anchorNode;
    if (anchorNode) {
      const element = anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentElement;
      if (element && (
        element.closest('.netai-drawer-panel') ||
        element.closest('.netai-selection-slider') ||
        element.tagName === 'INPUT' ||
        element.tagName === 'TEXTAREA' ||
        element.isContentEditable
      )) {
        setVisible(false);
        return;
      }
    }

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // If bounding rect has zero area (invisible), hide
      if (rect.width === 0 && rect.height === 0) {
        setVisible(false);
        return;
      }

      const sliderWidth = 310;
      const sliderHeight = 44;

      // Center horizontally above selection
      let left = rect.left + rect.width / 2 - sliderWidth / 2;
      // Clamp within viewport
      left = Math.max(16, Math.min(window.innerWidth - sliderWidth - 16, left));

      // Determine whether to place above or below selection
      let top = rect.top - sliderHeight - 10;
      let placement = 'top';

      if (top < 60) {
        // Not enough room above, place below
        top = rect.bottom + 10;
        placement = 'bottom';
      }

      setPosition({ top, left, placement });
      setSelectedText(text);
      setVisible(true);
    } catch (e) {
      console.warn('Error reading selection rect:', e);
      setVisible(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId;
    const handleMouseUp = () => {
      // Small timeout allows browser selection to finalize
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkSelection, 50);
    };

    const handleKeyUp = (e) => {
      if (['Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(checkSelection, 50);
      }
    };

    const handleMouseDown = (e) => {
      // If clicking inside the slider itself, don't dismiss
      if (sliderRef.current && sliderRef.current.contains(e.target)) {
        return;
      }
      // On click elsewhere, hide slider
      setVisible(false);
    };

    const handleScroll = () => {
      if (visible) {
        checkSelection();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [checkSelection, visible]);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleAskNetAi = (e) => {
    e.stopPropagation();
    openDrawer({
      prompt: selectedText,
      mode: 'chat',
      autoFocus: true
    });
    setVisible(false);
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  const handleTranslate = (e) => {
    e.stopPropagation();
    openDrawer({
      prompt: `Translate this text: "${selectedText}"`,
      mode: 'translate',
      autoFocus: true
    });
    setVisible(false);
    // Clear selection
    window.getSelection()?.removeAllRanges();
  };

  if (!visible) return null;

  return (
    <div
      ref={sliderRef}
      className={`netai-selection-slider ${position.placement}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
      role="toolbar"
      aria-label="Text selection actions"
    >
      <div className="netai-slider-glow" />

      {/* Copy Action */}
      <button
        type="button"
        className={`netai-slider-btn copy-btn ${copied ? 'is-copied' : ''}`}
        onClick={handleCopy}
        title="Copy highlighted text to clipboard"
      >
        {copied ? (
          <>
            <Check size={14} className="btn-icon success-icon" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={14} className="btn-icon" />
            <span>Copy</span>
          </>
        )}
      </button>

      <span className="netai-slider-divider" />

      {/* Ask NetAI Action */}
      <button
        type="button"
        className="netai-slider-btn ask-btn"
        onClick={handleAskNetAi}
        title="Open NetAI with this query ready to send"
      >
        <Sparkles size={14} className="btn-icon pulse-icon" />
        <span>Ask NetAI</span>
      </button>

      <span className="netai-slider-divider" />

      {/* Translate Action */}
      <button
        type="button"
        className="netai-slider-btn translate-btn"
        onClick={handleTranslate}
        title="Translate highlighted text with NetAI"
      >
        <Languages size={14} className="btn-icon" />
        <span>Translate</span>
      </button>
    </div>
  );
}
