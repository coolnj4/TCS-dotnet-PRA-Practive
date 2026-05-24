# TCS MBU C# Assessment Training Hub 🚀

A state-of-the-art, interactive, and visually stunning web application designed to help you practice and master C# programming questions asked in the **TCS Xplore Microsoft Business Unit (MBU)** assessments. 

Practice writing C# code, execute it instantly in a custom in-browser console sandbox, run test suites, and take timed mock assessments—all without needing a local compiler!

---

## 🌟 Key Features

1. **⚡ Browser-Based C# Console Sandbox**
   - A custom JS-based transpiler executes standard C# console code directly in the browser.
   - Built-in compatibility extensions for C# operations like `String.Equals(..., StringComparison)`, `String.Contains()`, and C# object array instantiations.

2. **💻 High-Fidelity IDE Workspace**
   - Full code editing with **Monaco Editor** (the engine behind VS Code) with C# syntax highlighting, themes, and automatic formatting.
   - Side-by-side tabs containing the **Problem Statement**, **Visual Input Simulator**, and **Test Case Suite**.
   - Compare your code against the **Official Reference C# Solution** in a dedicated, read-only panel.

3. **📊 Dynamic Visual Input Simulator**
   - Dynamic form builder tailored to each of the 14 assessment challenges. 
   - Fill in simple textboxes and sliders instead of typing raw, error-prone multi-line input strings. The simulator automatically feeds them into your console program!

4. **✅ Automated Test Case Suite**
   - Click "Run Test Suite" to execute your program against pre-loaded evaluation test cases.
   - Displays clear green/red status bars and detailed expected vs. actual output diff cards.

5. **🏆 Timed Mock Assessment Center**
   - Simulates realistic assessment conditions with a 60-minute countdown timer.
   - Picks 2 random, unsolved challenges and tracks your progress in an isolated workspace session.
   - Final report displays your accuracy rating and designated certification badges.

6. **📁 14 Core Assessment Problems Included**
   - *Associate for Given Technology*
   - *AutonomousCar*
   - *Device Management*
   - *Institution*
   - *Inventory Replenish*
   - *Medicine Get Price by Disease*
   - *Movie Find Average Budget by Director*
   - *Movie Get Movie by Genre*
   - *NavalVessel*
   - *Player Get Average of Runs*
   - *Player Get Player Based on Level*
   - *Sim Match and Sort*
   - *Sim Transfer Circle*
   - *Travel Agencies*

---

## 🛠️ Technology Stack

- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS (Premium Dark Mode, Glassmorphism, Fluent Micro-Animations)
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Icons**: Lucide React
- **Hosting**: Highly optimized for zero-dependency Vercel static deployments.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/coolnj4/TCS-dotnet-PRA-Practive.git
   cd TCS-dotnet-PRA-Practive
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Launch the development server:**
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your web browser to start practicing!

---

## ☁️ Deploying to Vercel

The application is fully optimized for continuous deployment on **Vercel** with one click:

1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. Click **Add New** -> **Project**.
3. Import the `TCS-dotnet-PRA-Practive` repository.
4. Vercel will automatically detect Vite and set the correct build configuration (`npm run build` and output directory `dist`).
5. Click **Deploy**! 

Every time you push new changes to your `main` branch, Vercel will rebuild and deploy your site automatically.
