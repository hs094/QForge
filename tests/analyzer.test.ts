import { describe, expect, test } from '@jest/globals';
import { detectLanguages } from '../src/core/analyzer/language-detector';
import { detectFrameworks } from '../src/core/analyzer/framework-detector';
import { detectTestFrameworks } from '../src/core/analyzer/test-detector';
import { detectBuildTools } from '../src/core/analyzer/build-detector';
import { ProjectFile } from '../src/types';

describe('Language Detector', () => {
  test('should detect JavaScript from js files', () => {
    const files: ProjectFile[] = [
      { path: '/project/src/index.js', relativePath: 'src/index.js', extension: 'js' },
      { path: '/project/src/app.js', relativePath: 'src/app.js', extension: 'js' }
    ];
    
    const languages = detectLanguages(files);
    expect(languages).toContain('JavaScript');
  });
  
  test('should detect TypeScript from ts files', () => {
    const files: ProjectFile[] = [
      { path: '/project/src/index.ts', relativePath: 'src/index.ts', extension: 'ts' },
      { path: '/project/src/app.ts', relativePath: 'src/app.ts', extension: 'ts' }
    ];
    
    const languages = detectLanguages(files);
    expect(languages).toContain('TypeScript');
  });
  
  test('should detect Python from py files', () => {
    const files: ProjectFile[] = [
      { path: '/project/src/main.py', relativePath: 'src/main.py', extension: 'py' },
      { path: '/project/src/app.py', relativePath: 'src/app.py', extension: 'py' }
    ];
    
    const languages = detectLanguages(files);
    expect(languages).toContain('Python');
  });
});

describe('Framework Detector', () => {
  test('should detect React from package.json', () => {
    const files: ProjectFile[] = [
      {
        path: '/project/package.json',
        relativePath: 'package.json',
        extension: 'json',
        content: JSON.stringify({
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0'
          }
        })
      }
    ];
    
    const frameworks = detectFrameworks(files);
    expect(frameworks).toContain('react');
  });
  
  test('should detect Express from package.json', () => {
    const files: ProjectFile[] = [
      {
        path: '/project/package.json',
        relativePath: 'package.json',
        extension: 'json',
        content: JSON.stringify({
          dependencies: {
            'express': '^4.18.2'
          }
        })
      }
    ];
    
    const frameworks = detectFrameworks(files);
    expect(frameworks).toContain('express');
  });
  
  test('should detect Django from Python files', () => {
    const files: ProjectFile[] = [
      {
        path: '/project/settings.py',
        relativePath: 'settings.py',
        extension: 'py',
        content: 'from django.conf import settings'
      }
    ];
    
    const frameworks = detectFrameworks(files);
    expect(frameworks).toContain('django');
  });
});

describe('Test Framework Detector', () => {
  test('should detect Jest from package.json', () => {
    const files: ProjectFile[] = [
      {
        path: '/project/package.json',
        relativePath: 'package.json',
        extension: 'json',
        content: JSON.stringify({
          devDependencies: {
            'jest': '^29.5.0'
          }
        })
      }
    ];
    
    const testFrameworks = detectTestFrameworks(files);
    expect(testFrameworks).toContain('jest');
  });
  
  test('should detect Pytest from Python files', () => {
    const files: ProjectFile[] = [
      {
        path: '/project/conftest.py',
        relativePath: 'conftest.py',
        extension: 'py',
        content: 'import pytest'
      }
    ];
    
    const testFrameworks = detectTestFrameworks(files);
    expect(testFrameworks).toContain('pytest');
  });
});

describe('Build Tool Detector', () => {
  test('should detect Webpack from package.json', () => {
    const files: ProjectFile[] = [
      {
        path: '/project/package.json',
        relativePath: 'package.json',
        extension: 'json',
        content: JSON.stringify({
          devDependencies: {
            'webpack': '^5.80.0'
          }
        })
      }
    ];
    
    const buildTools = detectBuildTools(files);
    expect(buildTools).toContain('webpack');
  });
  
  test('should detect Maven from pom.xml', () => {
    const files: ProjectFile[] = [
      {
        path: '/project/pom.xml',
        relativePath: 'pom.xml',
        extension: 'xml',
        content: '<project xmlns="http://maven.apache.org/POM/4.0.0">'
      }
    ];
    
    const buildTools = detectBuildTools(files);
    expect(buildTools).toContain('maven');
  });
});
