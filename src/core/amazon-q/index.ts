import { exec } from 'child_process';
import { promisify } from 'util';
import { AmazonQResponse, ProjectProfile } from '../../types';
import { Prompts } from '../prompts';
import { Logger } from '../utils/logger';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Wrapper for Amazon Q CLI
 */
export class AmazonQClient {
  /**
   * Checks if Amazon Q CLI is installed
   * @returns Promise resolving to true if installed, false otherwise
   */
  async isInstalled(): Promise<boolean> {
    try {
      await execAsync('q --version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Executes a command with Amazon Q CLI
   * @param prompt The prompt to send to Amazon Q
   * @returns Promise resolving to the response from Amazon Q
   */
  async executeCommand(prompt: string): Promise<AmazonQResponse> {
    try {
      // Check if Amazon Q CLI is installed
      const isInstalled = await this.isInstalled();
      if (!isInstalled) {
        return {
          content: '',
          success: false,
          error: 'Amazon Q CLI is not installed. Please install it using "pip install amazon-q-cli".'
        };
      }

      // Create a temporary file for the prompt
      const tempDir = os.tmpdir();
      const promptFile = path.join(tempDir, `qforge-prompt-${Date.now()}.txt`);
      const outputFile = path.join(tempDir, `qforge-output-${Date.now()}.txt`);

      // Write prompt to file
      await fs.writeFile(promptFile, prompt);

      // Execute Amazon Q CLI command
      const { stdout, stderr } = await execAsync(
        `q chat --no-interactive < "${promptFile}" > "${outputFile}"`
      );

      // Read output file
      const output = await fs.readFile(outputFile, 'utf-8');

      // Clean up temporary files
      await fs.remove(promptFile);
      await fs.remove(outputFile);

      return {
        content: output,
        success: true
      };
    } catch (error) {
      return {
        content: '',
        success: false,
        error: `Failed to execute Amazon Q command: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Generates a CI/CD pipeline configuration using Amazon Q
   * @param projectProfile Project profile from analyzer
   * @param platform Target CI/CD platform (github or aws)
   * @param options Additional options for pipeline generation
   * @returns Promise resolving to the generated pipeline configuration
   */
  async generatePipeline(
    projectProfile: ProjectProfile,
    platform: 'github' | 'aws',
    options: {
      testCoverage: boolean;
      linting: boolean;
      security: boolean;
      selfHealing: boolean;
    }
  ): Promise<AmazonQResponse> {
    // Construct a detailed prompt for Amazon Q using the Prompts class
    const prompt = Prompts.generatePipelinePrompt(projectProfile, platform, options);

    // Log the prompt for debugging
    Logger.debug('Generating pipeline with prompt:');
    Logger.debug('='.repeat(80));
    Logger.debug(prompt);
    Logger.debug('='.repeat(80));

    // Save prompt to log file
    await Logger.savePrompt(prompt, platform);

    // Execute the command
    const response = await this.executeCommand(prompt);

    // Save response to log file if successful
    if (response.success && response.content) {
      await Logger.saveResponse(response.content, platform);
    }

    return response;
  }
}
