import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [active, setActive] = useState(false);
  const [delayTime, setDelayTime] = useState(300);
  const [fontSize, setFontSize] = useState(10);
  const [tooltipPosition, setTooltipPosition] = useState('Up');
  
  // Options for selects and sliders
  const delayTimeMin = 100;
  const delayTimeMax = 1000;
  const fontSizeMin = 5;
  const fontSizeMax = 15;
  const positionOptions = ['Up', 'Down'];

  // Load saved settings when component mounts
  useEffect(() => {
    // This would typically fetch from Chrome storage API
    // For now just using placeholder values
    setActive(true);
    setDelayTime(300); // default to 300ms
    setFontSize(10); // default to 10
    setTooltipPosition(positionOptions[0]); // default to up
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (tooltipPosition) {
      // Would typically save to Chrome storage API
      console.log('Saving settings:', { active, delayTime, fontSize, tooltipPosition });
    }
  }, [active, delayTime, fontSize, tooltipPosition]);

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
              <label htmlFor="delayTime_control">Delay Time</label>
              <span className="value-display">{delayTime}ms</span>
            </div>
            <input 
              type="range" 
              id="delayTime_control" 
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
              <label htmlFor="fontSize_control">Font Size</label>
              <span className="value-display">{fontSize}</span>
            </div>
            <input 
              type="range" 
              id="fontSize_control" 
              min={fontSizeMin} 
              max={fontSizeMax} 
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="range-slider"
            />
          </div>
          
          <div className="setting-group">
            <label htmlFor="tooltipPosition_control">Tooltip Position</label>
            <select 
              id="tooltipPosition_control"
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
