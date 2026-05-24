import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, FileText, CheckCircle2, XCircle, Code, Eye, ChevronRight, Terminal, RefreshCw } from 'lucide-react';
import { runCSharp } from '../utils/csharpInterpreter';
import VisualSimulator from './VisualSimulator';

// Helper to render markdown problems without a heavy library
function CustomMarkdown({ content }) {
  const lines = content.split('\n');
  return (
    <div className="markdown-body">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          return <h2 key={index}>{trimmed.replace('## ', '')}</h2>;
        }
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return <li key={index} style={{ marginLeft: '20px', marginBottom: '4px' }}>{trimmed.slice(2)}</li>;
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return <p key={index} style={{ fontWeight: 'bold', marginTop: '10px' }}>{trimmed.replace(/\*\*/g, '')}</p>;
        }
        if (trimmed.startsWith('    ') || trimmed.startsWith('\t')) {
          return <pre key={index}>{line}</pre>;
        }
        if (trimmed === '') return <div key={index} style={{ height: '8px' }} />;
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
}

export default function CodeWorkspace({ question, onBack }) {
  const [activeLeftTab, setActiveLeftTab] = useState('problem');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [userCode, setUserCode] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [runSuccess, setRunSuccess] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [runningTests, setRunningTests] = useState(false);

  const localStorageKey = `tcs_csharp_code_${question.id}`;

  // Get initial editor template code
  const getTemplateCode = () => {
    // Generate a skeleton template based on reference code
    const lines = question.referenceCode.split('\n');
    let inMain = false;
    let inMethod = false;
    const skeletonLines = lines.map(line => {
      // Clear Main body
      if (line.includes('public static void Main') || line.includes('static void Main')) {
        inMain = true;
        return line;
      }
      if (inMain && line.trim() === '{') {
        return line + '\n            // Write input reading and method invocation logic here';
      }
      if (inMain && line.trim() === '}') {
        inMain = false;
        return line;
      }
      if (inMain) return null;

      // Clear core static helper method body
      if (line.includes('public static') && !line.includes('Main')) {
        inMethod = true;
        return line;
      }
      if (inMethod && line.trim() === '{') {
        return line + '\n            // Write your business logic here\n            return null;';
      }
      if (inMethod && line.trim() === '}') {
        inMethod = false;
        return line;
      }
      if (inMethod) return null;

      return line;
    }).filter(l => l !== null);

    return skeletonLines.join('\n');
  };

  // Load user saved code or template
  useEffect(() => {
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      setUserCode(saved);
    } else {
      setUserCode(getTemplateCode());
    }
    // Reset status
    setConsoleLogs([]);
    setRunSuccess(null);
    setTestResults([]);
    setActiveLeftTab('problem');
    setActiveRightTab('code');
  }, [question]);

  const handleEditorChange = (value) => {
    setUserCode(value);
    localStorage.setItem(localStorageKey, value);
  };

  const handleResetCode = () => {
    if (window.confirm("Are you sure you want to reset your code to the default skeleton?")) {
      const template = getTemplateCode();
      setUserCode(template);
      localStorage.setItem(localStorageKey, template);
    }
  };

  const runCodeWithInput = (inputString, showLog = true) => {
    if (showLog) {
      setConsoleLogs(["[System] Transpiling C# code...", "[System] Executing Program.Main()..."]);
    }
    
    const result = runCSharp(userCode, inputString);
    
    if (showLog) {
      if (result.success) {
        setRunSuccess(true);
        setConsoleLogs(prev => [
          ...prev,
          `[System] Program terminated successfully.\n`,
          `--- Console Output ---`,
          result.stdout || "[No output printed]",
          `----------------------`
        ]);
        setActiveLeftTab('problem');
      } else {
        setRunSuccess(false);
        setConsoleLogs(prev => [
          ...prev,
          `[Compilation / Runtime Error] ${result.error}`,
          `----------------------------------`
        ]);
      }
    }
    return result;
  };

  const handleRunTests = () => {
    setRunningTests(true);
    setTestResults([]);
    
    setTimeout(() => {
      const results = question.testCases.map((tc, idx) => {
        const res = runCSharp(userCode, tc.input);
        const actual = (res.stdout || "").trim().replace(/\r/g, "");
        const expected = (tc.output || "").trim().replace(/\r/g, "");
        const passed = actual === expected;
        
        return {
          id: idx + 1,
          passed,
          input: tc.input,
          expected,
          actual: res.success ? actual : `Error: ${res.error}`
        };
      });

      setTestResults(results);
      setRunningTests(false);
      setActiveLeftTab('tests');

      // Update progress in localStorage
      const allPassed = results.every(r => r.passed);
      const progressKey = `tcs_progress_${question.id}`;
      if (allPassed) {
        localStorage.setItem(progressKey, 'completed');
      } else {
        localStorage.setItem(progressKey, 'progress');
      }
    }, 600);
  };

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={onBack} style={{ padding: '8px 12px' }}>
            Back
          </button>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{question.title}</h2>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
              <span className="badge badge-medium">{question.category}</span>
              <span className={`badge badge-${question.difficulty.toLowerCase()}`}>{question.difficulty}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={handleResetCode}>
            <RefreshCw size={14} /> Reset Code
          </button>
          <button className="btn-primary" onClick={handleRunTests}>
            <CheckCircle2 size={16} /> Run Test Suite
          </button>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="workspace-container">
        
        {/* LEFT PANEL: Problem / Simulator / Test Suite */}
        <div className="workspace-panel">
          <div className="panel-header">
            <div className="tabs-row">
              <button 
                className={`tab-btn ${activeLeftTab === 'problem' ? 'active' : ''}`}
                onClick={() => setActiveLeftTab('problem')}
              >
                <FileText size={14} style={{ marginRight: '4px', display: 'inline' }} />
                Problem
              </button>
              <button 
                className={`tab-btn ${activeLeftTab === 'simulator' ? 'active' : ''}`}
                onClick={() => setActiveLeftTab('simulator')}
              >
                <Play size={12} style={{ marginRight: '4px', display: 'inline' }} />
                Simulator
              </button>
              <button 
                className={`tab-btn ${activeLeftTab === 'tests' ? 'active' : ''}`}
                onClick={() => setActiveLeftTab('tests')}
              >
                <CheckCircle2 size={14} style={{ marginRight: '4px', display: 'inline' }} />
                Test Suite {testResults.length > 0 && `(${testResults.filter(r=>r.passed).length}/${testResults.length})`}
              </button>
            </div>
          </div>

          <div className="panel-body">
            {activeLeftTab === 'problem' && (
              <CustomMarkdown content={question.problemStatement} />
            )}

            {activeLeftTab === 'simulator' && (
              <VisualSimulator 
                question={question} 
                onRun={(inputStr) => runCodeWithInput(inputStr, true)} 
              />
            )}

            {activeLeftTab === 'tests' && (
              <div className="test-suite animate-fade">
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Test Verification Results</h3>
                
                {runningTests && <p style={{ color: 'var(--text-secondary)' }}>Verifying test cases...</p>}
                
                {!runningTests && testResults.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    No tests run yet. Click "Run Test Suite" in the top right to verify your code.
                  </p>
                )}

                {!runningTests && testResults.map((tr) => (
                  <div key={tr.id} className="test-case-item glass-panel">
                    <div className="test-case-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {tr.passed ? (
                          <CheckCircle2 size={18} color="var(--success)" />
                        ) : (
                          <XCircle size={18} color="var(--danger)" />
                        )}
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>Test Case #{tr.id}</span>
                      </div>
                      <span className={`badge ${tr.passed ? 'badge-easy' : 'badge-hard'}`}>
                        {tr.passed ? "Passed" : "Failed"}
                      </span>
                    </div>

                    <div className="test-case-body">
                      <div className="test-diff-grid">
                        <div className="diff-col">
                          <h4>Expected Output</h4>
                          <div className="diff-box" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                            {tr.expected}
                          </div>
                        </div>
                        <div className="diff-col">
                          <h4>Actual Output</h4>
                          <div 
                            className="diff-box" 
                            style={{ 
                              borderColor: tr.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: tr.passed ? 'var(--success)' : 'var(--danger)'
                            }}
                          >
                            {tr.actual}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Editor & Terminal Console */}
        <div className="workspace-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Header tabs for Editor vs. Reference */}
          <div className="panel-header">
            <div className="tabs-row">
              <button 
                className={`tab-btn ${activeRightTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveRightTab('code')}
              >
                <Code size={14} style={{ marginRight: '4px', display: 'inline' }} />
                Your Solution (Program.cs)
              </button>
              <button 
                className={`tab-btn ${activeRightTab === 'reference' ? 'active' : ''}`}
                onClick={() => setActiveRightTab('reference')}
              >
                <Eye size={14} style={{ marginRight: '4px', display: 'inline' }} />
                Reference C# Solution
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="editor-container" style={{ flexGrow: 1, position: 'relative' }}>
            {activeRightTab === 'code' ? (
              <Editor
                height="100%"
                language="csharp"
                theme="vs-dark"
                value={userCode}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  cursorBlinking: 'smooth',
                  padding: { top: 12 },
                  automaticLayout: true
                }}
              />
            ) : (
              <Editor
                height="100%"
                language="csharp"
                theme="vs-dark"
                value={question.referenceCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 12 },
                  automaticLayout: true
                }}
              />
            )}
          </div>

          {/* Simulated Terminal Console Output */}
          <div className="console-panel" style={{ height: '180px', flexGrow: 0, marginTop: '16px' }}>
            <div className="console-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} />
                Simulated Console Terminal
              </span>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setConsoleLogs([])}
              >
                Clear
              </button>
            </div>
            
            <div className="console-body">
              {consoleLogs.length === 0 && (
                <span className="console-system">&gt; Terminal ready. Select the 'Simulator' tab on the left to execute custom inputs, or run the test suite above.</span>
              )}
              {consoleLogs.map((log, index) => {
                let logClass = "console-line";
                if (log.startsWith("[System]")) logClass = "console-system";
                else if (log.startsWith("[Compilation")) logClass = "console-error";
                else if (log.includes("terminated successfully")) logClass = "console-success";

                return (
                  <pre key={index} className={logClass}>
                    {log}
                  </pre>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
