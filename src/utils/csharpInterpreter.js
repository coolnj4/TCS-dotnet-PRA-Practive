/**
 * TCS C# Practice Web Platform - Client-side C# Interpreter & Sandboxed Runner
 * Parses standard C# console code used in TCS Xplore assessments and compiles it into sandboxed JavaScript for instant browser execution.
 */

export function runCSharp(csharpCode, rawInputString) {
  const consoleBuffer = [];
  const debugLogs = [];
  
  // Split raw inputs by newline and trim them
  const inputs = rawInputString
    .split(/\r?\n/)
    .map(line => line.trim());
    
  let inputIndex = 0;

  // Sandbox helper functions injected into execution context
  const readLine = () => {
    if (inputIndex < inputs.length) {
      const val = inputs[inputIndex++];
      debugLogs.push(`Console.ReadLine() -> "${val}"`);
      return val;
    }
    debugLogs.push(`Console.ReadLine() -> [EOF]`);
    return "";
  };

  const writeLine = (msg) => {
    const formatted = msg === null || msg === undefined ? "" : msg.toString();
    consoleBuffer.push(formatted);
  };

  const write = (msg) => {
    const formatted = msg === null || msg === undefined ? "" : msg.toString();
    if (consoleBuffer.length > 0) {
      consoleBuffer[consoleBuffer.length - 1] += formatted;
    } else {
      consoleBuffer.push(formatted);
    }
  };

  try {
    // 1. Preprocess: clean carriage returns, remove comments, strip namespace
    let jsCode = csharpCode
      .replace(/\r/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
      .replace(/\/\/.*/g, ''); // remove single-line comments

    // Save helper classes / methods
    // C# String methods compatibility in JS
    const stringHelpers = `
      if (!String.prototype.Equals) {
        String.prototype.Equals = function(other, comparisonType) {
          if (other === null || other === undefined) return false;
          // Case-insensitive by default in these TCS questions
          return this.toLowerCase() === other.toLowerCase();
        };
      }
      if (!String.prototype.Contains) {
        String.prototype.Contains = function(other) {
          if (other === null || other === undefined) return false;
          return this.toLowerCase().includes(other.toLowerCase());
        };
      }
      if (!String.prototype.ToUpper) {
        String.prototype.ToUpper = function() {
          return this.toUpperCase();
        };
      }
      if (!String.prototype.ToLower) {
        String.prototype.ToLower = function() {
          return this.toLowerCase();
        };
      }
    `;

    // 2. Transpile C# constructs to JavaScript
    // Remove namespaces, usings and assembly tags
    jsCode = jsCode.replace(/using\s+System\s*([\s\S]*?);/gi, '');
    jsCode = jsCode.replace(/namespace\s+[A-Za-z0-9_.]+\s*\{/gi, '');
    
    // Remove class Program/Solution wrapping (we want to compile classes and methods flat)
    jsCode = jsCode.replace(/class\s+(Program|Solution)\s*\{/gi, '');

    // Class declarations: e.g. class Associate { ... }
    // We keep custom classes, but adapt constructors and field declarations
    
    // Convert constructors: public Associate(int id, string name, ...) -> constructor(id, name, ...)
    jsCode = jsCode.replace(/public\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g, (match, className, args) => {
      // Clean C# typed args to plain JS args (e.g. "int id, string name" -> "id, name")
      const jsArgs = args
        .split(',')
        .map(arg => {
          const parts = arg.trim().split(/\s+/);
          return parts.length > 1 ? parts[parts.length - 1] : arg.trim();
        })
        .filter(arg => arg)
        .join(', ');
      return `constructor(${jsArgs}) {`;
    });

    // Remove field declaration types in classes (e.g. "public int id;" -> "")
    // But keep standard variable definitions inside methods. Inside methods we will handle types.
    jsCode = jsCode.replace(/public\s+(int|string|double|float|bool|char)\s+([A-Za-z0-9_]+)\s*;/g, '');
    jsCode = jsCode.replace(/private\s+(int|string|double|float|bool|char)\s+([A-Za-z0-9_]+)\s*;/g, '');

    // Replace C# standard inputs
    // Convert: Convert.ToInt32(Console.ReadLine()) -> parseInt(readLine())
    jsCode = jsCode.replace(/Convert\.ToInt32\s*\(\s*Console\.ReadLine\(\s*\)\s*\)/gi, 'parseInt(readLine())');
    // Convert: Convert.ToDouble(Console.ReadLine()) -> parseFloat(readLine())
    jsCode = jsCode.replace(/Convert\.ToDouble\s*\(\s*Console\.ReadLine\(\s*\)\s*\)/gi, 'parseFloat(readLine())');
    // Convert: Convert.ToInt32(x) -> parseInt(x)
    jsCode = jsCode.replace(/Convert\.ToInt32\s*\(([^)]+)\)/gi, 'parseInt($1)');
    // Convert: Convert.ToDouble(x) -> parseFloat(x)
    jsCode = jsCode.replace(/Convert\.ToDouble\s*\(([^)]+)\)/gi, 'parseFloat($1)');
    // Convert: Console.ReadLine() -> readLine()
    jsCode = jsCode.replace(/Console\.ReadLine\(\)/gi, 'readLine()');

    // Replace C# standard outputs
    // Convert: Console.WriteLine(x) -> writeLine(x)
    jsCode = jsCode.replace(/Console\.WriteLine\s*\((.*?)\)/gi, 'writeLine($1)');
    // Convert: Console.WriteLine() -> writeLine("")
    jsCode = jsCode.replace(/Console\.WriteLine\s*\(\)/gi, 'writeLine("")');
    // Convert: Console.Write(x) -> write(x)
    jsCode = jsCode.replace(/Console\.Write\s*\((.*?)\)/gi, 'write($1)');

    // Transpiling Array declarations:
    // e.g. "Associate[] a = new Associate[5];" -> "let a = new Array(5).fill(null);"
    jsCode = jsCode.replace(/[A-Za-z0-9_]+\[\]\s+([A-Za-z0-9_]+)\s*=\s*new\s+[A-Za-z0-9_]+\[\s*([^\]]+)\s*\]\s*;/g, 'let $1 = new Array($2).fill(null);');
    // e.g. "int[] arr = new int[5];" -> "let arr = new Array(5).fill(0);"
    jsCode = jsCode.replace(/(int|double|string)\[\]\s+([A-Za-z0-9_]+)\s*=\s*new\s+(int|double|string)\[\s*([^\]]+)\s*\]\s*;/g, 'let $2 = new Array($4).fill(null);');

    // Standard Variable Declarations with type:
    // e.g. "int id = x;" -> "let id = x;"
    // e.g. "string name = y;" -> "let name = y;"
    // We need to be careful not to replace types inside words, so we use word boundaries.
    jsCode = jsCode.replace(/\b(int|string|double|float|bool|char|var)\s+([A-Za-z0-9_]+)\b/g, 'let $2');
    
    // Replace C# array properties
    // e.g. ".Length" -> ".length"
    jsCode = jsCode.replace(/\.Length\b/g, '.length');

    // Handle C# methods inside Program/Solution class
    // Convert: public static void Main(string[] args) -> function Main(args)
    jsCode = jsCode.replace(/public\s+static\s+void\s+Main\s*\((.*?)\)/gi, 'function Main($1)');
    // Convert: public static Associate[] associatesForGivenTechnology(...) -> function associatesForGivenTechnology(...)
    // e.g. "public static [Type] [MethodName]([Args])" -> "function [MethodName]([cleanedArgs])"
    jsCode = jsCode.replace(/public\s+static\s+[A-Za-z0-9_\[\]]+\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/gi, (match, methodName, args) => {
      const jsArgs = args
        .split(',')
        .map(arg => {
          const parts = arg.trim().split(/\s+/);
          return parts.length > 1 ? parts[parts.length - 1] : arg.trim();
        })
        .filter(arg => arg)
        .join(', ');
      return `function ${methodName}(${jsArgs})`;
    });

    // Remove any trailing curly braces from namespaces or Program classes that were stripped
    // A robust way to execute is to wrap everything in a sandbox function.
    // Let's create the final executable script.
    const runScript = `
      ${stringHelpers}
      
      // USER CODE BEGINS
      ${jsCode}
      // USER CODE ENDS

      // Call Main method to boot execution if it exists
      if (typeof Main === 'function') {
        Main([]);
      } else {
        // Fallback: search for any static method and run it? Or print error.
        throw new Error("No Main method found. Ensure your program starts with public static void Main.");
      }
    `;

    debugLogs.push("Transpilation succeeded. Running code...");

    // 3. Execution in isolated scope
    const executionContext = new Function(
      'readLine', 
      'writeLine', 
      'write', 
      'parseInt', 
      'parseFloat', 
      runScript
    );

    executionContext(
      readLine, 
      writeLine, 
      write, 
      (v) => parseInt(v, 10), 
      (v) => parseFloat(v)
    );

    return {
      success: true,
      stdout: consoleBuffer.join('\n'),
      debugLogs,
      error: null
    };

  } catch (err) {
    debugLogs.push(`Execution failed: ${err.message}`);
    return {
      success: false,
      stdout: consoleBuffer.join('\n'),
      debugLogs,
      error: err.message
    };
  }
}
