import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [active, setActive] = useState(false);
  const [delayTime, setDelayTime] = useState(300);
  const [fontSize, setFontSize] = useState(10);
  const [tooltipPosition, setTooltipPosition] = useState('');
  
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
    if (delayTime && fontSize && tooltipPosition) {
      // Would typically save to Chrome storage API
      console.log('Saving settings:', { active, delayTime, fontSize, tooltipPosition });
    }
  }, [active, delayTime, fontSize, tooltipPosition]);

  return (
    <div className="row" id="popup_whole_row">
      <div className="col s12 m12" id="popup_whole_col">
        <div className="card blue-grey darken-1">
          <div className="card-content white-text">
            <div className="card-title row">
              <div className="col s6" id="extension_name">Tooltip Dictionary</div>
              <div className="col s6 switch">
                <label className="option_value">
                  <input 
                    type="checkbox" 
                    id="active_control"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  <span className="lever"></span>
                </label>
              </div>
            </div>
            <div className="option_row"> 
              <div className="col s6 option_name">Delay Time</div>
              <div className="input-field col s6">
                <div className="option_value">
                  <div className="range-field">
                    <input 
                      type="range" 
                      id="delayTime_control" 
                      min={delayTimeMin} 
                      max={delayTimeMax} 
                      step="100"
                      value={delayTime}
                      onChange={(e) => setDelayTime(parseInt(e.target.value))}
                    />
                    <span className="value-display">{delayTime}ms</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="option_row"> 
              <div className="col s6 option_name">Font Size</div>
              <div className="input-field col s6">
                <div className="option_value">
                  <div className="range-field">
                    <input 
                      type="range" 
                      id="fontSize_control" 
                      min={fontSizeMin} 
                      max={fontSizeMax} 
                      step="1"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                    />
                    <span className="value-display">{fontSize}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="option_row"> 
              <div className="col s6 option_name">Tooltip Position</div>
              <div className="input-field col s6">
                <div className="option_value">
                  <div>
                    <select 
                      id="tooltipYPosition_control"
                      value={tooltipPosition}
                      onChange={(e) => setTooltipPosition(e.target.value)}
                    >
                      {positionOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
