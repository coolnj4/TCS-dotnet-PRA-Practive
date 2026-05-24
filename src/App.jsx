import React, { useState } from 'react';
import { LayoutGrid, Award, BookOpen, Layers, Terminal, Compass } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CodeWorkspace from './components/CodeWorkspace';
import MockTest from './components/MockTest';
import CheatSheet from './components/CheatSheet';
import questionsData from './data/questions.json';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, workspace, mock-test
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q);
    setCurrentView('workspace');
  };

  const handleOpenCheatSheet = () => {
    setIsCheatSheetOpen(true);
  };

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Terminal size={22} color="var(--primary)" />
          <span>TCS C# Pro</span>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('dashboard');
              setSelectedQuestion(null);
            }}
          >
            <LayoutGrid size={18} />
            <span>Dashboard</span>
          </li>

          <li 
            className={`sidebar-item ${currentView === 'mock-test' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('mock-test');
              setSelectedQuestion(null);
            }}
          >
            <Award size={18} />
            <span>Mock Assessment</span>
          </li>

          <li 
            className="sidebar-item"
            onClick={handleOpenCheatSheet}
            style={{ marginTop: 'auto', borderTop: '1px solid var(--border-glass)', paddingTop: '16px', borderRadius: 0 }}
          >
            <BookOpen size={18} />
            <span>Quick Cheat Sheet</span>
          </li>
        </ul>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Compass size={12} />
            <span>TCS MBU Prep Hub</span>
          </div>
          <div style={{ fontSize: '10px', marginTop: '4px' }}>v1.0.0 • Offline Sandbox</div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        
        {currentView === 'dashboard' && (
          <Dashboard 
            questions={questionsData} 
            onSelectQuestion={handleSelectQuestion}
            onOpenCheatSheet={handleOpenCheatSheet}
          />
        )}

        {currentView === 'workspace' && selectedQuestion && (
          <CodeWorkspace 
            question={selectedQuestion} 
            onBack={() => {
              setCurrentView('dashboard');
              setSelectedQuestion(null);
            }}
          />
        )}

        {currentView === 'mock-test' && (
          <MockTest 
            questions={questionsData}
            onBack={() => {
              setCurrentView('dashboard');
            }}
          />
        )}

      </main>

      {/* Floating Cheat Sheet Drawer */}
      <CheatSheet 
        isOpen={isCheatSheetOpen} 
        onClose={() => setIsCheatSheetOpen(false)} 
      />

    </div>
  );
}
