import React, { useState, useEffect } from 'react';
import { Play, Sparkles, RefreshCw } from 'lucide-react';

export default function VisualSimulator({ question, onRun }) {
  const [inputs, setInputs] = useState({});
  const folder = question.folderName;

  // Initialize input state depending on the active question
  useEffect(() => {
    const defaultState = {};
    if (folder === "Associate_For_Given_Technology") {
      for (let i = 1; i <= 5; i++) {
        defaultState[`id_${i}`] = 100 + i;
        defaultState[`name_${i}`] = ["Alex", "Albert", "Alferd", "Alfa", "Almas"][i - 1];
        defaultState[`tech_${i}`] = ["Java", "Unix", "Testing", "Java", "Java"][i - 1];
        defaultState[`exp_${i}`] = [15, 20, 13, 15, 29][i - 1];
      }
      defaultState["searchTech"] = "Java";
    } else if (folder === "AutonomousCar") {
      const brands = ["Tesla", "Ford", "Royce", "Mercedez"];
      const envs = ["Hills", "Desert", "Hills", "Desert"];
      for (let i = 1; i <= 4; i++) {
        defaultState[`carId_${i}`] = 100 * i;
        defaultState[`brand_${i}`] = brands[i - 1];
        defaultState[`testsConducted_${i}`] = 1000 * i;
        defaultState[`testsPassed_${i}`] = [500, 1500, 1700, 400][i - 1];
        defaultState[`env_${i}`] = envs[i - 1];
      }
      defaultState["searchEnv"] = "Desert";
      defaultState["searchBrand"] = "Mercedez";
    } else if (folder === "Device_Management") {
      const types = ["Router", "Switch", "Firewall", "Server"];
      const brands = ["Cisco", "Juniper", "PaloAlto", "Dell"];
      const statuses = ["Active", "Inactive", "Active", "Active"];
      for (let i = 1; i <= 4; i++) {
        defaultState[`id_${i}`] = i;
        defaultState[`type_${i}`] = types[i - 1];
        defaultState[`brand_${i}`] = brands[i - 1];
        defaultState[`price_${i}`] = [15000, 25000, 45000, 80000][i - 1];
        defaultState[`status_${i}`] = statuses[i - 1];
      }
      defaultState["searchType"] = "Router";
      defaultState["searchBrand"] = "Dell";
    } else if (folder === "Institution") {
      const names = ["IIT", "BITS", "VIT", "MIT"];
      const locations = ["Mumbai", "Pilani", "Vellore", "Manipal"];
      for (let i = 1; i <= 4; i++) {
        defaultState[`id_${i}`] = 100 + i;
        defaultState[`name_${i}`] = names[i - 1];
        defaultState[`students_${i}`] = [1000, 800, 1200, 1500][i - 1];
        defaultState[`placed_${i}`] = [95, 90, 85, 80][i - 1];
        defaultState[`location_${i}`] = locations[i - 1];
      }
      defaultState["searchLocation"] = "Mumbai";
      defaultState["searchInstitution"] = "VIT";
    } else if (folder === "Inventory_Replenish") {
      for (let i = 1; i <= 4; i++) {
        defaultState[`id_${i}`] = i;
        defaultState[`name_${i}`] = `Item${String.fromCharCode(64 + i)}`;
        defaultState[`max_${i}`] = [100, 200, 150, 80][i - 1];
        defaultState[`curr_${i}`] = [50, 150, 75, 40][i - 1];
      }
      defaultState["threshold"] = 100;
    } else {
      // Fallback: plain text raw inputs
      defaultState["rawText"] = question.testCases[0]?.input || "";
    }
    setInputs(defaultState);
  }, [question]);

  const handleInputChange = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleSimulate = () => {
    let inputLines = [];

    if (folder === "Associate_For_Given_Technology") {
      for (let i = 1; i <= 5; i++) {
        inputLines.push(inputs[`id_${i}`] || "");
        inputLines.push(inputs[`name_${i}`] || "");
        inputLines.push(inputs[`tech_${i}`] || "");
        inputLines.push(inputs[`exp_${i}`] || "");
      }
      inputLines.push(inputs["searchTech"] || "");
    } else if (folder === "AutonomousCar") {
      for (let i = 1; i <= 4; i++) {
        inputLines.push(inputs[`carId_${i}`] || "");
        inputLines.push(inputs[`brand_${i}`] || "");
        inputLines.push(inputs[`testsConducted_${i}`] || "");
        inputLines.push(inputs[`testsPassed_${i}`] || "");
        inputLines.push(inputs[`env_${i}`] || "");
      }
      inputLines.push(inputs["searchEnv"] || "");
      inputLines.push(inputs["searchBrand"] || "");
    } else if (folder === "Device_Management") {
      for (let i = 1; i <= 4; i++) {
        inputLines.push(inputs[`id_${i}`] || "");
        inputLines.push(inputs[`type_${i}`] || "");
        inputLines.push(inputs[`brand_${i}`] || "");
        inputLines.push(inputs[`price_${i}`] || "");
        inputLines.push(inputs[`status_${i}`] || "");
      }
      inputLines.push(inputs["searchType"] || "");
      inputLines.push(inputs["searchBrand"] || "");
    } else if (folder === "Institution") {
      for (let i = 1; i <= 4; i++) {
        inputLines.push(inputs[`id_${i}`] || "");
        inputLines.push(inputs[`name_${i}`] || "");
        inputLines.push(inputs[`students_${i}`] || "");
        inputLines.push(inputs[`placed_${i}`] || "");
        inputLines.push(inputs[`location_${i}`] || "");
      }
      inputLines.push(inputs["searchLocation"] || "");
      inputLines.push(inputs["searchInstitution"] || "");
    } else if (folder === "Inventory_Replenish") {
      for (let i = 1; i <= 4; i++) {
        inputLines.push(inputs[`id_${i}`] || "");
        inputLines.push(inputs[`name_${i}`] || "");
        inputLines.push(inputs[`max_${i}`] || "");
        inputLines.push(inputs[`curr_${i}`] || "");
      }
      inputLines.push(inputs["threshold"] || "");
    } else {
      inputLines = (inputs["rawText"] || "").split("\n");
    }

    onRun(inputLines.join("\n"));
  };

  // Render form rows depending on folder name
  const renderFormContent = () => {
    if (folder === "Associate_For_Given_Technology") {
      return (
        <div className="simulator-form animate-fade">
          <div className="form-grid-header">
            <div>ID</div>
            <div>Name</div>
            <div>Technology</div>
            <div>Exp (Yrs)</div>
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="form-grid-row">
              <input 
                type="number" 
                value={inputs[`id_${i}`] || ''} 
                onChange={e => handleInputChange(`id_${i}`, e.target.value)} 
              />
              <input 
                type="text" 
                value={inputs[`name_${i}`] || ''} 
                onChange={e => handleInputChange(`name_${i}`, e.target.value)} 
              />
              <input 
                type="text" 
                value={inputs[`tech_${i}`] || ''} 
                onChange={e => handleInputChange(`tech_${i}`, e.target.value)} 
              />
              <input 
                type="number" 
                value={inputs[`exp_${i}`] || ''} 
                onChange={e => handleInputChange(`exp_${i}`, e.target.value)} 
              />
            </div>
          ))}
          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>Search Technology (Target)</label>
            <input 
              type="text" 
              value={inputs["searchTech"] || ''} 
              onChange={e => handleInputChange("searchTech", e.target.value)} 
            />
          </div>
        </div>
      );
    }

    if (folder === "AutonomousCar") {
      return (
        <div className="simulator-form animate-fade">
          <div className="form-grid-header">
            <div>Car ID</div>
            <div>Brand</div>
            <div>Tests Conducted</div>
            <div>Tests Passed</div>
            <div>Environment</div>
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr 1fr 1fr', gap: '8px' }}>
              <input 
                type="number" 
                value={inputs[`carId_${i}`] || ''} 
                onChange={e => handleInputChange(`carId_${i}`, e.target.value)} 
              />
              <input 
                type="text" 
                value={inputs[`brand_${i}`] || ''} 
                onChange={e => handleInputChange(`brand_${i}`, e.target.value)} 
              />
              <input 
                type="number" 
                value={inputs[`testsConducted_${i}`] || ''} 
                onChange={e => handleInputChange(`testsConducted_${i}`, e.target.value)} 
              />
              <input 
                type="number" 
                value={inputs[`testsPassed_${i}`] || ''} 
                onChange={e => handleInputChange(`testsPassed_${i}`, e.target.value)} 
              />
              <input 
                type="text" 
                value={inputs[`env_${i}`] || ''} 
                onChange={e => handleInputChange(`env_${i}`, e.target.value)} 
              />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="form-group">
              <label>Search Environment</label>
              <input 
                type="text" 
                value={inputs["searchEnv"] || ''} 
                onChange={e => handleInputChange("searchEnv", e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Search Brand</label>
              <input 
                type="text" 
                value={inputs["searchBrand"] || ''} 
                onChange={e => handleInputChange("searchBrand", e.target.value)} 
              />
            </div>
          </div>
        </div>
      );
    }

    if (folder === "Device_Management") {
      return (
        <div className="simulator-form animate-fade">
          <div className="form-grid-header">
            <div>ID</div>
            <div>Type</div>
            <div>Brand</div>
            <div>Price</div>
            <div>Status</div>
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 1fr 1fr', gap: '8px' }}>
              <input 
                type="number" 
                value={inputs[`id_${i}`] || ''} 
                onChange={e => handleInputChange(`id_${i}`, e.target.value)} 
              />
              <input 
                type="text" 
                value={inputs[`type_${i}`] || ''} 
                onChange={e => handleInputChange(`type_${i}`, e.target.value)} 
              />
              <input 
                type="text" 
                value={inputs[`brand_${i}`] || ''} 
                onChange={e => handleInputChange(`brand_${i}`, e.target.value)} 
              />
              <input 
                type="number" 
                value={inputs[`price_${i}`] || ''} 
                onChange={e => handleInputChange(`price_${i}`, e.target.value)} 
              />
              <input 
                type="text" 
                value={inputs[`status_${i}`] || ''} 
                onChange={e => handleInputChange(`status_${i}`, e.target.value)} 
              />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="form-group">
              <label>Search Device Type</label>
              <input 
                type="text" 
                value={inputs["searchType"] || ''} 
                onChange={e => handleInputChange("searchType", e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label>Search Brand</label>
              <input 
                type="text" 
                value={inputs["searchBrand"] || ''} 
                onChange={e => handleInputChange("searchBrand", e.target.value)} 
              />
            </div>
          </div>
        </div>
      );
    }

    if (folder === "Institution" || folder === "Inventory_Replenish") {
      const isReplenish = folder === "Inventory_Replenish";
      return (
        <div className="simulator-form animate-fade">
          <div className="form-grid-header">
            <div>ID</div>
            <div>Name</div>
            <div>{isReplenish ? "Max Qty" : "Total Students"}</div>
            <div>{isReplenish ? "Current Qty" : "Placed Students"}</div>
            {!isReplenish && <div>Location</div>}
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: isReplenish ? '60px 1fr 1fr 1fr' : '60px 1fr 1fr 1fr 1fr', gap: '8px' }}>
              <input 
                type="number" 
                value={inputs[`id_${i}`] || ''} 
                onChange={e => handleInputChange(`id_${i}`, e.target.value)} 
              />
              <input 
                type="text" 
                value={inputs[`name_${i}`] || ''} 
                onChange={e => handleInputChange(`name_${i}`, e.target.value)} 
              />
              <input 
                type="number" 
                value={inputs[isReplenish ? `max_${i}` : `students_${i}`] || ''} 
                onChange={e => handleInputChange(isReplenish ? `max_${i}` : `students_${i}`, e.target.value)} 
              />
              <input 
                type="number" 
                value={inputs[isReplenish ? `curr_${i}` : `placed_${i}`] || ''} 
                onChange={e => handleInputChange(isReplenish ? `curr_${i}` : `placed_${i}`, e.target.value)} 
              />
              {!isReplenish && (
                <input 
                  type="text" 
                  value={inputs[`location_${i}`] || ''} 
                  onChange={e => handleInputChange(`location_${i}`, e.target.value)} 
                />
              )}
            </div>
          ))}
          {isReplenish ? (
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Threshold Quantity</label>
              <input 
                type="number" 
                value={inputs["threshold"] || ''} 
                onChange={e => handleInputChange("threshold", e.target.value)} 
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="form-group">
                <label>Search Location</label>
                <input 
                  type="text" 
                  value={inputs["searchLocation"] || ''} 
                  onChange={e => handleInputChange("searchLocation", e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Search Institution Name</label>
                <input 
                  type="text" 
                  value={inputs["searchInstitution"] || ''} 
                  onChange={e => handleInputChange("searchInstitution", e.target.value)} 
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default Fallback Form (Raw Text Console Mockup)
    return (
      <div className="simulator-form animate-fade">
        <div className="form-group">
          <label>Raw Console Input Stream (one entry per line)</label>
          <textarea
            value={inputs["rawText"] || ''}
            onChange={e => handleInputChange("rawText", e.target.value)}
            rows={10}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              resize: 'vertical'
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="simulator-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={16} color="var(--primary)" />
        Interactive Visual Simulator
      </div>
      
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Fill in the visual data fields below. We will feed these fields line-by-line as inputs directly into your C# console app!
      </p>

      <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
        {renderFormContent()}
      </div>

      <button className="btn-primary" onClick={handleSimulate} style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
        <Play size={16} fill="white" />
        Run Simulator
      </button>
    </div>
  );
}
