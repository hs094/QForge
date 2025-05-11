import { CIPlatform } from '../../types';

/**
 * Types of pipeline failures
 */
export enum FailureType {
  TEST = 'test',
  BUILD = 'build',
  DEPENDENCY = 'dependency',
  RESOURCE = 'resource',
  NETWORK = 'network',
  PERMISSION = 'permission',
  CONFIGURATION = 'configuration',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Severity levels for failures
 */
export enum FailureSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Represents a pattern for detecting a specific type of failure
 */
export interface FailurePattern {
  type: FailureType;
  severity: FailureSeverity;
  patterns: RegExp[];
  description: string;
}

/**
 * Represents a detected failure in a pipeline
 */
export interface DetectedFailure {
  type: FailureType;
  severity: FailureSeverity;
  message: string;
  matchedPattern: string;
  description: string;
  location?: string;
}

/**
 * Represents a fix for a specific failure type
 */
export interface FailureFix {
  type: FailureType;
  description: string;
  fixScript?: string;
  manualSteps?: string[];
  platformSpecific?: boolean;
  platforms?: CIPlatform[];
}

/**
 * Represents a fix suggestion for a detected failure
 */
export interface FixSuggestion {
  failure: DetectedFailure;
  fixes: FailureFix[];
  autoFixPossible: boolean;
  confidence: number; // 0-100
}

/**
 * Options for self-healing configuration
 */
export interface SelfHealingOptions {
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number; // in seconds
  autoFix: boolean;
  notifyOnFailure: boolean;
  collectLogs: boolean;
  platform: CIPlatform;
}

/**
 * Default self-healing options
 */
export const DEFAULT_SELF_HEALING_OPTIONS: SelfHealingOptions = {
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 60,
  autoFix: false,
  notifyOnFailure: true,
  collectLogs: true,
  platform: 'github'
};
