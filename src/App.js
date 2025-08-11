import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [panelSize, setPanelSize] = useState({ width: 400, height: 300 });
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startMovePos, setStartMovePos] = useState({ x: 0, y: 0 });
  const [startPanelPos, setStartPanelPos] = useState({ x: 0, y: 0 });
  const panelRef = useRef(null);

  const handleMouseDown = (e, direction) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: panelSize.width, height: panelSize.height });
    setStartPanelPos({ x: panelPosition.x, y: panelPosition.y });
  };

  const handleHeaderMouseDown = (e) => {
    e.preventDefault();
    setIsMoving(true);
    setStartMovePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      let newWidth = startSize.width;
      let newHeight = startSize.height;
      let newX = startPanelPos.x;
      let newY = startPanelPos.y;

      // Handle different resize directions
      switch (resizeDirection) {
        case 'right':
          newWidth = Math.max(200, startSize.width + deltaX);
          break;
        case 'left':
          newWidth = Math.max(200, startSize.width - deltaX);
          newX = startPanelPos.x + deltaX;
          break;
        case 'bottom':
          newHeight = Math.max(150, startSize.height + deltaY);
          break;
        case 'top':
          newHeight = Math.max(150, startSize.height - deltaY);
          newY = startPanelPos.y + deltaY;
          break;
        case 'se':
          newWidth = Math.max(200, startSize.width + deltaX);
          newHeight = Math.max(150, startSize.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(200, startSize.width - deltaX);
          newHeight = Math.max(150, startSize.height + deltaY);
          newX = startPanelPos.x + deltaX;
          break;
        case 'ne':
          newWidth = Math.max(200, startSize.width + deltaX);
          newHeight = Math.max(150, startSize.height - deltaY);
          newY = startPanelPos.y + deltaY;
          break;
        case 'nw':
          newWidth = Math.max(200, startSize.width - deltaX);
          newHeight = Math.max(150, startSize.height - deltaY);
          newX = startPanelPos.x + deltaX;
          newY = startPanelPos.y + deltaY;
          break;
        default:
          break;
      }

      setPanelSize({ width: newWidth, height: newHeight });
      setPanelPosition({ x: newX, y: newY });
    }

    if (isMoving) {
      const deltaX = e.clientX - startMovePos.x;
      const deltaY = e.clientY - startMovePos.y;
      
      setPanelPosition({
        x: panelPosition.x + deltaX,
        y: panelPosition.y + deltaY
      });
      
      setStartMovePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setIsMoving(false);
    setResizeDirection(null);
  };

  useEffect(() => {
    if (isResizing || isMoving) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, isMoving, resizeDirection, startPos, startSize, startMovePos, startPanelPos, panelPosition]);

  return (
    <div className="App">
      <div 
        className="panel" 
        ref={panelRef}
        style={{ 
          width: `${panelSize.width}px`, 
          height: `${panelSize.height}px`,
          maxWidth: 'none',
          transform: `translate(${panelPosition.x}px, ${panelPosition.y}px)`
        }}
      >
        {/* Corner resize handles */}
        <div 
          className="resize-corner nw" 
          onMouseDown={(e) => handleMouseDown(e, 'nw')}
        ></div>
        <div 
          className="resize-corner ne" 
          onMouseDown={(e) => handleMouseDown(e, 'ne')}
        ></div>
        <div 
          className="resize-corner sw" 
          onMouseDown={(e) => handleMouseDown(e, 'sw')}
        ></div>
        <div 
          className="resize-corner se" 
          onMouseDown={(e) => handleMouseDown(e, 'se')}
        ></div>
        
        {/* Edge resize handles */}
        <div 
          className="resize-edge top" 
          onMouseDown={(e) => handleMouseDown(e, 'top')}
        ></div>
        <div 
          className="resize-edge bottom" 
          onMouseDown={(e) => handleMouseDown(e, 'bottom')}
        ></div>
        <div 
          className="resize-edge left" 
          onMouseDown={(e) => handleMouseDown(e, 'left')}
        ></div>
        <div 
          className="resize-edge right" 
          onMouseDown={(e) => handleMouseDown(e, 'right')}
        ></div>
        
        <div 
          className="header-bar"
          onMouseDown={handleHeaderMouseDown}
        >
          <div className="header-title">My App</div>
          <div className="header-actions">
            <button className="header-button">−</button>
            <button className="header-button">□</button>
            <button className="header-button close">×</button>
          </div>
        </div>
        <div className="panel-content">
          <h1>Hello World!</h1>
          <p>Welcome to your Electron React application</p>
          <p>Current size: {panelSize.width} × {panelSize.height}</p>
          <p>Position: ({panelPosition.x}, {panelPosition.y})</p>
        </div>
      </div>
    </div>
  );
}

export default App;
