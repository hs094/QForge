import { ProjectFile } from '../../types';
import { BaseLanguageAnalyzer } from '../language-analyzer';

/**
 * Ruby language analyzer
 */
export class RubyAnalyzer extends BaseLanguageAnalyzer {
  language = 'Ruby';
  protected fileExtensions = ['rb', 'rake', 'gemspec'];
  protected indicatorFiles = ['gemfile', 'rakefile', 'config.ru', '.ruby-version'];

  /**
   * Gets the confidence level for Ruby detection (0-100)
   * @param files Array of project files
   * @returns Confidence level (0-100)
   */
  getConfidence(files: ProjectFile[]): number {
    let confidence = super.getConfidence(files);

    // Check for Ruby shebang in files
    if (this.anyFileContains(files, '#!/usr/bin/env ruby') ||
        this.anyFileContains(files, '#!/usr/bin/ruby')) {
      confidence += 20;
    }

    // Check for Bundler
    if (this.findFilesByName(files, 'Gemfile.lock').length > 0) {
      confidence += 30;
    }

    // Check for Rails
    if (this.isRailsProject(files)) {
      confidence += 40;
    }

    return Math.min(confidence, 100);
  }

  /**
   * Gets the frameworks used in the Ruby project
   * @param files Array of project files
   * @returns Array of detected frameworks
   */
  getFrameworks(files: ProjectFile[]): string[] {
    const frameworks: Set<string> = new Set();

    // Check for Rails
    if (this.isRailsProject(files)) {
      frameworks.add('rails');
    }

    // Check for Sinatra
    if (this.anyFileContains(files, 'require "sinatra"') ||
        this.anyFileContains(files, "require 'sinatra'")) {
      frameworks.add('sinatra');
    }

    // Check for Hanami
    if (this.anyFileContains(files, 'require "hanami"') ||
        this.anyFileContains(files, "require 'hanami'")) {
      frameworks.add('hanami');
    }

    // Check for Grape
    if (this.anyFileContains(files, 'require "grape"') ||
        this.anyFileContains(files, "require 'grape'")) {
      frameworks.add('grape');
    }

    // Check for Jekyll
    if (this.findFilesByName(files, '_config.yml').length > 0 &&
        this.anyFileContains(files, 'jekyll')) {
      frameworks.add('jekyll');
    }

    // Check for Ruby on Jets
    if (this.anyFileContains(files, 'require "jets"') ||
        this.anyFileContains(files, "require 'jets'")) {
      frameworks.add('jets');
    }

    return Array.from(frameworks);
  }

  /**
   * Gets the test frameworks used in the Ruby project
   * @param files Array of project files
   * @returns Array of detected test frameworks
   */
  getTestFrameworks(files: ProjectFile[]): string[] {
    const testFrameworks: Set<string> = new Set();

    // Check for RSpec
    if (this.findFilesByName(files, '.rspec').length > 0 ||
        this.anyFileContains(files, 'require "rspec"') ||
        this.anyFileContains(files, "require 'rspec'")) {
      testFrameworks.add('rspec');
    }

    // Check for Minitest
    if (this.anyFileContains(files, 'require "minitest"') ||
        this.anyFileContains(files, "require 'minitest'")) {
      testFrameworks.add('minitest');
    }

    // Check for Test::Unit
    if (this.anyFileContains(files, 'require "test/unit"') ||
        this.anyFileContains(files, "require 'test/unit'")) {
      testFrameworks.add('test-unit');
    }

    // Check for Cucumber
    if (this.findFilesByName(files, 'cucumber.yml').length > 0 ||
        this.findFilesByExtension(files, 'feature').length > 0) {
      testFrameworks.add('cucumber');
    }

    // Check for Capybara
    if (this.anyFileContains(files, 'require "capybara"') ||
        this.anyFileContains(files, "require 'capybara'")) {
      testFrameworks.add('capybara');
    }

    return Array.from(testFrameworks);
  }

  /**
   * Gets the build tools used in the Ruby project
   * @param files Array of project files
   * @returns Array of detected build tools
   */
  getBuildTools(files: ProjectFile[]): string[] {
    const buildTools: Set<string> = new Set();

    // Check for Bundler
    if (this.findFilesByName(files, 'Gemfile').length > 0) {
      buildTools.add('bundler');
    }

    // Check for Rake
    if (this.findFilesByName(files, 'Rakefile').length > 0 ||
        this.findFilesByExtension(files, 'rake').length > 0) {
      buildTools.add('rake');
    }

    // Check for Make
    if (this.findFilesByName(files, 'Makefile').length > 0) {
      buildTools.add('make');
    }

    return Array.from(buildTools);
  }

  /**
   * Gets additional Ruby-specific information
   * @param files Array of project files
   * @returns Object containing Ruby-specific information
   */
  getAdditionalInfo(files: ProjectFile[]): Record<string, any> {
    const info: Record<string, any> = {};

    // Get Ruby version
    const rubyVersionFile = this.findFilesByName(files, '.ruby-version')[0];
    if (rubyVersionFile && rubyVersionFile.content) {
      info.rubyVersion = rubyVersionFile.content.trim();
    }

    // Check if it's a Rails API
    if (this.isRailsProject(files) && this.anyFileContains(files, 'Rails::API')) {
      info.isRailsAPI = true;
    }

    // Check for database
    if (this.isRailsProject(files)) {
      const databaseConfig = files.find(file => file.relativePath.includes('config/database.yml'));
      if (databaseConfig && databaseConfig.content) {
        if (databaseConfig.content.includes('adapter: postgresql')) {
          info.database = 'postgresql';
        } else if (databaseConfig.content.includes('adapter: mysql')) {
          info.database = 'mysql';
        } else if (databaseConfig.content.includes('adapter: sqlite3')) {
          info.database = 'sqlite';
        }
      }
    }

    return info;
  }

  /**
   * Checks if the project is a Rails project
   * @param files Array of project files
   * @returns True if the project is a Rails project, false otherwise
   */
  private isRailsProject(files: ProjectFile[]): boolean {
    return (
      this.findFilesByName(files, 'config/routes.rb').length > 0 ||
      this.findFilesByName(files, 'config/application.rb').length > 0 ||
      this.anyFileContains(files, 'Rails.application') ||
      this.anyFileContains(files, 'ActionController::Base')
    );
  }
}
