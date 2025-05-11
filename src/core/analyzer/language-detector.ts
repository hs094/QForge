import path from 'path';
import { ProjectFile } from '../../types';

/**
 * Detects programming languages used in the project
 * @param files Array of project files
 * @returns Array of detected languages
 */
export function detectLanguages(files: ProjectFile[]): string[] {
  const languageMap: Record<string, number> = {};
  
  // Map file extensions to languages
  const extensionToLanguage: Record<string, string> = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'rb': 'Ruby',
    'go': 'Go',
    'rs': 'Rust',
    'php': 'PHP',
    'cs': 'C#',
    'cpp': 'C++',
    'c': 'C',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'scala': 'Scala',
    'sh': 'Shell',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less'
  };
  
  // Count files by language
  for (const file of files) {
    const extension = file.extension.toLowerCase();
    const language = extensionToLanguage[extension];
    
    if (language) {
      languageMap[language] = (languageMap[language] || 0) + 1;
    }
  }
  
  // Check for specific files that indicate a language
  const fileIndicators: Record<string, string> = {
    'package.json': 'JavaScript',
    'tsconfig.json': 'TypeScript',
    'requirements.txt': 'Python',
    'setup.py': 'Python',
    'Pipfile': 'Python',
    'pom.xml': 'Java',
    'build.gradle': 'Java',
    'Gemfile': 'Ruby',
    'go.mod': 'Go',
    'Cargo.toml': 'Rust',
    'composer.json': 'PHP',
    '.csproj': 'C#',
    'CMakeLists.txt': 'C++',
    'Makefile': 'C',
    'Package.swift': 'Swift',
    'build.gradle.kts': 'Kotlin'
  };
  
  for (const file of files) {
    const fileName = path.basename(file.path);
    const fileExtension = path.extname(file.path);
    
    for (const [indicator, language] of Object.entries(fileIndicators)) {
      if (fileName === indicator || fileExtension === indicator) {
        languageMap[language] = (languageMap[language] || 0) + 5; // Give more weight to these indicators
      }
    }
  }
  
  // Sort languages by frequency and return
  return Object.entries(languageMap)
    .sort((a, b) => b[1] - a[1])
    .map(([language]) => language);
}
