import { ProjectFile } from '../types';

/**
 * Interface for language-specific analyzers
 */
export interface LanguageAnalyzer {
  /**
   * The language this analyzer is for
   */
  language: string;
  
  /**
   * Detects if the project uses this language
   * @param files Array of project files
   * @returns True if the language is detected, false otherwise
   */
  detect(files: ProjectFile[]): boolean;
  
  /**
   * Gets the confidence level for the language detection (0-100)
   * @param files Array of project files
   * @returns Confidence level (0-100)
   */
  getConfidence(files: ProjectFile[]): number;
  
  /**
   * Gets the frameworks used in the project for this language
   * @param files Array of project files
   * @returns Array of detected frameworks
   */
  getFrameworks(files: ProjectFile[]): string[];
  
  /**
   * Gets the test frameworks used in the project for this language
   * @param files Array of project files
   * @returns Array of detected test frameworks
   */
  getTestFrameworks(files: ProjectFile[]): string[];
  
  /**
   * Gets the build tools used in the project for this language
   * @param files Array of project files
   * @returns Array of detected build tools
   */
  getBuildTools(files: ProjectFile[]): string[];
  
  /**
   * Gets additional language-specific information
   * @param files Array of project files
   * @returns Object containing language-specific information
   */
  getAdditionalInfo(files: ProjectFile[]): Record<string, any>;
}

/**
 * Base class for language-specific analyzers
 */
export abstract class BaseLanguageAnalyzer implements LanguageAnalyzer {
  /**
   * The language this analyzer is for
   */
  abstract language: string;
  
  /**
   * File extensions associated with this language
   */
  protected abstract fileExtensions: string[];
  
  /**
   * Files that indicate this language is used
   */
  protected abstract indicatorFiles: string[];
  
  /**
   * Detects if the project uses this language
   * @param files Array of project files
   * @returns True if the language is detected, false otherwise
   */
  detect(files: ProjectFile[]): boolean {
    return this.getConfidence(files) > 0;
  }
  
  /**
   * Gets the confidence level for the language detection (0-100)
   * @param files Array of project files
   * @returns Confidence level (0-100)
   */
  getConfidence(files: ProjectFile[]): number {
    let confidence = 0;
    
    // Check file extensions
    for (const file of files) {
      if (this.fileExtensions.includes(file.extension.toLowerCase())) {
        confidence += 10;
      }
    }
    
    // Check for indicator files
    for (const file of files) {
      const fileName = file.path.split('/').pop() || '';
      if (this.indicatorFiles.includes(fileName.toLowerCase())) {
        confidence += 30;
      }
    }
    
    // Cap confidence at 100
    return Math.min(confidence, 100);
  }
  
  /**
   * Gets the frameworks used in the project for this language
   * @param files Array of project files
   * @returns Array of detected frameworks
   */
  abstract getFrameworks(files: ProjectFile[]): string[];
  
  /**
   * Gets the test frameworks used in the project for this language
   * @param files Array of project files
   * @returns Array of detected test frameworks
   */
  abstract getTestFrameworks(files: ProjectFile[]): string[];
  
  /**
   * Gets the build tools used in the project for this language
   * @param files Array of project files
   * @returns Array of detected build tools
   */
  abstract getBuildTools(files: ProjectFile[]): string[];
  
  /**
   * Gets additional language-specific information
   * @param files Array of project files
   * @returns Object containing language-specific information
   */
  getAdditionalInfo(files: ProjectFile[]): Record<string, any> {
    return {};
  }
  
  /**
   * Helper method to check if a file contains a specific string
   * @param file File to check
   * @param searchString String to search for
   * @returns True if the file contains the string, false otherwise
   */
  protected fileContains(file: ProjectFile, searchString: string): boolean {
    return file.content !== undefined && file.content.includes(searchString);
  }
  
  /**
   * Helper method to check if any file in the project contains a specific string
   * @param files Array of project files
   * @param searchString String to search for
   * @returns True if any file contains the string, false otherwise
   */
  protected anyFileContains(files: ProjectFile[], searchString: string): boolean {
    return files.some(file => this.fileContains(file, searchString));
  }
  
  /**
   * Helper method to find files with a specific extension
   * @param files Array of project files
   * @param extension File extension to look for
   * @returns Array of files with the specified extension
   */
  protected findFilesByExtension(files: ProjectFile[], extension: string): ProjectFile[] {
    return files.filter(file => file.extension.toLowerCase() === extension.toLowerCase());
  }
  
  /**
   * Helper method to find files with a specific name
   * @param files Array of project files
   * @param fileName File name to look for
   * @returns Array of files with the specified name
   */
  protected findFilesByName(files: ProjectFile[], fileName: string): ProjectFile[] {
    return files.filter(file => {
      const name = file.path.split('/').pop() || '';
      return name.toLowerCase() === fileName.toLowerCase();
    });
  }
}
