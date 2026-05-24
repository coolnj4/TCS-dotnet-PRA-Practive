import React, { useState, useEffect } from 'react';
import { Search, Trophy, BookOpen, Clock, ChevronRight, Award, Zap, Code } from 'lucide-react';

export default function Dashboard({ questions, onSelectQuestion, onOpenCheatSheet }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState({ completed: 0, progress: 0, total: 14 });
  const [dailyChallenge, setDailyChallenge] = useState(null);

  // Compute local storage practice stats
  useEffect(() => {
    let completed = 0;
    let progress = 0;
    
    questions.forEach(q => {
      const status = localStorage.getItem(`tcs_progress_${q.id}`);
      if (status === 'completed') completed++;
      else if (status === 'progress') progress++;
    });

    setStats({ completed, progress, total: questions.length });

    // Pick a daily challenge: find first uncompleted question, or pick a random one
    const uncompleted = questions.filter(q => localStorage.getItem(`tcs_progress_${q.id}`) !== 'completed');
    if (uncompleted.length > 0) {
      setDailyChallenge(uncompleted[0]);
    } else {
      setDailyChallenge(questions[0]);
    }
  }, [questions]);

  // Filters mapping logic
  const filteredQuestions = questions.filter(q => {
    const status = localStorage.getItem(`tcs_progress_${q.id}`) || 'none';
    
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || 
                          q.category.toLowerCase().includes(search.toLowerCase());
                          
    const matchesCategory = categoryFilter === 'All' || q.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Completed' && status === 'completed') ||
                          (statusFilter === 'In Progress' && status === 'progress') ||
                          (statusFilter === 'Unstarted' && status === 'none');

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  const categories = ['All', ...new Set(questions.map(q => q.category))];

  return (
    <div className="animate-fade">
      {/* Top Welcome Panel */}
      <div className="header">
        <div className="header-title">
          <h1>TCS MBU C# Assessment Hub</h1>
          <p>Practice standard Microsoft Business Unit Xplore assessments interactively inside your browser.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={onOpenCheatSheet}>
            <BookOpen size={16} /> C# Syntax Cheat Sheet
          </button>
        </div>
      </div>

      {/* Analytics Dashboard Cards */}
      <div className="analytics-grid">
        <div className="analytic-card glass-panel">
          <div className="analytic-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Trophy size={22} />
          </div>
          <div className="analytic-info">
            <h3>Overall Progress</h3>
            <div className="value">{stats.completed} / {stats.total} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>({Math.round((stats.completed/stats.total)*100)}%)</span></div>
          </div>
        </div>

        <div className="analytic-card glass-panel">
          <div className="analytic-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--secondary)' }}>
            <Clock size={22} />
          </div>
          <div className="analytic-info">
            <h3>In Progress</h3>
            <div className="value">{stats.progress} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Attempted</span></div>
          </div>
        </div>

        <div className="analytic-card glass-panel">
          <div className="analytic-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent)' }}>
            <Award size={22} />
          </div>
          <div className="analytic-info">
            <h3>Mock Status</h3>
            <div className="value">
              {stats.completed >= 5 ? "Ready" : "Practice More"}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: 400 }}>Solve 5+ questions for full mock readiness</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenge Promo */}
      {dailyChallenge && (
        <div className="glass-panel" style={{ 
          padding: '24px', 
          marginBottom: '32px', 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)', 
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={16} color="var(--warning)" fill="var(--warning)" />
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--warning)' }}>RECOMMENDED CHALLENGE</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{dailyChallenge.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
              Strengthen your skills in <strong style={{ color: 'var(--primary)' }}>{dailyChallenge.category}</strong>. Solve this C# problem to boost your readiness.
            </p>
          </div>
          <button className="btn-primary" onClick={() => onSelectQuestion(dailyChallenge)}>
            Start Practicing <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Grid Controls Section */}
      <div className="section-header">
        <h2>Assessments Directory</h2>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing {filteredQuestions.length} of {questions.length} Questions
        </div>
      </div>

      <div className="controls-row">
        {/* Search */}
        <div className="search-box">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search questions or categories..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select 
          className="filter-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.filter(c => c !== 'All').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select 
          className="filter-select"
          value={difficultyFilter}
          onChange={e => setDifficultyFilter(e.target.value)}
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Practice Status Filter */}
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Unstarted">Unstarted</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Grid List */}
      <div className="questions-grid">
        {filteredQuestions.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '48px', 
            color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.01)',
            border: '1px dashed var(--border-glass)',
            borderRadius: '16px'
          }}>
            <Code size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>No questions match your current filters. Try resetting search fields.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const status = localStorage.getItem(`tcs_progress_${q.id}`) || 'none';
            
            return (
              <div 
                key={q.id} 
                className="question-card glass-panel"
                onClick={() => onSelectQuestion(q)}
              >
                <div className="card-top">
                  <div className="card-category">{q.category}</div>
                  <h3 className="card-title">{q.title}</h3>
                </div>

                <div>
                  <div className="card-middle">
                    <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                      {q.difficulty}
                    </span>
                    {status === 'completed' && (
                      <span className="badge badge-status-completed">Completed</span>
                    )}
                    {status === 'progress' && (
                      <span className="badge badge-status-progress">In Progress</span>
                    )}
                    {status === 'none' && (
                      <span className="badge badge-status-none">Unstarted</span>
                    )}
                  </div>

                  <div className="card-bottom">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      C# Console Program
                    </span>
                    <button className="practice-btn">
                      Practice <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
