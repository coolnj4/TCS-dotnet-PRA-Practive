import React from 'react';
import { X, Copy, Check } from 'lucide-react';

export default function CheatSheet({ isOpen, onClose }) {
  const [copiedId, setCopiedId] = React.useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sections = [
    {
      title: "Reading Inputs (Console)",
      desc: "TCS assessments read inputs line-by-line using Console.ReadLine().",
      code: `// Read String
string name = Console.ReadLine();

// Read Integer
int age = Convert.ToInt32(Console.ReadLine());

// Read Double / Float
double budget = Convert.ToDouble(Console.ReadLine());`
    },
    {
      title: "Creating Object Arrays",
      desc: "Storing multiple objects and looping to read inputs.",
      code: `// Instantiate array of size 5
Associate[] a = new Associate[5];

// Read inputs in a loop
for (int i = 0; i < a.Length; i++) {
    int id = Convert.ToInt32(Console.ReadLine());
    string name = Console.ReadLine();
    string tech = Console.ReadLine();
    int exp = Convert.ToInt32(Console.ReadLine());
    
    a[i] = new Associate(id, name, tech, exp);
}`
    },
    {
      title: "Case Insensitive String Matching",
      desc: "Filtering arrays based on a target string (case-insensitive).",
      code: `// Case insensitive equality
if (a[i].technology.Equals(searchTech, StringComparison.OrdinalIgnoreCase)) {
    // Logic here
}

// Or simple Equals (case-insensitive is standard in our compiler)
if (a[i].technology.Equals(searchTech)) {
    // Logic here
}`
    },
    {
      title: "C# Class Definition",
      desc: "Standard structure for object classes used in assessments.",
      code: `class Associate {
    // Fields
    public int id;
    public string name;
    public string technology;
    public int experienceInYears;

    // Constructor
    public Associate(int id, string name, string technology, int experienceInYears) {
        this.id = id;
        this.name = name;
        this.technology = technology;
        this.experienceInYears = experienceInYears;
    }
}`
    },
    {
      title: "LINQ Filtering & Arrays",
      desc: "Returning lists or filtering arrays dynamically in C#.",
      code: `// Method that returns filtered array
public static Associate[] associatesForGivenTechnology(Associate[] a, string searchTech) {
    // Find length of matching items
    int count = 0;
    for (int i = 0; i < a.Length; i++) {
        if (a[i].technology.Equals(searchTech) && a[i].experienceInYears % 5 == 0) {
            count++;
        }
    }
    
    // Create new array of size 'count' or original size with nulls
    Associate[] res = new Associate[count];
    int idx = 0;
    for (int i = 0; i < a.Length; i++) {
        if (a[i].technology.Equals(searchTech) && a[i].experienceInYears % 5 == 0) {
            res[idx++] = a[i];
        }
    }
    return res;
}`
    }
  ];

  return (
    <div className="cheatsheet-drawer glass-panel animate-fade">
      <div className="drawer-header">
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>C# Practice Cheat Sheet</h2>
        <button className="tab-btn" onClick={onClose} style={{ padding: '6px' }}>
          <X size={20} />
        </button>
      </div>
      
      <div className="drawer-body">
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          Use these common code blocks to tackle standard TCS assessments. Click copy to copy code snippets.
        </p>

        {sections.map((sec, idx) => (
          <div key={idx} className="cheatsheet-section">
            <h3>{sec.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {sec.desc}
            </p>
            <div style={{ position: 'relative' }}>
              <pre className="code-block">{sec.code}</pre>
              <button 
                onClick={() => copyToClipboard(sec.code, idx)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 6px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                {copiedId === idx ? <Check size={14} className="console-success" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
