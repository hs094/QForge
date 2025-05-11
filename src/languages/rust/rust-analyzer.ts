import { ProjectFile } from '../../types';
import { BaseLanguageAnalyzer } from '../language-analyzer';

/**
 * Rust language analyzer
 */
export class RustAnalyzer extends BaseLanguageAnalyzer {
  language = 'Rust';
  protected fileExtensions = ['rs'];
  protected indicatorFiles = ['Cargo.toml', 'Cargo.lock', 'rust-toolchain', 'rust-toolchain.toml'];
  
  /**
   * Gets the confidence level for Rust detection (0-100)
   * @param files Array of project files
   * @returns Confidence level (0-100)
   */
  getConfidence(files: ProjectFile[]): number {
    let confidence = super.getConfidence(files);
    
    // Check for Cargo.toml
    if (this.findFilesByName(files, 'Cargo.toml').length > 0) {
      confidence += 40;
    }
    
    // Check for Rust source files with typical patterns
    const rustFiles = this.findFilesByExtension(files, 'rs');
    if (rustFiles.length > 0) {
      // Check for common Rust patterns
      const hasRustPatterns = rustFiles.some(file => 
        file.content && (
          file.content.includes('fn main()') ||
          file.content.includes('use std::') ||
          file.content.includes('impl ') ||
          file.content.includes('pub struct') ||
          file.content.includes('pub enum')
        )
      );
      
      if (hasRustPatterns) {
        confidence += 20;
      }
    }
    
    return Math.min(confidence, 100);
  }
  
  /**
   * Gets the frameworks used in the Rust project
   * @param files Array of project files
   * @returns Array of detected frameworks
   */
  getFrameworks(files: ProjectFile[]): string[] {
    const frameworks: Set<string> = new Set();
    const cargoToml = this.findFilesByName(files, 'Cargo.toml')[0];
    
    if (cargoToml && cargoToml.content) {
      // Check for web frameworks
      if (cargoToml.content.includes('rocket =') || this.anyFileContains(files, 'rocket::')) {
        frameworks.add('rocket');
      }
      
      if (cargoToml.content.includes('actix-web =') || this.anyFileContains(files, 'actix_web::')) {
        frameworks.add('actix-web');
      }
      
      if (cargoToml.content.includes('warp =') || this.anyFileContains(files, 'warp::')) {
        frameworks.add('warp');
      }
      
      if (cargoToml.content.includes('axum =') || this.anyFileContains(files, 'axum::')) {
        frameworks.add('axum');
      }
      
      // Check for GUI frameworks
      if (cargoToml.content.includes('iced =') || this.anyFileContains(files, 'iced::')) {
        frameworks.add('iced');
      }
      
      if (cargoToml.content.includes('egui =') || this.anyFileContains(files, 'egui::')) {
        frameworks.add('egui');
      }
      
      // Check for async runtimes
      if (cargoToml.content.includes('tokio =') || this.anyFileContains(files, 'tokio::')) {
        frameworks.add('tokio');
      }
      
      if (cargoToml.content.includes('async-std =') || this.anyFileContains(files, 'async_std::')) {
        frameworks.add('async-std');
      }
      
      // Check for ORM
      if (cargoToml.content.includes('diesel =') || this.anyFileContains(files, 'diesel::')) {
        frameworks.add('diesel');
      }
      
      if (cargoToml.content.includes('sea-orm =') || this.anyFileContains(files, 'sea_orm::')) {
        frameworks.add('sea-orm');
      }
    }
    
    return Array.from(frameworks);
  }
  
  /**
   * Gets the test frameworks used in the Rust project
   * @param files Array of project files
   * @returns Array of detected test frameworks
   */
  getTestFrameworks(files: ProjectFile[]): string[] {
    const testFrameworks: Set<string> = new Set();
    
    // Check for standard Rust testing
    if (files.some(file => 
      file.content && (
        file.content.includes('#[test]') || 
        file.content.includes('mod tests {')
      )
    )) {
      testFrameworks.add('rust-test');
    }
    
    const cargoToml = this.findFilesByName(files, 'Cargo.toml')[0];
    
    if (cargoToml && cargoToml.content) {
      // Check for testing libraries
      if (cargoToml.content.includes('mockall =') || this.anyFileContains(files, 'mockall::')) {
        testFrameworks.add('mockall');
      }
      
      if (cargoToml.content.includes('proptest =') || this.anyFileContains(files, 'proptest::')) {
        testFrameworks.add('proptest');
      }
      
      if (cargoToml.content.includes('criterion =') || this.anyFileContains(files, 'criterion::')) {
        testFrameworks.add('criterion');
      }
      
      if (cargoToml.content.includes('quickcheck =') || this.anyFileContains(files, 'quickcheck::')) {
        testFrameworks.add('quickcheck');
      }
    }
    
    return Array.from(testFrameworks);
  }
  
  /**
   * Gets the build tools used in the Rust project
   * @param files Array of project files
   * @returns Array of detected build tools
   */
  getBuildTools(files: ProjectFile[]): string[] {
    const buildTools: Set<string> = new Set();
    
    // Check for Cargo
    if (this.findFilesByName(files, 'Cargo.toml').length > 0) {
      buildTools.add('cargo');
    }
    
    // Check for Make
    if (this.findFilesByName(files, 'Makefile').length > 0) {
      buildTools.add('make');
    }
    
    // Check for Just
    if (this.findFilesByName(files, 'justfile').length > 0) {
      buildTools.add('just');
    }
    
    // Check for build.rs (custom build script)
    if (this.findFilesByName(files, 'build.rs').length > 0) {
      buildTools.add('build-script');
    }
    
    return Array.from(buildTools);
  }
  
  /**
   * Gets additional Rust-specific information
   * @param files Array of project files
   * @returns Object containing Rust-specific information
   */
  getAdditionalInfo(files: ProjectFile[]): Record<string, any> {
    const info: Record<string, any> = {};
    
    // Get Rust edition and package info
    const cargoToml = this.findFilesByName(files, 'Cargo.toml')[0];
    if (cargoToml && cargoToml.content) {
      // Extract package name
      const packageNameMatch = cargoToml.content.match(/name\s*=\s*"([^"]+)"/);
      if (packageNameMatch && packageNameMatch[1]) {
        info.packageName = packageNameMatch[1];
      }
      
      // Extract Rust edition
      const editionMatch = cargoToml.content.match(/edition\s*=\s*"([^"]+)"/);
      if (editionMatch && editionMatch[1]) {
        info.rustEdition = editionMatch[1];
      }
      
      // Check if it's a binary or library
      info.isBinary = cargoToml.content.includes('[[bin]]') || 
                      !cargoToml.content.includes('[lib]');
      
      // Check for WASM target
      info.isWasm = cargoToml.content.includes('wasm-bindgen') || 
                    cargoToml.content.includes('target = "wasm32');
    }
    
    // Check for Rust toolchain version
    const toolchainFile = this.findFilesByName(files, 'rust-toolchain')[0] || 
                          this.findFilesByName(files, 'rust-toolchain.toml')[0];
    
    if (toolchainFile && toolchainFile.content) {
      const channelMatch = toolchainFile.content.match(/channel\s*=\s*"([^"]+)"/);
      if (channelMatch && channelMatch[1]) {
        info.rustChannel = channelMatch[1];
      } else if (toolchainFile.content.trim().match(/^[a-z0-9.-]+$/)) {
        info.rustChannel = toolchainFile.content.trim();
      }
    }
    
    return info;
  }
}
