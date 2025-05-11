import fs from 'fs-extra';
import path from 'path';
import os from 'os';

/**
 * Logger utility for debugging and tracking
 */
export class Logger {
  private static debugMode = false;
  private static logDir = path.join(os.homedir(), '.qforge', 'logs');
  
  /**
   * Enables or disables debug mode
   * @param enabled Whether debug mode should be enabled
   */
  static setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
  
  /**
   * Sets the log directory
   * @param dir Directory to store logs
   */
  static setLogDirectory(dir: string): void {
    this.logDir = dir;
  }
  
  /**
   * Logs a message to the console if debug mode is enabled
   * @param message Message to log
   * @param data Optional data to log
   */
  static debug(message: string, data?: any): void {
    if (this.debugMode) {
      console.log(`[DEBUG] ${message}`);
      if (data !== undefined) {
        console.log(data);
      }
    }
  }
  
  /**
   * Logs a message to the console
   * @param message Message to log
   * @param data Optional data to log
   */
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`);
    if (data !== undefined) {
      console.log(data);
    }
  }
  
  /**
   * Logs a warning message to the console
   * @param message Warning message to log
   * @param data Optional data to log
   */
  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`);
    if (data !== undefined) {
      console.warn(data);
    }
  }
  
  /**
   * Logs an error message to the console
   * @param message Error message to log
   * @param error Optional error object to log
   */
  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`);
    if (error !== undefined) {
      console.error(error);
    }
  }
  
  /**
   * Saves a prompt to a log file for debugging
   * @param prompt Prompt to save
   * @param type Type of prompt (e.g., 'github', 'aws')
   * @returns Path to the saved prompt file
   */
  static async savePrompt(prompt: string, type: string): Promise<string> {
    try {
      // Create log directory if it doesn't exist
      await fs.ensureDir(this.logDir);
      
      // Generate a timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `prompt-${type}-${timestamp}.md`;
      const filePath = path.join(this.logDir, filename);
      
      // Write prompt to file
      await fs.writeFile(filePath, prompt);
      
      this.debug(`Saved prompt to ${filePath}`);
      
      return filePath;
    } catch (error) {
      this.error(`Failed to save prompt: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }
  
  /**
   * Saves a response to a log file for debugging
   * @param response Response to save
   * @param type Type of response (e.g., 'github', 'aws')
   * @returns Path to the saved response file
   */
  static async saveResponse(response: string, type: string): Promise<string> {
    try {
      // Create log directory if it doesn't exist
      await fs.ensureDir(this.logDir);
      
      // Generate a timestamp for the filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `response-${type}-${timestamp}.md`;
      const filePath = path.join(this.logDir, filename);
      
      // Write response to file
      await fs.writeFile(filePath, response);
      
      this.debug(`Saved response to ${filePath}`);
      
      return filePath;
    } catch (error) {
      this.error(`Failed to save response: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }
}
