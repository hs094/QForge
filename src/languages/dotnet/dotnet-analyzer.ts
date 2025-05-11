import { ProjectFile } from '../../types';
import { BaseLanguageAnalyzer } from '../language-analyzer';

/**
 * .NET language analyzer
 */
export class DotNetAnalyzer extends BaseLanguageAnalyzer {
  language = 'C#';
  protected fileExtensions = ['cs', 'csproj', 'sln'];
  protected indicatorFiles = [
    'global.json', 
    'nuget.config', 
    'packages.config', 
    'Program.cs', 
    'Startup.cs',
    'appsettings.json'
  ];
  
  /**
   * Gets the confidence level for .NET detection (0-100)
   * @param files Array of project files
   * @returns Confidence level (0-100)
   */
  getConfidence(files: ProjectFile[]): number {
    let confidence = super.getConfidence(files);
    
    // Check for .NET project files
    if (this.findFilesByExtension(files, 'csproj').length > 0) {
      confidence += 40;
    }
    
    // Check for .NET solution files
    if (this.findFilesByExtension(files, 'sln').length > 0) {
      confidence += 30;
    }
    
    // Check for C# source files with typical patterns
    const csFiles = this.findFilesByExtension(files, 'cs');
    if (csFiles.length > 0) {
      // Check for common C# patterns
      const hasCSharpPatterns = csFiles.some(file => 
        file.content && (
          file.content.includes('using System;') ||
          file.content.includes('namespace ') ||
          file.content.includes('public class') ||
          file.content.includes('static void Main')
        )
      );
      
      if (hasCSharpPatterns) {
        confidence += 20;
      }
    }
    
    return Math.min(confidence, 100);
  }
  
  /**
   * Gets the frameworks used in the .NET project
   * @param files Array of project files
   * @returns Array of detected frameworks
   */
  getFrameworks(files: ProjectFile[]): string[] {
    const frameworks: Set<string> = new Set();
    
    // Check for ASP.NET Core
    if (this.isAspNetCoreProject(files)) {
      frameworks.add('asp.net-core');
    }
    
    // Check for ASP.NET MVC
    if (this.isAspNetMvcProject(files)) {
      frameworks.add('asp.net-mvc');
    }
    
    // Check for .NET MAUI
    if (this.isDotNetMauiProject(files)) {
      frameworks.add('dotnet-maui');
    }
    
    // Check for Blazor
    if (this.isBlazorProject(files)) {
      frameworks.add('blazor');
    }
    
    // Check for WPF
    if (this.isWpfProject(files)) {
      frameworks.add('wpf');
    }
    
    // Check for Windows Forms
    if (this.isWinFormsProject(files)) {
      frameworks.add('winforms');
    }
    
    // Check for Entity Framework
    if (this.anyFileContains(files, 'Microsoft.EntityFrameworkCore') || 
        this.anyFileContains(files, 'DbContext')) {
      frameworks.add('entity-framework');
    }
    
    // Check for Xamarin
    if (this.isXamarinProject(files)) {
      frameworks.add('xamarin');
    }
    
    return Array.from(frameworks);
  }
  
  /**
   * Gets the test frameworks used in the .NET project
   * @param files Array of project files
   * @returns Array of detected test frameworks
   */
  getTestFrameworks(files: ProjectFile[]): string[] {
    const testFrameworks: Set<string> = new Set();
    
    // Check for MSTest
    if (this.anyFileContains(files, 'Microsoft.VisualStudio.TestTools.UnitTesting') || 
        this.anyFileContains(files, '[TestClass]') || 
        this.anyFileContains(files, '[TestMethod]')) {
      testFrameworks.add('mstest');
    }
    
    // Check for NUnit
    if (this.anyFileContains(files, 'NUnit.Framework') || 
        this.anyFileContains(files, '[TestFixture]') || 
        this.anyFileContains(files, '[Test]')) {
      testFrameworks.add('nunit');
    }
    
    // Check for xUnit
    if (this.anyFileContains(files, 'Xunit') || 
        this.anyFileContains(files, '[Fact]') || 
        this.anyFileContains(files, '[Theory]')) {
      testFrameworks.add('xunit');
    }
    
    // Check for Moq
    if (this.anyFileContains(files, 'Moq')) {
      testFrameworks.add('moq');
    }
    
    // Check for FluentAssertions
    if (this.anyFileContains(files, 'FluentAssertions')) {
      testFrameworks.add('fluentassertions');
    }
    
    return Array.from(testFrameworks);
  }
  
  /**
   * Gets the build tools used in the .NET project
   * @param files Array of project files
   * @returns Array of detected build tools
   */
  getBuildTools(files: ProjectFile[]): string[] {
    const buildTools: Set<string> = new Set();
    
    // Check for MSBuild
    if (this.findFilesByExtension(files, 'csproj').length > 0) {
      buildTools.add('msbuild');
    }
    
    // Check for .NET CLI
    if (this.findFilesByName(files, 'global.json').length > 0) {
      buildTools.add('dotnet-cli');
    }
    
    // Check for Cake
    if (this.findFilesByExtension(files, 'cake').length > 0) {
      buildTools.add('cake');
    }
    
    // Check for FAKE
    if (this.findFilesByExtension(files, 'fsx').length > 0 && 
        this.anyFileContains(files, 'FAKE')) {
      buildTools.add('fake');
    }
    
    // Check for NuGet
    if (this.findFilesByName(files, 'nuget.config').length > 0 || 
        this.findFilesByName(files, 'packages.config').length > 0) {
      buildTools.add('nuget');
    }
    
    // Check for Docker
    if (this.findFilesByName(files, 'Dockerfile').length > 0) {
      buildTools.add('docker');
    }
    
    return Array.from(buildTools);
  }
  
  /**
   * Gets additional .NET-specific information
   * @param files Array of project files
   * @returns Object containing .NET-specific information
   */
  getAdditionalInfo(files: ProjectFile[]): Record<string, any> {
    const info: Record<string, any> = {};
    
    // Get .NET version
    const globalJson = this.findFilesByName(files, 'global.json')[0];
    if (globalJson && globalJson.content) {
      try {
        const globalJsonObj = JSON.parse(globalJson.content);
        if (globalJsonObj.sdk && globalJsonObj.sdk.version) {
          info.dotnetVersion = globalJsonObj.sdk.version;
        }
      } catch (error) {
        // Ignore JSON parsing errors
      }
    }
    
    // Check for project type
    if (this.isAspNetCoreProject(files)) {
      info.projectType = 'web';
      
      // Check if it's an API
      if (this.anyFileContains(files, '[ApiController]') || 
          this.anyFileContains(files, 'ControllerBase')) {
        info.isApi = true;
      }
    } else if (this.isWpfProject(files) || this.isWinFormsProject(files)) {
      info.projectType = 'desktop';
    } else if (this.isDotNetMauiProject(files) || this.isXamarinProject(files)) {
      info.projectType = 'mobile';
    } else if (this.anyFileContains(files, 'Microsoft.NET.Sdk.Worker')) {
      info.projectType = 'worker';
    } else if (this.anyFileContains(files, 'Microsoft.NET.Sdk.Web')) {
      info.projectType = 'web';
    }
    
    // Check for database usage
    if (this.anyFileContains(files, 'Microsoft.EntityFrameworkCore.SqlServer')) {
      info.database = 'sqlserver';
    } else if (this.anyFileContains(files, 'Npgsql.EntityFrameworkCore.PostgreSQL')) {
      info.database = 'postgresql';
    } else if (this.anyFileContains(files, 'Microsoft.EntityFrameworkCore.Sqlite')) {
      info.database = 'sqlite';
    } else if (this.anyFileContains(files, 'Pomelo.EntityFrameworkCore.MySql')) {
      info.database = 'mysql';
    }
    
    return info;
  }
  
  /**
   * Checks if the project is an ASP.NET Core project
   * @param files Array of project files
   * @returns True if the project is an ASP.NET Core project, false otherwise
   */
  private isAspNetCoreProject(files: ProjectFile[]): boolean {
    return (
      this.anyFileContains(files, 'Microsoft.AspNetCore') ||
      this.findFilesByName(files, 'Startup.cs').length > 0 ||
      this.findFilesByName(files, 'Program.cs').some(file => 
        file.content && file.content.includes('CreateHostBuilder')
      )
    );
  }
  
  /**
   * Checks if the project is an ASP.NET MVC project
   * @param files Array of project files
   * @returns True if the project is an ASP.NET MVC project, false otherwise
   */
  private isAspNetMvcProject(files: ProjectFile[]): boolean {
    return (
      this.anyFileContains(files, 'System.Web.Mvc') ||
      files.some(file => file.relativePath.includes('Controllers') && file.relativePath.includes('Controller.cs'))
    );
  }
  
  /**
   * Checks if the project is a .NET MAUI project
   * @param files Array of project files
   * @returns True if the project is a .NET MAUI project, false otherwise
   */
  private isDotNetMauiProject(files: ProjectFile[]): boolean {
    return (
      this.anyFileContains(files, 'Microsoft.Maui') ||
      this.anyFileContains(files, '<UseMaui>')
    );
  }
  
  /**
   * Checks if the project is a Blazor project
   * @param files Array of project files
   * @returns True if the project is a Blazor project, false otherwise
   */
  private isBlazorProject(files: ProjectFile[]): boolean {
    return (
      this.anyFileContains(files, 'Microsoft.AspNetCore.Components') ||
      this.findFilesByExtension(files, 'razor').length > 0 ||
      this.anyFileContains(files, '@page')
    );
  }
  
  /**
   * Checks if the project is a WPF project
   * @param files Array of project files
   * @returns True if the project is a WPF project, false otherwise
   */
  private isWpfProject(files: ProjectFile[]): boolean {
    return (
      this.anyFileContains(files, 'PresentationFramework') ||
      this.findFilesByExtension(files, 'xaml').length > 0 ||
      this.anyFileContains(files, '<Window ')
    );
  }
  
  /**
   * Checks if the project is a Windows Forms project
   * @param files Array of project files
   * @returns True if the project is a Windows Forms project, false otherwise
   */
  private isWinFormsProject(files: ProjectFile[]): boolean {
    return (
      this.anyFileContains(files, 'System.Windows.Forms') ||
      this.anyFileContains(files, 'Form : Form')
    );
  }
  
  /**
   * Checks if the project is a Xamarin project
   * @param files Array of project files
   * @returns True if the project is a Xamarin project, false otherwise
   */
  private isXamarinProject(files: ProjectFile[]): boolean {
    return (
      this.anyFileContains(files, 'Xamarin.Forms') ||
      this.anyFileContains(files, 'Xamarin.Android') ||
      this.anyFileContains(files, 'Xamarin.iOS')
    );
  }
}
