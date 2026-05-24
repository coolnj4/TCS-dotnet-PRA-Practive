import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle2, XCircle, AlertCircle, Award, Clock, ArrowRight, ShieldCheck, ChevronRight, Terminal } from 'lucide-react';
import { runCSharp } from '../utils/csharpInterpreter';

export default function MockTest({ questions, onBack }) {
  const [examState, setExamState] = useState('welcome'); // welcome, active, finished
  const [examQuestions, setExamQuestions] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0); // 0 or 1
  const [codes, setCodes] = useState({}); // { qId: code }
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState({});

  const timerRef = useRef(null);

  // Initialize a mock assessment with 2 random questions
  const handleStartExam = () => {
    // Pick 2 random questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);
    setExamQuestions(selected);
    
    // Initialize codes
    const initialCodes = {};
    selected.forEach(q => {
      initialCodes[q.id] = getTemplateCode(q);
    });
    setCodes(initialCodes);
    setConsoleLogs({});
    
    // Start countdown
    setTimeLeft(3600);
    setExamState('active');
    setActiveIdx(0);
  };

  // Timer effect
  useEffect(() => {
    if (examState === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam(true); // Auto submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  const getTemplateCode = (q) => {
    const lines = q.referenceCode.split('\n');
    let inMain = false;
    let inMethod = false;
    const skeletonLines = lines.map(line => {
      if (line.includes('public static void Main') || line.includes('static void Main')) {
        inMain = true;
        return line;
      }
      if (inMain && line.trim() === '{') {
        return line + '\n            // Read inputs and write method invocation logic here';
      }
      if (inMain && line.trim() === '}') {
        inMain = false;
        return line;
      }
      if (inMain) return null;

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

  const handleEditorChange = (val) => {
    const qId = examQuestions[activeIdx].id;
    setCodes(prev => ({ ...prev, [qId]: val }));
  };

  const handleRunSimulator = () => {
    const activeQ = examQuestions[activeIdx];
    const qId = activeQ.id;
    const userCode = codes[qId];
    const defaultInput = activeQ.testCases[0]?.input || "";

    setConsoleLogs(prev => ({
      ...prev,
      [qId]: [`[System] Compiling C# code...`, `[System] Executing Program.Main()...`]
    }));

    const result = runCSharp(userCode, defaultInput);

    setConsoleLogs(prev => {
      const logs = [...(prev[qId] || [])];
      if (result.success) {
        logs.push(`[System] Program executed successfully.\n`);
        logs.push(`--- Console Output ---`);
        logs.push(result.stdout || "[No output printed]");
        logs.push(`----------------------`);
      } else {
        logs.push(`[Error] ${result.error}`);
      }
      return { ...prev, [qId]: logs };
    });
  };

  const handleSubmitExam = (isAuto = false) => {
    if (!isAuto && !window.confirm("Are you sure you want to submit your assessment? This will finalize your scores.")) {
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);

    setTimeout(() => {
      let totalTests = 0;
      let passedTests = 0;
      const examResults = [];

      examQuestions.forEach(q => {
        const userCode = codes[q.id];
        const questionResults = q.testCases.map((tc, idx) => {
          totalTests++;
          const res = runCSharp(userCode, tc.input);
          const actual = (res.stdout || "").trim().replace(/\r/g, "");
          const expected = (tc.output || "").trim().replace(/\r/g, "");
          const passed = actual === expected;
          
          if (passed) passedTests++;

          return {
            id: idx + 1,
            passed,
            expected,
            actual: res.success ? actual : `Error: ${res.error}`
          };
        });

        examResults.push({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          results: questionResults
        });
      });

      const finalScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
      setResults(examResults);
      setScore(finalScore);
      setSubmitting(false);
      setExamState('finished');
    }, 1200);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Welcome Screen
  if (examState === 'welcome') {
    return (
      <div className="mock-container animate-fade">
        <div className="mock-welcome glass-panel">
          <Award size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h2>TCS Xplore Mock Assessment</h2>
          <p>
            Test your readiness under standard assessment conditions. The hub will pick 2 random C# challenges for you to solve.
          </p>

          <div className="mock-rules">
            <h3>Assessment Rules & Conditions</h3>
            <ul>
              <li><strong>Time Limit:</strong> 60 Minutes (Count down starts immediately).</li>
              <li><strong>Questions:</strong> 2 Randomly picked C# object arrays & data filtering challenges.</li>
              <li><strong>Verification:</strong> Automatic verification against full test suites upon submission.</li>
              <li><strong>Sandbox Mode:</strong> Active console output preview is available during the exam.</li>
              <li><strong>Save State:</strong> Exam sessions are isolated. Regular practice code remains safe.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button className="btn-secondary" onClick={onBack}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleStartExam}>
              Start Assessment <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Finished Screen
  if (examState === 'finished') {
    const isPassed = score >= 75;
    return (
      <div className="mock-container animate-fade" style={{ maxWidth: '700px' }}>
        <div className="mock-welcome glass-panel" style={{ padding: '40px' }}>
          {isPassed ? (
            <ShieldCheck size={56} color="var(--success)" style={{ marginBottom: '16px' }} />
          ) : (
            <AlertCircle size={56} color="var(--warning)" style={{ marginBottom: '16px' }} />
          )}
          <h2 style={{ fontSize: '26px' }}>{isPassed ? "Assessment Qualified!" : "Practice Needed"}</h2>
          <p style={{ margin: '8px 0 24px 0' }}>
            {isPassed 
              ? "Congratulations! You have demonstrated exceptional mastery of TCS MBU assessment criteria."
              : "Don't discourage! Review the C# logic syntax and practice more challenges to pass."}
          </p>

          <div style={{ 
            fontSize: '56px', 
            fontWeight: 800, 
            color: isPassed ? 'var(--success)' : 'var(--warning)',
            margin: '24px 0',
            lineHeight: 1
          }}>
            {score}%
            <span style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '8px' }}>
              Final Accuracy Score
            </span>
          </div>

          {/* Detailed Question Review */}
          <div style={{ textAlign: 'left', marginTop: '32px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '16px' }}>
              Detailed Question Report
            </h3>

            {results.map((res, index) => {
              const passedCount = res.results.filter(r => r.passed).length;
              const totalCount = res.results.length;
              return (
                <div key={res.id} style={{ 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)',
                  padding: '16px',
                  borderRadius: '10px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>QUESTION #{index + 1}</span>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px' }}>{res.title}</h4>
                    <span className="badge badge-medium" style={{ marginTop: '6px', display: 'inline-block' }}>{res.difficulty}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{passedCount} / {totalCount}</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Test Cases Passed</span>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn-primary" onClick={onBack} style={{ marginTop: '32px', width: '100%', justifyContent: 'center' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active Exam Screen
  const activeQ = examQuestions[activeIdx];
  const activeQCode = codes[activeQ?.id] || "";
  const isTimeCritical = timeLeft < 600; // < 10 mins

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Exam Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
              OFFICIAL ASSESSMENT SESSION
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>TCS MBU Candidate Exam</h2>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className={`timer-box ${isTimeCritical ? 'timer-danger' : ''}`}>
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => handleSubmitExam(false)}
            disabled={submitting}
            style={{ background: 'linear-gradient(135deg, var(--danger) 0%, var(--warning) 100%)', boxShadow: 'none' }}
          >
            {submitting ? "Finalizing..." : "Submit Assessment"}
          </button>
        </div>
      </div>

      {/* Split panes for exam workspace */}
      <div className="workspace-container">
        
        {/* Left Pane - Instructions */}
        <div className="workspace-panel">
          <div className="panel-header">
            <div className="tabs-row">
              {examQuestions.map((q, idx) => (
                <button
                  key={q.id}
                  className={`tab-btn ${activeIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(idx)}
                >
                  Question #{idx + 1}
                </button>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Difficulty: {activeQ?.difficulty}
            </span>
          </div>

          <div className="panel-body" style={{ padding: '24px' }}>
            <div className="markdown-body">
              <h2>Problem Statement</h2>
              <p style={{ whiteSpace: 'pre-wrap' }}>{activeQ?.problemStatement}</p>
            </div>
          </div>
        </div>

        {/* Right Pane - Monaco Editor & Sandbox Output */}
        <div className="workspace-panel">
          <div className="panel-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
              Program.cs (Exam Sandbox)
            </span>
            <button className="tab-btn" onClick={handleRunSimulator} style={{ padding: '4px 8px', fontSize: '12px' }}>
              <Play size={10} fill="white" style={{ display: 'inline', marginRight: '4px' }} />
              Test Console Input
            </button>
          </div>

          <div className="editor-container" style={{ flexGrow: 1 }}>
            <Editor
              height="100%"
              language="csharp"
              theme="vs-dark"
              value={activeQCode}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                automaticLayout: true,
                padding: { top: 12 }
              }}
            />
          </div>

          {/* Exam terminal logs */}
          <div className="console-panel" style={{ height: '140px', flexGrow: 0, marginTop: '16px' }}>
            <div className="console-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} />
                Sandbox Console Output
              </span>
            </div>
            
            <div className="console-body" style={{ fontSize: '12px' }}>
              {(!consoleLogs[activeQ?.id] || consoleLogs[activeQ?.id].length === 0) && (
                <span className="console-system">&gt; Terminal ready. Click "Test Console Input" above to run the C# Main entry against standard sample inputs.</span>
              )}
              {consoleLogs[activeQ?.id]?.map((log, index) => {
                let logClass = "console-line";
                if (log.startsWith("[System]")) logClass = "console-system";
                else if (log.startsWith("[Error]")) logClass = "console-error";
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
