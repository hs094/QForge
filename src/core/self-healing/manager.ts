import { 
  SelfHealingOptions, 
  DEFAULT_SELF_HEALING_OPTIONS, 
  DetectedFailure, 
  FixSuggestion,
  FailureType,
  FailureSeverity
} from './types';
import { FailureAnalyzer } from './analyzer';
import { CIPlatform } from '../../types';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Manages self-healing capabilities for CI/CD pipelines
 */
export class SelfHealingManager {
  private options: SelfHealingOptions;
  private analyzer: FailureAnalyzer;
  private logDir: string;
  
  /**
   * Creates a new SelfHealingManager
   * @param options Self-healing options
   */
  constructor(options: Partial<SelfHealingOptions> = {}) {
    this.options = { ...DEFAULT_SELF_HEALING_OPTIONS, ...options };
    this.analyzer = new FailureAnalyzer(this.options);
    this.logDir = path.join(os.homedir(), '.qforge', 'logs', 'self-healing');
  }
  
  /**
   * Analyzes a failure log and suggests fixes
   * @param log Failure log to analyze
   * @returns Object containing detected failures and fix suggestions
   */
  async analyzeFailure(log: string): Promise<{
    failures: DetectedFailure[];
    suggestions: FixSuggestion[];
  }> {
    // Analyze the failure
    const failures = this.analyzer.analyzeFailure(log);
    
    // Suggest fixes
    const suggestions = this.analyzer.suggestFixes(failures);
    
    // Save analysis for future reference
    await this.saveAnalysis(log, failures, suggestions);
    
    return { failures, suggestions };
  }
  
  /**
   * Attempts to automatically fix a failure
   * @param suggestion Fix suggestion to apply
   * @param workingDir Directory to execute fix in
   * @returns Result of the fix attempt
   */
  async attemptFix(suggestion: FixSuggestion, workingDir: string): Promise<{
    success: boolean;
    message: string;
    output?: string;
    error?: string;
  }> {
    // Check if auto-fix is possible
    if (!suggestion.autoFixPossible) {
      return {
        success: false,
        message: 'No automatic fix available for this failure'
      };
    }
    
    // Get the first fix with a script
    const fix = suggestion.fixes.find(f => !!f.fixScript);
    if (!fix || !fix.fixScript) {
      return {
        success: false,
        message: 'No fix script available'
      };
    }
    
    try {
      // Create a temporary script file
      const scriptFile = path.join(os.tmpdir(), `qforge-fix-${Date.now()}.sh`);
      await fs.writeFile(scriptFile, fix.fixScript);
      await fs.chmod(scriptFile, '755'); // Make executable
      
      // Execute the fix script
      const { stdout, stderr } = await execAsync(`bash "${scriptFile}"`, { cwd: workingDir });
      
      // Remove the temporary script
      await fs.remove(scriptFile);
      
      // Log the fix attempt
      await this.logFixAttempt(suggestion, true, stdout, stderr);
      
      return {
        success: true,
        message: `Successfully applied fix: ${fix.description}`,
        output: stdout,
        error: stderr
      };
    } catch (error) {
      // Log the failed fix attempt
      await this.logFixAttempt(suggestion, false, '', error instanceof Error ? error.message : String(error));
      
      return {
        success: false,
        message: `Failed to apply fix: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
  
  /**
   * Generates a self-healing report for a pipeline
   * @param platform CI/CD platform
   * @param pipelineContent Pipeline configuration content
   * @returns Self-healing report
   */
  generateSelfHealingReport(platform: CIPlatform, pipelineContent: string): {
    vulnerabilities: {
      type: string;
      description: string;
      severity: string;
      recommendation: string;
    }[];
    recommendations: string[];
    selfHealingScore: number;
  } {
    const vulnerabilities = [];
    const recommendations = [];
    let selfHealingScore = 100;
    
    // Check for common vulnerabilities based on platform
    switch (platform) {
      case 'github':
        // Check for retry mechanisms
        if (!pipelineContent.includes('continue-on-error') && !pipelineContent.includes('retry')) {
          vulnerabilities.push({
            type: 'Missing Retry Mechanism',
            description: 'No retry mechanism found for potentially flaky steps',
            severity: 'Medium',
            recommendation: 'Add continue-on-error: true for non-critical steps or implement retry logic'
          });
          selfHealingScore -= 15;
          recommendations.push('Add retry mechanisms for potentially flaky steps');
        }
        
        // Check for caching
        if (!pipelineContent.includes('actions/cache')) {
          vulnerabilities.push({
            type: 'Missing Caching',
            description: 'No caching mechanism found for dependencies or build artifacts',
            severity: 'Low',
            recommendation: 'Use actions/cache to cache dependencies and build artifacts'
          });
          selfHealingScore -= 10;
          recommendations.push('Implement caching for dependencies and build artifacts');
        }
        break;
        
      case 'gitlab':
        // Check for retry mechanisms
        if (!pipelineContent.includes('retry:')) {
          vulnerabilities.push({
            type: 'Missing Retry Mechanism',
            description: 'No retry mechanism found for potentially flaky jobs',
            severity: 'Medium',
            recommendation: 'Add retry configuration for jobs that might be flaky'
          });
          selfHealingScore -= 15;
          recommendations.push('Add retry configuration for potentially flaky jobs');
        }
        
        // Check for caching
        if (!pipelineContent.includes('cache:')) {
          vulnerabilities.push({
            type: 'Missing Caching',
            description: 'No caching mechanism found for dependencies or build artifacts',
            severity: 'Low',
            recommendation: 'Use GitLab CI caching to cache dependencies and build artifacts'
          });
          selfHealingScore -= 10;
          recommendations.push('Implement caching for dependencies and build artifacts');
        }
        break;
        
      case 'circleci':
        // Check for retry mechanisms
        if (!pipelineContent.includes('when: on_fail') && !pipelineContent.includes('no_output_timeout:')) {
          vulnerabilities.push({
            type: 'Missing Retry Mechanism',
            description: 'No retry mechanism or failure handling found',
            severity: 'Medium',
            recommendation: 'Add when: on_fail conditions or implement retry logic'
          });
          selfHealingScore -= 15;
          recommendations.push('Add failure handling mechanisms');
        }
        
        // Check for caching
        if (!pipelineContent.includes('save_cache') && !pipelineContent.includes('restore_cache')) {
          vulnerabilities.push({
            type: 'Missing Caching',
            description: 'No caching mechanism found for dependencies or build artifacts',
            severity: 'Low',
            recommendation: 'Use CircleCI caching to cache dependencies and build artifacts'
          });
          selfHealingScore -= 10;
          recommendations.push('Implement caching for dependencies and build artifacts');
        }
        break;
        
      case 'aws':
        // Check for retry mechanisms
        if (!pipelineContent.includes('RetryCount') && !pipelineContent.includes('RetryMode')) {
          vulnerabilities.push({
            type: 'Missing Retry Mechanism',
            description: 'No retry mechanism found for potentially flaky steps',
            severity: 'Medium',
            recommendation: 'Add retry configuration for CodeBuild projects or Lambda functions'
          });
          selfHealingScore -= 15;
          recommendations.push('Add retry configuration for potentially flaky steps');
        }
        break;
    }
    
    // Common checks for all platforms
    // Check for timeout configuration
    if (!pipelineContent.includes('timeout') && 
        !pipelineContent.includes('Timeout') && 
        !pipelineContent.includes('time-out') && 
        !pipelineContent.includes('TimeoutInMinutes')) {
      vulnerabilities.push({
        type: 'Missing Timeout Configuration',
        description: 'No timeout configuration found for jobs or steps',
        severity: 'Low',
        recommendation: 'Add appropriate timeout configuration to prevent hanging jobs'
      });
      selfHealingScore -= 5;
      recommendations.push('Add timeout configuration for jobs and steps');
    }
    
    // Ensure score is within 0-100 range
    selfHealingScore = Math.max(0, Math.min(100, selfHealingScore));
    
    return {
      vulnerabilities,
      recommendations,
      selfHealingScore
    };
  }
  
  /**
   * Saves analysis results for future reference
   * @param log Failure log
   * @param failures Detected failures
   * @param suggestions Fix suggestions
   */
  private async saveAnalysis(
    log: string, 
    failures: DetectedFailure[], 
    suggestions: FixSuggestion[]
  ): Promise<void> {
    try {
      // Ensure log directory exists
      await fs.ensureDir(this.logDir);
      
      // Create a timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `analysis-${timestamp}.json`;
      const filePath = path.join(this.logDir, filename);
      
      // Save analysis data
      await fs.writeJson(filePath, {
        timestamp: new Date().toISOString(),
        platform: this.options.platform,
        failures,
        suggestions,
        logExcerpt: log.length > 1000 ? log.substring(0, 1000) + '...' : log
      }, { spaces: 2 });
    } catch (error) {
      console.error(`Failed to save analysis: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Logs a fix attempt
   * @param suggestion Fix suggestion
   * @param success Whether the fix was successful
   * @param output Command output
   * @param error Command error
   */
  private async logFixAttempt(
    suggestion: FixSuggestion,
    success: boolean,
    output: string,
    error: string
  ): Promise<void> {
    try {
      // Ensure log directory exists
      await fs.ensureDir(this.logDir);
      
      // Create a timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `fix-attempt-${timestamp}.json`;
      const filePath = path.join(this.logDir, filename);
      
      // Save fix attempt data
      await fs.writeJson(filePath, {
        timestamp: new Date().toISOString(),
        platform: this.options.platform,
        failure: suggestion.failure,
        fixes: suggestion.fixes,
        success,
        output,
        error
      }, { spaces: 2 });
    } catch (error) {
      console.error(`Failed to log fix attempt: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
