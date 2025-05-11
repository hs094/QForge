import { 
  DetectedFailure, 
  FailurePattern, 
  FailureType, 
  FailureSeverity, 
  FixSuggestion, 
  FailureFix, 
  SelfHealingOptions, 
  DEFAULT_SELF_HEALING_OPTIONS 
} from './types';
import { FAILURE_PATTERNS, PLATFORM_FAILURE_PATTERNS } from './failure-patterns';
import { COMMON_FIXES, PLATFORM_FIXES } from './failure-fixes';
import { CIPlatform } from '../../types';

/**
 * Analyzes pipeline failures and suggests fixes
 */
export class FailureAnalyzer {
  private options: SelfHealingOptions;
  
  /**
   * Creates a new FailureAnalyzer
   * @param options Self-healing options
   */
  constructor(options: Partial<SelfHealingOptions> = {}) {
    this.options = { ...DEFAULT_SELF_HEALING_OPTIONS, ...options };
  }
  
  /**
   * Analyzes a failure log and detects failure types
   * @param log Failure log to analyze
   * @returns Array of detected failures
   */
  analyzeFailure(log: string): DetectedFailure[] {
    const detectedFailures: DetectedFailure[] = [];
    
    // Get all patterns to check
    const patterns = [
      ...FAILURE_PATTERNS,
      ...(PLATFORM_FAILURE_PATTERNS[this.options.platform] || [])
    ];
    
    // Check each pattern against the log
    for (const pattern of patterns) {
      for (const regex of pattern.patterns) {
        const matches = log.match(regex);
        if (matches) {
          detectedFailures.push({
            type: pattern.type,
            severity: pattern.severity,
            message: matches[0],
            matchedPattern: regex.toString(),
            description: pattern.description,
            location: this.extractLocation(log, matches[0])
          });
        }
      }
    }
    
    // If no specific failures were detected, add an unknown failure
    if (detectedFailures.length === 0) {
      detectedFailures.push({
        type: FailureType.UNKNOWN,
        severity: FailureSeverity.MEDIUM,
        message: 'Unknown failure',
        matchedPattern: '',
        description: 'Could not determine the specific cause of failure'
      });
    }
    
    // Sort failures by severity (highest first)
    return this.sortFailuresBySeverity(detectedFailures);
  }
  
  /**
   * Suggests fixes for detected failures
   * @param failures Array of detected failures
   * @returns Array of fix suggestions
   */
  suggestFixes(failures: DetectedFailure[]): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];
    
    for (const failure of failures) {
      // Get all applicable fixes
      const fixes = this.getFixesForFailure(failure);
      
      // Determine if auto-fix is possible
      const autoFixPossible = fixes.some(fix => !!fix.fixScript);
      
      // Calculate confidence based on severity and specificity
      const confidence = this.calculateConfidence(failure, fixes);
      
      suggestions.push({
        failure,
        fixes,
        autoFixPossible,
        confidence
      });
    }
    
    return suggestions;
  }
  
  /**
   * Gets fixes for a specific failure
   * @param failure Detected failure
   * @returns Array of applicable fixes
   */
  private getFixesForFailure(failure: DetectedFailure): FailureFix[] {
    // Get common fixes for this failure type
    const commonFixes = COMMON_FIXES.filter(fix => fix.type === failure.type);
    
    // Get platform-specific fixes for this failure type
    const platformFixes = PLATFORM_FIXES[this.options.platform]?.filter(fix => 
      fix.type === failure.type && 
      fix.platformSpecific && 
      fix.platforms?.includes(this.options.platform)
    ) || [];
    
    return [...commonFixes, ...platformFixes];
  }
  
  /**
   * Calculates confidence score for a fix suggestion
   * @param failure Detected failure
   * @param fixes Applicable fixes
   * @returns Confidence score (0-100)
   */
  private calculateConfidence(failure: DetectedFailure, fixes: FailureFix[]): number {
    let confidence = 0;
    
    // Base confidence on severity
    switch (failure.severity) {
      case FailureSeverity.CRITICAL:
        confidence = 90;
        break;
      case FailureSeverity.HIGH:
        confidence = 75;
        break;
      case FailureSeverity.MEDIUM:
        confidence = 60;
        break;
      case FailureSeverity.LOW:
        confidence = 40;
        break;
      default:
        confidence = 30;
    }
    
    // Adjust based on number of fixes
    if (fixes.length === 0) {
      confidence -= 20;
    } else if (fixes.length > 3) {
      confidence -= 10; // Too many fixes might indicate uncertainty
    }
    
    // Adjust based on failure type
    if (failure.type === FailureType.UNKNOWN) {
      confidence -= 30;
    }
    
    // Adjust based on platform-specific fixes
    if (fixes.some(fix => fix.platformSpecific)) {
      confidence += 10;
    }
    
    // Ensure confidence is within 0-100 range
    return Math.max(0, Math.min(100, confidence));
  }
  
  /**
   * Sorts failures by severity (highest first)
   * @param failures Array of detected failures
   * @returns Sorted array of failures
   */
  private sortFailuresBySeverity(failures: DetectedFailure[]): DetectedFailure[] {
    const severityOrder = {
      [FailureSeverity.CRITICAL]: 0,
      [FailureSeverity.HIGH]: 1,
      [FailureSeverity.MEDIUM]: 2,
      [FailureSeverity.LOW]: 3
    };
    
    return [...failures].sort((a, b) => 
      severityOrder[a.severity] - severityOrder[b.severity]
    );
  }
  
  /**
   * Extracts location information from a failure log
   * @param log Failure log
   * @param matchedText Matched text from the log
   * @returns Location information or undefined
   */
  private extractLocation(log: string, matchedText: string): string | undefined {
    // Try to find file and line information near the matched text
    const fileLineRegex = /([a-zA-Z0-9_\-/.]+):(\d+)(?::(\d+))?/;
    
    // Get the context around the matched text
    const matchIndex = log.indexOf(matchedText);
    const startIndex = Math.max(0, matchIndex - 200);
    const endIndex = Math.min(log.length, matchIndex + matchedText.length + 200);
    const context = log.substring(startIndex, endIndex);
    
    // Look for file:line pattern in the context
    const fileLineMatch = context.match(fileLineRegex);
    if (fileLineMatch) {
      return fileLineMatch[0];
    }
    
    return undefined;
  }
}
