import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const defaultSettings = {
    active: true,
    delayTime: 200,
    fontSize: 10,
    tooltipPosition: 'Down'
  };

  const [active, setActive] = useState(defaultSettings.active);
  const [delayTime, setDelayTime] = useState(defaultSettings.delayTime);
  const [fontSize, setFontSize] = useState(defaultSettings.fontSize);
  const [tooltipPosition, setTooltipPosition] = useState(defaultSettings.tooltipPosition);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const delayTimeMin = 100;
  const delayTimeMax = 1000;
  const fontSizeMin = 5;
  const fontSizeMax = 15;
  const positionOptions = ['Down', 'Up'];

  useEffect(() => {
    browser.storage.sync.get(defaultSettings, (items) => {
      setActive(items.active);
      setDelayTime(items.delayTime);
      setFontSize(items.fontSize);
      setTooltipPosition(items.tooltipPosition);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (isLoaded) {
      browser.storage.sync.set({ active, delayTime, fontSize, tooltipPosition });
    }
  }, [active, delayTime, fontSize, tooltipPosition, isLoaded]);

  return (
    <div className="popup-container">
      <div className="popup-card">
        <div className="popup-header">
          <h1 className="popup-title">Tooltip Dictionary</h1>
          <div className="toggle-switch">
            <label className="switch">
              <input 
                type="checkbox" 
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <div className="popup-content">
          <div className="setting-group">
            <div className="setting-row">
              <label htmlFor="delay-time-control">Delay Time</label>
              <span className="value-display">{delayTime}ms</span>
            </div>
            <input 
              type="range" 
              id="delay-time-control" 
              min={delayTimeMin} 
              max={delayTimeMax} 
              step="100"
              value={delayTime}
              onChange={(e) => setDelayTime(parseInt(e.target.value))}
              className="range-slider"
            />
          </div>
          
          <div className="setting-group">
            <div className="setting-row">
              <label htmlFor="font-size-control">Font Size</label>
              <span className="value-display">{fontSize}</span>
            </div>
            <input 
              type="range" 
              id="font-size-control" 
              min={fontSizeMin} 
              max={fontSizeMax} 
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="range-slider"
            />
          </div>
          
          <div className="setting-group">
            <label htmlFor="tooltip-position-control">Tooltip Position</label>
            <select 
              id="tooltip-position-control"
              value={tooltipPosition}
              onChange={(e) => setTooltipPosition(e.target.value)}
              className="select-input"
            >
              {positionOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
