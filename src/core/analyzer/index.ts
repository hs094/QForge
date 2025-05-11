import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import { ProjectProfile, ProjectFile } from '../../types';
import { detectLanguages } from './language-detector';
import { detectFrameworks } from './framework-detector';
import { detectTestFrameworks } from './test-detector';
import { detectBuildTools } from './build-detector';
import { parsePackageJson } from './node-analyzer';
import { getLanguageAnalyzers } from '../../languages';

/**
 * Analyzes a project directory and returns a project profile
 * @param projectPath Path to the project directory
 * @returns ProjectProfile containing analysis results
 */
export async function analyzeProject(projectPath: string): Promise<ProjectProfile> {
  try {
    // Scan all files in the project
    const files = await scanProjectFiles(projectPath);

    // Detect project characteristics using basic detectors
    let languages = detectLanguages(files);
    let frameworks = detectFrameworks(files);
    let testFrameworks = detectTestFrameworks(files);
    let buildTools = detectBuildTools(files);

    // Get language-specific analyzers
    const languageAnalyzers = getLanguageAnalyzers();

    // Additional language-specific information
    const languageSpecificInfo: Record<string, any> = {};

    // Run language-specific analyzers
    for (const analyzer of languageAnalyzers) {
      // Check if this language is detected
      const confidence = analyzer.getConfidence(files);

      if (confidence > 0) {
        // If not already detected, add the language
        if (!languages.includes(analyzer.language)) {
          languages.push(analyzer.language);
        }

        // Get language-specific frameworks
        const langFrameworks = analyzer.getFrameworks(files);
        frameworks = [...frameworks, ...langFrameworks.filter(f => !frameworks.includes(f))];

        // Get language-specific test frameworks
        const langTestFrameworks = analyzer.getTestFrameworks(files);
        testFrameworks = [...testFrameworks, ...langTestFrameworks.filter(f => !testFrameworks.includes(f))];

        // Get language-specific build tools
        const langBuildTools = analyzer.getBuildTools(files);
        buildTools = [...buildTools, ...langBuildTools.filter(t => !buildTools.includes(t))];

        // Get additional language-specific information
        const additionalInfo = analyzer.getAdditionalInfo(files);
        if (Object.keys(additionalInfo).length > 0) {
          languageSpecificInfo[analyzer.language.toLowerCase()] = additionalInfo;
        }
      }
    }

    // Sort languages by confidence (most confident first)
    languages = sortLanguagesByConfidence(languages, files, languageAnalyzers);

    // Check for Dockerfile
    const hasDockerfile = files.some(file =>
      path.basename(file.path).toLowerCase() === 'dockerfile');

    // Check for existing CI configuration
    const hasCI = files.some(file => {
      const relativePath = file.relativePath.toLowerCase();
      return (
        relativePath.includes('.github/workflows') ||
        relativePath.includes('.gitlab-ci.yml') ||
        relativePath.includes('azure-pipelines.yml') ||
        relativePath.includes('buildspec.yml') ||
        relativePath.includes('jenkins')
      );
    });

    // Parse package.json if it exists (for Node.js projects)
    let packageManager: string | undefined;
    let dependencies: Record<string, string> | undefined;
    let devDependencies: Record<string, string> | undefined;

    const packageJsonFile = files.find(file =>
      path.basename(file.path) === 'package.json');

    if (packageJsonFile && packageJsonFile.content) {
      const packageInfo = parsePackageJson(packageJsonFile.content);
      packageManager = packageInfo.packageManager;
      dependencies = packageInfo.dependencies;
      devDependencies = packageInfo.devDependencies;
    }

    return {
      languages,
      frameworks,
      testFrameworks,
      buildTools,
      hasDockerfile,
      hasCI,
      packageManager,
      dependencies,
      devDependencies,
      languageSpecificInfo
    };
  } catch (error) {
    throw new Error(`Failed to analyze project: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Sorts languages by confidence level (most confident first)
 * @param languages Array of detected languages
 * @param files Array of project files
 * @param analyzers Array of language analyzers
 * @returns Sorted array of languages
 */
function sortLanguagesByConfidence(
  languages: string[],
  files: ProjectFile[],
  analyzers: import('../../languages').LanguageAnalyzer[]
): string[] {
  // Create a map of language to confidence
  const confidenceMap = new Map<string, number>();

  // Get confidence for each language
  for (const language of languages) {
    // Find the analyzer for this language
    const analyzer = analyzers.find(a => a.language === language);

    if (analyzer) {
      // Use the analyzer's confidence
      confidenceMap.set(language, analyzer.getConfidence(files));
    } else {
      // Use a basic confidence based on file count
      const fileCount = files.filter(file => {
        const ext = file.extension.toLowerCase();
        switch (language.toLowerCase()) {
          case 'javascript':
            return ext === 'js' || ext === 'jsx';
          case 'typescript':
            return ext === 'ts' || ext === 'tsx';
          case 'python':
            return ext === 'py';
          case 'java':
            return ext === 'java';
          case 'ruby':
            return ext === 'rb';
          case 'go':
            return ext === 'go';
          case 'rust':
            return ext === 'rs';
          case 'php':
            return ext === 'php';
          case 'c#':
            return ext === 'cs';
          default:
            return false;
        }
      }).length;

      confidenceMap.set(language, fileCount * 10);
    }
  }

  // Sort languages by confidence (descending)
  return [...languages].sort((a, b) => {
    const confidenceA = confidenceMap.get(a) || 0;
    const confidenceB = confidenceMap.get(b) || 0;
    return confidenceB - confidenceA;
  });
}

/**
 * Scans all files in a project directory
 * @param projectPath Path to the project directory
 * @returns Array of ProjectFile objects
 */
async function scanProjectFiles(projectPath: string): Promise<ProjectFile[]> {
  try {
    // Find all files in the project, excluding node_modules, .git, etc.
    const filePaths = await glob('**/*', {
      cwd: projectPath,
      ignore: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**'
      ],
      dot: true,
      nodir: true
    });

    // Convert to ProjectFile objects
    const files: ProjectFile[] = filePaths.map(filePath => {
      const fullPath = path.join(projectPath, filePath);
      const extension = path.extname(filePath).slice(1);

      return {
        path: fullPath,
        relativePath: filePath,
        extension
      };
    });

    // Read content of important files for deeper analysis
    const importantExtensions = ['json', 'yml', 'yaml', 'xml', 'toml', 'js', 'ts', 'py', 'java'];
    const importantFileNames = ['Dockerfile', 'Makefile', '.gitignore', '.dockerignore'];

    for (const file of files) {
      if (
        importantExtensions.includes(file.extension) ||
        importantFileNames.includes(path.basename(file.path))
      ) {
        try {
          file.content = await fs.readFile(file.path, 'utf-8');
        } catch (error) {
          // Skip files that can't be read
          console.warn(`Warning: Could not read file ${file.path}`);
        }
      }
    }

    return files;
  } catch (error) {
    throw new Error(`Failed to scan project files: ${error instanceof Error ? error.message : String(error)}`);
  }
}
