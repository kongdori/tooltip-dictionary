import { useState, useEffect } from 'react';
import { browser } from 'wxt/browser';
import { getOptions, setOptions, TooltipOptions } from '../../utils/optionStorage';
import './App.css';

function App() {
  const [active, setActive] = useState(true);
  const [delayTime, setDelayTime] = useState(200);
  const [fontSize, setFontSize] = useState(10);
  const [tooltipPosition, setTooltipPosition] = useState('down');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const delayTimeMin = 100;
  const delayTimeMax = 1000;
  const fontSizeMin = 5;
  const fontSizeMax = 15;
  const positionOptions = ['down', 'up'];

  // Load settings on initial mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await getOptions(['active', 'delayTime', 'fontSize', 'tooltipYPosition']);
        setActive(options.active);
        setDelayTime(options.delayTime);
        setFontSize(options.fontSize);
        setTooltipPosition(options.tooltipYPosition);
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    
    loadOptions();
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (isLoaded) {
      const saveOptions = async () => {
        try {
          await setOptions({
            active,
            delayTime,
            fontSize,
            tooltipYPosition: tooltipPosition
          });
        } catch (error) {
          console.error('Error saving options:', error);
        }
      };
      
      saveOptions();
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
                <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
