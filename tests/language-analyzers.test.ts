import { describe, expect, test } from '@jest/globals';
import { ProjectFile } from '../src/types';
import { RubyAnalyzer } from '../src/languages/ruby/ruby-analyzer';
import { GoAnalyzer } from '../src/languages/go/go-analyzer';
import { RustAnalyzer } from '../src/languages/rust/rust-analyzer';
import { PhpAnalyzer } from '../src/languages/php/php-analyzer';
import { DotNetAnalyzer } from '../src/languages/dotnet/dotnet-analyzer';

describe('Ruby Analyzer', () => {
  const rubyAnalyzer = new RubyAnalyzer();
  
  test('should detect Ruby from rb files', () => {
    const files: ProjectFile[] = [
      { path: '/project/app.rb', relativePath: 'app.rb', extension: 'rb' }
    ];
    
    expect(rubyAnalyzer.detect(files)).toBe(true);
  });
  
  test('should detect Rails framework', () => {
    const files: ProjectFile[] = [
      { path: '/project/config/routes.rb', relativePath: 'config/routes.rb', extension: 'rb' },
      { 
        path: '/project/app/controllers/application_controller.rb', 
        relativePath: 'app/controllers/application_controller.rb', 
        extension: 'rb',
        content: 'class ApplicationController < ActionController::Base\nend'
      }
    ];
    
    const frameworks = rubyAnalyzer.getFrameworks(files);
    expect(frameworks).toContain('rails');
  });
  
  test('should detect RSpec test framework', () => {
    const files: ProjectFile[] = [
      { path: '/project/.rspec', relativePath: '.rspec', extension: '' },
      { 
        path: '/project/spec/spec_helper.rb', 
        relativePath: 'spec/spec_helper.rb', 
        extension: 'rb',
        content: 'require "rspec"'
      }
    ];
    
    const testFrameworks = rubyAnalyzer.getTestFrameworks(files);
    expect(testFrameworks).toContain('rspec');
  });
});

describe('Go Analyzer', () => {
  const goAnalyzer = new GoAnalyzer();
  
  test('should detect Go from go files', () => {
    const files: ProjectFile[] = [
      { path: '/project/main.go', relativePath: 'main.go', extension: 'go' }
    ];
    
    expect(goAnalyzer.detect(files)).toBe(true);
  });
  
  test('should detect Gin framework', () => {
    const files: ProjectFile[] = [
      { 
        path: '/project/main.go', 
        relativePath: 'main.go', 
        extension: 'go',
        content: 'import "github.com/gin-gonic/gin"\n\nfunc main() {\n\tr := gin.Default()\n}'
      }
    ];
    
    const frameworks = goAnalyzer.getFrameworks(files);
    expect(frameworks).toContain('gin');
  });
  
  test('should detect Go modules', () => {
    const files: ProjectFile[] = [
      { 
        path: '/project/go.mod', 
        relativePath: 'go.mod', 
        extension: 'mod',
        content: 'module github.com/example/project\n\ngo 1.18\n'
      }
    ];
    
    const buildTools = goAnalyzer.getBuildTools(files);
    expect(buildTools).toContain('go-modules');
  });
});

describe('Rust Analyzer', () => {
  const rustAnalyzer = new RustAnalyzer();
  
  test('should detect Rust from rs files', () => {
    const files: ProjectFile[] = [
      { path: '/project/src/main.rs', relativePath: 'src/main.rs', extension: 'rs' }
    ];
    
    expect(rustAnalyzer.detect(files)).toBe(true);
  });
  
  test('should detect Rocket framework', () => {
    const files: ProjectFile[] = [
      { 
        path: '/project/Cargo.toml', 
        relativePath: 'Cargo.toml', 
        extension: 'toml',
        content: '[dependencies]\nrocket = "0.5.0"'
      }
    ];
    
    const frameworks = rustAnalyzer.getFrameworks(files);
    expect(frameworks).toContain('rocket');
  });
  
  test('should detect Cargo build tool', () => {
    const files: ProjectFile[] = [
      { path: '/project/Cargo.toml', relativePath: 'Cargo.toml', extension: 'toml' }
    ];
    
    const buildTools = rustAnalyzer.getBuildTools(files);
    expect(buildTools).toContain('cargo');
  });
});

describe('PHP Analyzer', () => {
  const phpAnalyzer = new PhpAnalyzer();
  
  test('should detect PHP from php files', () => {
    const files: ProjectFile[] = [
      { 
        path: '/project/index.php', 
        relativePath: 'index.php', 
        extension: 'php',
        content: '<?php echo "Hello World"; ?>'
      }
    ];
    
    expect(phpAnalyzer.detect(files)).toBe(true);
  });
  
  test('should detect Laravel framework', () => {
    const files: ProjectFile[] = [
      { path: '/project/artisan', relativePath: 'artisan', extension: '' }
    ];
    
    const frameworks = phpAnalyzer.getFrameworks(files);
    expect(frameworks).toContain('laravel');
  });
  
  test('should detect PHPUnit test framework', () => {
    const files: ProjectFile[] = [
      { path: '/project/phpunit.xml', relativePath: 'phpunit.xml', extension: 'xml' }
    ];
    
    const testFrameworks = phpAnalyzer.getTestFrameworks(files);
    expect(testFrameworks).toContain('phpunit');
  });
});

describe('DotNet Analyzer', () => {
  const dotnetAnalyzer = new DotNetAnalyzer();
  
  test('should detect C# from cs files', () => {
    const files: ProjectFile[] = [
      { path: '/project/Program.cs', relativePath: 'Program.cs', extension: 'cs' }
    ];
    
    expect(dotnetAnalyzer.detect(files)).toBe(true);
  });
  
  test('should detect ASP.NET Core framework', () => {
    const files: ProjectFile[] = [
      { 
        path: '/project/Startup.cs', 
        relativePath: 'Startup.cs', 
        extension: 'cs',
        content: 'using Microsoft.AspNetCore.Builder;\nusing Microsoft.AspNetCore.Hosting;'
      }
    ];
    
    const frameworks = dotnetAnalyzer.getFrameworks(files);
    expect(frameworks).toContain('asp.net-core');
  });
  
  test('should detect xUnit test framework', () => {
    const files: ProjectFile[] = [
      { 
        path: '/project/Tests/UnitTest1.cs', 
        relativePath: 'Tests/UnitTest1.cs', 
        extension: 'cs',
        content: 'using Xunit;\n\npublic class UnitTest1\n{\n    [Fact]\n    public void Test1()\n    {\n        Assert.True(true);\n    }\n}'
      }
    ];
    
    const testFrameworks = dotnetAnalyzer.getTestFrameworks(files);
    expect(testFrameworks).toContain('xunit');
  });
});
