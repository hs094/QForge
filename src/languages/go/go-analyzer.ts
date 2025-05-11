import { ProjectFile } from '../../types';
import { BaseLanguageAnalyzer } from '../language-analyzer';
import path from 'path';

/**
 * Go language analyzer
 */
export class GoAnalyzer extends BaseLanguageAnalyzer {
  language = 'Go';
  protected fileExtensions = ['go'];
  protected indicatorFiles = ['go.mod', 'go.sum', 'Gopkg.toml', 'Gopkg.lock', 'glide.yaml', 'glide.lock'];
  
  /**
   * Gets the confidence level for Go detection (0-100)
   * @param files Array of project files
   * @returns Confidence level (0-100)
   */
  getConfidence(files: ProjectFile[]): number {
    let confidence = super.getConfidence(files);
    
    // Check for Go module files
    if (this.findFilesByName(files, 'go.mod').length > 0) {
      confidence += 40;
    }
    
    // Check for Go package structure
    if (this.hasGoPackageStructure(files)) {
      confidence += 20;
    }
    
    return Math.min(confidence, 100);
  }
  
  /**
   * Gets the frameworks used in the Go project
   * @param files Array of project files
   * @returns Array of detected frameworks
   */
  getFrameworks(files: ProjectFile[]): string[] {
    const frameworks: Set<string> = new Set();
    
    // Check for common Go web frameworks
    if (this.anyFileContains(files, 'github.com/gin-gonic/gin')) {
      frameworks.add('gin');
    }
    
    if (this.anyFileContains(files, 'github.com/gorilla/mux')) {
      frameworks.add('gorilla/mux');
    }
    
    if (this.anyFileContains(files, 'github.com/labstack/echo')) {
      frameworks.add('echo');
    }
    
    if (this.anyFileContains(files, 'github.com/gofiber/fiber')) {
      frameworks.add('fiber');
    }
    
    if (this.anyFileContains(files, 'github.com/go-chi/chi')) {
      frameworks.add('chi');
    }
    
    // Check for gRPC
    if (this.anyFileContains(files, 'google.golang.org/grpc')) {
      frameworks.add('grpc');
    }
    
    // Check for GraphQL
    if (this.anyFileContains(files, 'github.com/graphql-go/graphql')) {
      frameworks.add('graphql-go');
    }
    
    if (this.anyFileContains(files, 'github.com/99designs/gqlgen')) {
      frameworks.add('gqlgen');
    }
    
    return Array.from(frameworks);
  }
  
  /**
   * Gets the test frameworks used in the Go project
   * @param files Array of project files
   * @returns Array of detected test frameworks
   */
  getTestFrameworks(files: ProjectFile[]): string[] {
    const testFrameworks: Set<string> = new Set();
    
    // Check for standard Go testing
    if (files.some(file => file.path.endsWith('_test.go'))) {
      testFrameworks.add('go-test');
    }
    
    // Check for Testify
    if (this.anyFileContains(files, 'github.com/stretchr/testify')) {
      testFrameworks.add('testify');
    }
    
    // Check for GoMock
    if (this.anyFileContains(files, 'github.com/golang/mock')) {
      testFrameworks.add('gomock');
    }
    
    // Check for Ginkgo
    if (this.anyFileContains(files, 'github.com/onsi/ginkgo')) {
      testFrameworks.add('ginkgo');
    }
    
    // Check for GoConvey
    if (this.anyFileContains(files, 'github.com/smartystreets/goconvey')) {
      testFrameworks.add('goconvey');
    }
    
    return Array.from(testFrameworks);
  }
  
  /**
   * Gets the build tools used in the Go project
   * @param files Array of project files
   * @returns Array of detected build tools
   */
  getBuildTools(files: ProjectFile[]): string[] {
    const buildTools: Set<string> = new Set();
    
    // Check for Go modules
    if (this.findFilesByName(files, 'go.mod').length > 0) {
      buildTools.add('go-modules');
    }
    
    // Check for Dep
    if (this.findFilesByName(files, 'Gopkg.toml').length > 0) {
      buildTools.add('dep');
    }
    
    // Check for Glide
    if (this.findFilesByName(files, 'glide.yaml').length > 0) {
      buildTools.add('glide');
    }
    
    // Check for Make
    if (this.findFilesByName(files, 'Makefile').length > 0) {
      buildTools.add('make');
    }
    
    // Check for Docker
    if (this.findFilesByName(files, 'Dockerfile').length > 0) {
      buildTools.add('docker');
    }
    
    return Array.from(buildTools);
  }
  
  /**
   * Gets additional Go-specific information
   * @param files Array of project files
   * @returns Object containing Go-specific information
   */
  getAdditionalInfo(files: ProjectFile[]): Record<string, any> {
    const info: Record<string, any> = {};
    
    // Get Go module name
    const goModFile = this.findFilesByName(files, 'go.mod')[0];
    if (goModFile && goModFile.content) {
      const moduleMatch = goModFile.content.match(/module\s+([^\s]+)/);
      if (moduleMatch && moduleMatch[1]) {
        info.moduleName = moduleMatch[1];
      }
      
      // Get Go version
      const goVersionMatch = goModFile.content.match(/go\s+(\d+\.\d+)/);
      if (goVersionMatch && goVersionMatch[1]) {
        info.goVersion = goVersionMatch[1];
      }
    }
    
    // Check if it's a command or library
    const hasMainPackage = files.some(file => 
      file.content && file.content.includes('package main') && file.content.includes('func main()')
    );
    info.isCommand = hasMainPackage;
    
    // Check for database usage
    if (this.anyFileContains(files, 'database/sql')) {
      info.usesDatabase = true;
    }
    
    if (this.anyFileContains(files, 'github.com/go-sql-driver/mysql')) {
      info.database = 'mysql';
    } else if (this.anyFileContains(files, 'github.com/lib/pq')) {
      info.database = 'postgresql';
    } else if (this.anyFileContains(files, 'github.com/mattn/go-sqlite3')) {
      info.database = 'sqlite';
    }
    
    return info;
  }
  
  /**
   * Checks if the project has a typical Go package structure
   * @param files Array of project files
   * @returns True if the project has a Go package structure, false otherwise
   */
  private hasGoPackageStructure(files: ProjectFile[]): boolean {
    // Check for common Go directory structure
    const dirs = new Set(files.map(file => {
      const parts = file.relativePath.split('/');
      return parts.length > 1 ? parts[0] : '';
    }));
    
    const commonGoDirs = ['cmd', 'pkg', 'internal', 'api', 'web', 'config', 'docs'];
    return commonGoDirs.some(dir => dirs.has(dir));
  }
}
