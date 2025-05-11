/**
 * Represents the profile of a project after analysis
 */
export interface ProjectProfile {
  languages: string[];
  frameworks: string[];
  testFrameworks: string[];
  buildTools: string[];
  hasDockerfile: boolean;
  hasCI: boolean;
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  languageSpecificInfo?: Record<string, any>;
}

/**
 * Supported CI/CD platforms
 */
export type CIPlatform = 'github' | 'aws' | 'gitlab' | 'circleci';

/**
 * Options for pipeline generation
 */
export interface GeneratorOptions {
  platform: CIPlatform;
  testCoverage: boolean;
  linting: boolean;
  security: boolean;
  selfHealing: boolean;
}

/**
 * Represents a generated pipeline configuration
 */
export interface PipelineConfig {
  platform: CIPlatform;
  content: string;
  filePath: string;
}

/**
 * Represents a file in the project
 */
export interface ProjectFile {
  path: string;
  relativePath: string;
  content?: string;
  extension: string;
}

/**
 * Represents a failure in the pipeline
 */
export interface PipelineFailure {
  type: string;
  message: string;
  log: string;
}

/**
 * Represents a fix suggestion for a pipeline failure
 */
export interface FixSuggestion {
  failure: PipelineFailure;
  suggestion: string;
  autoFix?: string;
}

/**
 * Amazon Q CLI response
 */
export interface AmazonQResponse {
  content: string;
  success: boolean;
  error?: string;
}
