import { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Move } from 'lucide-react';
import './InteractiveSchematicViewer.css';

// Pre-load clean transparent edge-to-edge SVGs
import starSvg from '../assets/topologies/star.svg';
import busSvg from '../assets/topologies/bus.svg';
import ringSvg from '../assets/topologies/ring.svg';
import meshSvg from '../assets/topologies/mesh.svg';
import treeSvg from '../assets/topologies/tree.svg';
import hybridSvg from '../assets/topologies/hybrid.svg';

const SCHEMATIC_SVGS = {
  star: starSvg,
  bus: busSvg,
  ring: ringSvg,
  mesh: meshSvg,
  tree: treeSvg,
  hybrid: hybridSvg
};

export default function InteractiveSchematicViewer({ topologyKey = 'star', topologyName = 'Topology' }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSvg = SCHEMATIC_SVGS[topologyKey] || SCHEMATIC_SVGS.star;

  // Reset view when topology changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [topologyKey]);

  // Zoom handlers (generous zoom-out down to 0.5 and zoom-in up to 4.0)
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (zoom !== 1) {
      handleReset();
    } else {
      setZoom(1.6);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => {
      const next = prev + zoomFactor;
      return Math.min(Math.max(Number(next.toFixed(2)), 0.5), 4.0);
    });
  };

  // Drag & Pan handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile / tablet
  const touchStartRef = useRef({ x: 0, y: 0, dist: 0 });

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = (dist - touchStartRef.current.dist) * 0.005;
      setZoom((prev) => Math.min(Math.max(prev + factor, 0.75), 3.5));
      touchStartRef.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Fullscreen escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div className={`interactive-schematic-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Viewport Frame (Touches the borders edge-to-edge) */}
      <div
        ref={containerRef}
        className={`schematic-viewport ${isDragging ? 'is-dragging' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Floating Pan/Zoom Control Bar (Top Right) */}
        <div className="schematic-toolbar-floating" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="toolbar-btn"
            onClick={handleZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          <button
            type="button"
            className="toolbar-btn reset-btn"
            onClick={handleReset}
            title="Reset Zoom & Pan (100%)"
            aria-label="Reset View"
          >
            <RotateCcw size={13} />
            <span>{Math.round(zoom * 100)}%</span>
          </button>

          <div className="toolbar-divider" />

          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* Floating Usage Hint (Bottom Left) */}
        <div className="schematic-hint-floating">
          <Move size={12} />
          <span>Drag to pan · Scroll to zoom</span>
        </div>

        {/* Transformable Canvas Stage - Edge to Edge, No Background */}
        <div
          className="schematic-canvas-stage"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={currentSvg}
            alt={`${topologyName} Technical Architecture Schematic`}
            className="schematic-edge-vector"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
