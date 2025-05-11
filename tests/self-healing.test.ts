import { 
  FailureAnalyzer, 
  SelfHealingManager,
  FailureType,
  FailureSeverity
} from '../src/core/self-healing';

describe('Self-Healing Module', () => {
  describe('FailureAnalyzer', () => {
    let analyzer: FailureAnalyzer;
    
    beforeEach(() => {
      analyzer = new FailureAnalyzer({ platform: 'github' });
    });
    
    test('should detect test failures', () => {
      const log = `
        Running tests...
        FAIL src/components/Button.test.js
          Button component
            ✓ renders correctly (23ms)
            ✕ handles click events (45ms)
            
        ● Button component › handles click events
        
        expect(jest.fn()).toHaveBeenCalledTimes(1)
        
        Expected number of calls: 1
        Received number of calls: 0
      `;
      
      const failures = analyzer.analyzeFailure(log);
      
      expect(failures.length).toBeGreaterThan(0);
      expect(failures[0].type).toBe(FailureType.TEST);
      expect(failures[0].severity).toBe(FailureSeverity.MEDIUM);
    });
    
    test('should detect dependency issues', () => {
      const log = `
        npm ERR! code ERESOLVE
        npm ERR! ERESOLVE could not resolve dependency tree
        npm ERR! 
        npm ERR! While resolving: my-app@1.0.0
        npm ERR! Found: react@17.0.2
        npm ERR! node_modules/react
        npm ERR!   react@"^17.0.0" from the root project
        npm ERR! 
        npm ERR! Could not resolve dependency:
        npm ERR! peer react@"^18.0.0" from react-dom@18.0.0
        npm ERR! node_modules/react-dom
        npm ERR!   react-dom@"^18.0.0" from the root project
      `;
      
      const failures = analyzer.analyzeFailure(log);
      
      expect(failures.length).toBeGreaterThan(0);
      expect(failures[0].type).toBe(FailureType.DEPENDENCY);
      expect(failures[0].severity).toBe(FailureSeverity.HIGH);
    });
    
    test('should detect resource constraints', () => {
      const log = `
        <--- Last few GCs --->
        
        [46501:0x5612a3c9c000]   138169 ms: Mark-sweep 1386.5 (1439.8) -> 1386.2 (1439.8) MB, 999.8 / 0.0 ms  (average mu = 0.176, current mu = 0.138) allocation failure scavenge might not succeed
        [46501:0x5612a3c9c000]   139169 ms: Mark-sweep 1386.9 (1439.8) -> 1386.6 (1439.8) MB, 999.6 / 0.0 ms  (average mu = 0.139, current mu = 0.138) allocation failure scavenge might not succeed
        
        <--- JS stacktrace --->
        
        FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
      `;
      
      const failures = analyzer.analyzeFailure(log);
      
      expect(failures.length).toBeGreaterThan(0);
      expect(failures[0].type).toBe(FailureType.RESOURCE);
      expect(failures[0].severity).toBe(FailureSeverity.HIGH);
    });
    
    test('should suggest fixes for detected failures', () => {
      const log = `
        Running tests...
        FAIL src/components/Button.test.js
          Button component
            ✓ renders correctly (23ms)
            ✕ handles click events (45ms)
            
        ● Button component › handles click events
        
        expect(jest.fn()).toHaveBeenCalledTimes(1)
        
        Expected number of calls: 1
        Received number of calls: 0
      `;
      
      const failures = analyzer.analyzeFailure(log);
      const suggestions = analyzer.suggestFixes(failures);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].failure.type).toBe(FailureType.TEST);
      expect(suggestions[0].fixes.length).toBeGreaterThan(0);
      expect(suggestions[0].confidence).toBeGreaterThan(0);
    });
  });
  
  describe('SelfHealingManager', () => {
    let manager: SelfHealingManager;
    
    beforeEach(() => {
      manager = new SelfHealingManager({ platform: 'github' });
    });
    
    test('should generate a self-healing report', () => {
      const pipelineContent = `
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Test
        run: npm test
      `;
      
      const report = manager.generateSelfHealingReport('github', pipelineContent);
      
      expect(report).toBeDefined();
      expect(report.vulnerabilities.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.selfHealingScore).toBeLessThanOrEqual(100);
      expect(report.selfHealingScore).toBeGreaterThanOrEqual(0);
    });
  });
});
