import path from 'path';
import { ProjectFile } from '../../types';

/**
 * Detects test frameworks used in the project
 * @param files Array of project files
 * @returns Array of detected test frameworks
 */
export function detectTestFrameworks(files: ProjectFile[]): string[] {
  const testFrameworks: Set<string> = new Set();
  
  // Test framework indicators
  const testFrameworkIndicators: Record<string, string[]> = {
    // JavaScript/TypeScript test frameworks
    'jest': ['jest', 'jest.config.js', 'jest.config.ts'],
    'mocha': ['mocha', 'mocha.opts'],
    'jasmine': ['jasmine', 'jasmine.json'],
    'cypress': ['cypress', 'cypress.json', 'cypress.config.js'],
    'playwright': ['playwright', 'playwright.config.js'],
    'vitest': ['vitest', 'vitest.config.js', 'vitest.config.ts'],
    
    // Python test frameworks
    'pytest': ['pytest', 'conftest.py'],
    'unittest': ['unittest'],
    'nose': ['nose', 'nosetests'],
    
    // Java test frameworks
    'junit': ['junit', 'JUnit', '@Test'],
    'testng': ['testng', 'TestNG'],
    'mockito': ['mockito', 'Mockito'],
    
    // Other test frameworks
    'rspec': ['rspec', 'spec_helper.rb'],
    'phpunit': ['phpunit', 'phpunit.xml'],
    'xunit': ['xunit', 'xunit.runner'],
    'nunit': ['nunit', 'NUnit'],
  };
  
  // Check package.json for JavaScript/TypeScript test frameworks
  const packageJsonFile = files.find(file => path.basename(file.path) === 'package.json');
  if (packageJsonFile && packageJsonFile.content) {
    try {
      const packageJson = JSON.parse(packageJsonFile.content);
      const allDependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
      };
      
      // Check dependencies for test framework indicators
      for (const [framework, indicators] of Object.entries(testFrameworkIndicators)) {
        for (const indicator of indicators) {
          if (Object.keys(allDependencies).some(dep => dep === indicator || dep.includes(indicator))) {
            testFrameworks.add(framework);
          }
        }
      }
    } catch (error) {
      // Ignore JSON parsing errors
    }
  }
  
  // Check for test directories
  const testDirs = ['test', 'tests', 'spec', 'specs', '__tests__', '__test__'];
  for (const file of files) {
    const dirParts = file.relativePath.split(path.sep);
    for (const testDir of testDirs) {
      if (dirParts.includes(testDir)) {
        // Found a test directory, now check file content for framework indicators
        if (file.content) {
          for (const [framework, indicators] of Object.entries(testFrameworkIndicators)) {
            for (const indicator of indicators) {
              if (file.content.includes(indicator)) {
                testFrameworks.add(framework);
              }
            }
          }
        }
      }
    }
  }
  
  // Check for framework-specific files and content patterns
  for (const file of files) {
    const fileName = path.basename(file.path);
    
    // Check file names
    for (const [framework, indicators] of Object.entries(testFrameworkIndicators)) {
      for (const indicator of indicators) {
        if (fileName === indicator) {
          testFrameworks.add(framework);
        }
      }
    }
    
    // Check file content for framework indicators
    if (file.content) {
      for (const [framework, indicators] of Object.entries(testFrameworkIndicators)) {
        for (const indicator of indicators) {
          if (file.content.includes(indicator)) {
            testFrameworks.add(framework);
          }
        }
      }
    }
  }
  
  return Array.from(testFrameworks);
}
