import { ProjectFile } from '../../types';
import { BaseLanguageAnalyzer } from '../language-analyzer';

/**
 * PHP language analyzer
 */
export class PhpAnalyzer extends BaseLanguageAnalyzer {
  language = 'PHP';
  protected fileExtensions = ['php'];
  protected indicatorFiles = ['composer.json', 'composer.lock', 'index.php', 'artisan', '.htaccess', 'wp-config.php'];
  
  /**
   * Gets the confidence level for PHP detection (0-100)
   * @param files Array of project files
   * @returns Confidence level (0-100)
   */
  getConfidence(files: ProjectFile[]): number {
    let confidence = super.getConfidence(files);
    
    // Check for Composer
    if (this.findFilesByName(files, 'composer.json').length > 0) {
      confidence += 30;
    }
    
    // Check for PHP opening tags
    const phpFiles = this.findFilesByExtension(files, 'php');
    if (phpFiles.some(file => file.content && (file.content.includes('<?php') || file.content.includes('<?=')))) {
      confidence += 20;
    }
    
    // Check for common PHP frameworks
    if (this.isLaravelProject(files) || this.isSymfonyProject(files) || this.isWordPressProject(files)) {
      confidence += 30;
    }
    
    return Math.min(confidence, 100);
  }
  
  /**
   * Gets the frameworks used in the PHP project
   * @param files Array of project files
   * @returns Array of detected frameworks
   */
  getFrameworks(files: ProjectFile[]): string[] {
    const frameworks: Set<string> = new Set();
    
    // Check for Laravel
    if (this.isLaravelProject(files)) {
      frameworks.add('laravel');
    }
    
    // Check for Symfony
    if (this.isSymfonyProject(files)) {
      frameworks.add('symfony');
    }
    
    // Check for WordPress
    if (this.isWordPressProject(files)) {
      frameworks.add('wordpress');
    }
    
    // Check for CodeIgniter
    if (this.anyFileContains(files, 'CodeIgniter') || 
        this.findFilesByName(files, 'application/config/config.php').length > 0) {
      frameworks.add('codeigniter');
    }
    
    // Check for Yii
    if (this.anyFileContains(files, 'Yii::') || 
        this.findFilesByName(files, 'protected/config/main.php').length > 0) {
      frameworks.add('yii');
    }
    
    // Check for CakePHP
    if (this.anyFileContains(files, 'CakePHP') || 
        this.findFilesByName(files, 'config/app.php').length > 0 && 
        this.anyFileContains(files, 'Cake\\')) {
      frameworks.add('cakephp');
    }
    
    // Check for Drupal
    if (this.findFilesByName(files, 'core/lib/Drupal.php').length > 0 || 
        this.anyFileContains(files, 'Drupal\\')) {
      frameworks.add('drupal');
    }
    
    // Check for Slim
    const composerJson = this.findFilesByName(files, 'composer.json')[0];
    if (composerJson && composerJson.content && composerJson.content.includes('"slim/slim"')) {
      frameworks.add('slim');
    }
    
    // Check for Lumen
    if (this.anyFileContains(files, 'Laravel\\Lumen')) {
      frameworks.add('lumen');
    }
    
    return Array.from(frameworks);
  }
  
  /**
   * Gets the test frameworks used in the PHP project
   * @param files Array of project files
   * @returns Array of detected test frameworks
   */
  getTestFrameworks(files: ProjectFile[]): string[] {
    const testFrameworks: Set<string> = new Set();
    const composerJson = this.findFilesByName(files, 'composer.json')[0];
    
    // Check composer.json for test dependencies
    if (composerJson && composerJson.content) {
      if (composerJson.content.includes('"phpunit/phpunit"')) {
        testFrameworks.add('phpunit');
      }
      
      if (composerJson.content.includes('"codeception/codeception"')) {
        testFrameworks.add('codeception');
      }
      
      if (composerJson.content.includes('"behat/behat"')) {
        testFrameworks.add('behat');
      }
      
      if (composerJson.content.includes('"pestphp/pest"')) {
        testFrameworks.add('pest');
      }
    }
    
    // Check for PHPUnit configuration
    if (this.findFilesByName(files, 'phpunit.xml').length > 0 || 
        this.findFilesByName(files, 'phpunit.xml.dist').length > 0) {
      testFrameworks.add('phpunit');
    }
    
    // Check for Codeception configuration
    if (this.findFilesByName(files, 'codeception.yml').length > 0) {
      testFrameworks.add('codeception');
    }
    
    // Check for Behat configuration
    if (this.findFilesByName(files, 'behat.yml').length > 0) {
      testFrameworks.add('behat');
    }
    
    return Array.from(testFrameworks);
  }
  
  /**
   * Gets the build tools used in the PHP project
   * @param files Array of project files
   * @returns Array of detected build tools
   */
  getBuildTools(files: ProjectFile[]): string[] {
    const buildTools: Set<string> = new Set();
    
    // Check for Composer
    if (this.findFilesByName(files, 'composer.json').length > 0) {
      buildTools.add('composer');
    }
    
    // Check for Phing
    if (this.findFilesByName(files, 'build.xml').length > 0 && 
        this.anyFileContains(files, '<project name=')) {
      buildTools.add('phing');
    }
    
    // Check for Make
    if (this.findFilesByName(files, 'Makefile').length > 0) {
      buildTools.add('make');
    }
    
    // Check for npm/yarn (for frontend assets)
    if (this.findFilesByName(files, 'package.json').length > 0) {
      if (this.findFilesByName(files, 'yarn.lock').length > 0) {
        buildTools.add('yarn');
      } else {
        buildTools.add('npm');
      }
    }
    
    // Check for Webpack
    if (this.findFilesByName(files, 'webpack.config.js').length > 0 || 
        this.findFilesByName(files, 'webpack.mix.js').length > 0) {
      buildTools.add('webpack');
    }
    
    return Array.from(buildTools);
  }
  
  /**
   * Gets additional PHP-specific information
   * @param files Array of project files
   * @returns Object containing PHP-specific information
   */
  getAdditionalInfo(files: ProjectFile[]): Record<string, any> {
    const info: Record<string, any> = {};
    
    // Get PHP version requirement
    const composerJson = this.findFilesByName(files, 'composer.json')[0];
    if (composerJson && composerJson.content) {
      try {
        const composer = JSON.parse(composerJson.content);
        if (composer.require && composer.require.php) {
          info.phpVersion = composer.require.php;
        }
        
        // Get package name
        if (composer.name) {
          info.packageName = composer.name;
        }
        
        // Get package type
        if (composer.type) {
          info.packageType = composer.type;
        }
      } catch (error) {
        // Ignore JSON parsing errors
      }
    }
    
    // Check for Laravel version
    if (this.isLaravelProject(files)) {
      const laravelVersionFile = files.find(file => 
        file.relativePath.includes('vendor/laravel/framework/src/Illuminate/Foundation/Application.php')
      );
      
      if (laravelVersionFile && laravelVersionFile.content) {
        const versionMatch = laravelVersionFile.content.match(/const VERSION = '([^']+)'/);
        if (versionMatch && versionMatch[1]) {
          info.laravelVersion = versionMatch[1];
        }
      }
    }
    
    // Check for database configuration
    if (this.isLaravelProject(files)) {
      const dbConfigFile = files.find(file => file.relativePath.includes('config/database.php'));
      if (dbConfigFile && dbConfigFile.content) {
        if (dbConfigFile.content.includes("'mysql'")) {
          info.database = 'mysql';
        } else if (dbConfigFile.content.includes("'pgsql'")) {
          info.database = 'postgresql';
        } else if (dbConfigFile.content.includes("'sqlite'")) {
          info.database = 'sqlite';
        }
      }
    }
    
    return info;
  }
  
  /**
   * Checks if the project is a Laravel project
   * @param files Array of project files
   * @returns True if the project is a Laravel project, false otherwise
   */
  private isLaravelProject(files: ProjectFile[]): boolean {
    return (
      this.findFilesByName(files, 'artisan').length > 0 ||
      files.some(file => file.relativePath.includes('app/Http/Controllers')) ||
      this.anyFileContains(files, 'Illuminate\\')
    );
  }
  
  /**
   * Checks if the project is a Symfony project
   * @param files Array of project files
   * @returns True if the project is a Symfony project, false otherwise
   */
  private isSymfonyProject(files: ProjectFile[]): boolean {
    return (
      this.findFilesByName(files, 'symfony.lock').length > 0 ||
      files.some(file => file.relativePath.includes('config/bundles.php')) ||
      this.anyFileContains(files, 'Symfony\\')
    );
  }
  
  /**
   * Checks if the project is a WordPress project
   * @param files Array of project files
   * @returns True if the project is a WordPress project, false otherwise
   */
  private isWordPressProject(files: ProjectFile[]): boolean {
    return (
      this.findFilesByName(files, 'wp-config.php').length > 0 ||
      this.findFilesByName(files, 'wp-content').length > 0 ||
      this.anyFileContains(files, 'wp_')
    );
  }
}
