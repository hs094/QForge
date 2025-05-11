import path from 'path';
import { ProjectFile } from '../../types';

/**
 * Detects frameworks used in the project
 * @param files Array of project files
 * @returns Array of detected frameworks
 */
export function detectFrameworks(files: ProjectFile[]): string[] {
  const frameworks: Set<string> = new Set();
  
  // Check for framework-specific files
  const frameworkIndicators: Record<string, string[]> = {
    // JavaScript/TypeScript frameworks
    'react': ['react', 'jsx', 'tsx', 'react-dom'],
    'vue': ['vue', 'nuxt'],
    'angular': ['angular', '@angular'],
    'next.js': ['next', 'next.config.js'],
    'gatsby': ['gatsby'],
    'express': ['express'],
    'nest.js': ['@nestjs'],
    'electron': ['electron'],
    
    // Python frameworks
    'django': ['django', 'settings.py', 'wsgi.py', 'asgi.py'],
    'flask': ['flask', 'Flask'],
    'fastapi': ['fastapi', 'FastAPI'],
    'pyramid': ['pyramid'],
    
    // Java frameworks
    'spring': ['spring', 'springframework', 'SpringApplication'],
    'hibernate': ['hibernate', 'HibernateUtil'],
    'quarkus': ['quarkus'],
    'micronaut': ['micronaut'],
    
    // Other frameworks
    'rails': ['rails', 'config/routes.rb'],
    'laravel': ['laravel', 'artisan'],
    'asp.net': ['asp.net', 'Microsoft.AspNetCore'],
    'flutter': ['flutter', 'pubspec.yaml'],
  };
  
  // Check package.json for JavaScript/TypeScript frameworks
  const packageJsonFile = files.find(file => path.basename(file.path) === 'package.json');
  if (packageJsonFile && packageJsonFile.content) {
    try {
      const packageJson = JSON.parse(packageJsonFile.content);
      const allDependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
      };
      
      // Check dependencies for framework indicators
      for (const [framework, indicators] of Object.entries(frameworkIndicators)) {
        for (const indicator of indicators) {
          if (Object.keys(allDependencies).some(dep => dep === indicator || dep.includes(indicator))) {
            frameworks.add(framework);
          }
        }
      }
    } catch (error) {
      // Ignore JSON parsing errors
    }
  }
  
  // Check for framework-specific files and content patterns
  for (const file of files) {
    const fileName = path.basename(file.path);
    const filePath = file.relativePath;
    
    // Check file names and paths
    for (const [framework, indicators] of Object.entries(frameworkIndicators)) {
      for (const indicator of indicators) {
        if (
          fileName === indicator || 
          filePath.includes(`/${indicator}/`) || 
          filePath.includes(`\\${indicator}\\`)
        ) {
          frameworks.add(framework);
        }
      }
    }
    
    // Check file content for framework indicators
    if (file.content) {
      for (const [framework, indicators] of Object.entries(frameworkIndicators)) {
        for (const indicator of indicators) {
          if (file.content.includes(indicator)) {
            frameworks.add(framework);
          }
        }
      }
    }
  }
  
  return Array.from(frameworks);
}
