import path from 'path';
import { ProjectFile } from '../../types';

/**
 * Detects build tools used in the project
 * @param files Array of project files
 * @returns Array of detected build tools
 */
export function detectBuildTools(files: ProjectFile[]): string[] {
  const buildTools: Set<string> = new Set();
  
  // Build tool indicators
  const buildToolIndicators: Record<string, string[]> = {
    // JavaScript/TypeScript build tools
    'webpack': ['webpack', 'webpack.config.js'],
    'rollup': ['rollup', 'rollup.config.js'],
    'parcel': ['parcel', 'parcel-bundler'],
    'vite': ['vite', 'vite.config.js', 'vite.config.ts'],
    'esbuild': ['esbuild'],
    'tsc': ['tsc', 'tsconfig.json'],
    
    // Python build tools
    'setuptools': ['setup.py', 'setuptools'],
    'poetry': ['poetry', 'pyproject.toml'],
    'pip': ['requirements.txt', 'pip'],
    
    // Java build tools
    'maven': ['pom.xml', 'mvn'],
    'gradle': ['build.gradle', 'gradle', 'gradlew'],
    'ant': ['build.xml', 'ant'],
    
    // Other build tools
    'make': ['Makefile', 'make'],
    'cmake': ['CMakeLists.txt', 'cmake'],
    'bazel': ['WORKSPACE', 'BUILD', 'bazel'],
    'docker': ['Dockerfile', 'docker-compose.yml'],
  };
  
  // Check package.json for JavaScript/TypeScript build tools
  const packageJsonFile = files.find(file => path.basename(file.path) === 'package.json');
  if (packageJsonFile && packageJsonFile.content) {
    try {
      const packageJson = JSON.parse(packageJsonFile.content);
      const allDependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
      };
      
      // Check dependencies for build tool indicators
      for (const [tool, indicators] of Object.entries(buildToolIndicators)) {
        for (const indicator of indicators) {
          if (Object.keys(allDependencies).some(dep => dep === indicator || dep.includes(indicator))) {
            buildTools.add(tool);
          }
        }
      }
      
      // Check scripts for build commands
      if (packageJson.scripts) {
        const scripts = packageJson.scripts;
        if (scripts.build) {
          if (scripts.build.includes('tsc')) buildTools.add('tsc');
          if (scripts.build.includes('webpack')) buildTools.add('webpack');
          if (scripts.build.includes('rollup')) buildTools.add('rollup');
          if (scripts.build.includes('parcel')) buildTools.add('parcel');
          if (scripts.build.includes('vite')) buildTools.add('vite');
          if (scripts.build.includes('esbuild')) buildTools.add('esbuild');
        }
      }
    } catch (error) {
      // Ignore JSON parsing errors
    }
  }
  
  // Check for build tool specific files
  for (const file of files) {
    const fileName = path.basename(file.path);
    
    // Check file names
    for (const [tool, indicators] of Object.entries(buildToolIndicators)) {
      for (const indicator of indicators) {
        if (fileName === indicator) {
          buildTools.add(tool);
        }
      }
    }
    
    // Check file content for build tool indicators
    if (file.content) {
      for (const [tool, indicators] of Object.entries(buildToolIndicators)) {
        for (const indicator of indicators) {
          if (file.content.includes(indicator)) {
            buildTools.add(tool);
          }
        }
      }
    }
  }
  
  return Array.from(buildTools);
}
