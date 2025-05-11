# Language Analyzers

QForge includes specialized analyzers for various programming languages to provide more accurate and detailed project analysis. This document describes the language analyzers and how they work.

## Overview

Language analyzers are responsible for:

1. Detecting if a project uses a specific language
2. Identifying frameworks used with that language
3. Detecting test frameworks specific to the language
4. Identifying build tools used with the language
5. Extracting additional language-specific information

## Supported Languages

QForge currently includes analyzers for the following languages:

- Ruby
- Go
- Rust
- PHP
- .NET (C#)

These analyzers complement the basic language detection that was already in place for JavaScript, TypeScript, Python, and Java.

## How Language Analyzers Work

Each language analyzer implements the `LanguageAnalyzer` interface, which defines methods for:

- Detecting the language
- Calculating a confidence level for the detection
- Identifying frameworks, test frameworks, and build tools
- Extracting additional language-specific information

The analyzers use various techniques to detect language characteristics:

- File extensions (e.g., `.rb` for Ruby, `.go` for Go)
- Indicator files (e.g., `Gemfile` for Ruby, `go.mod` for Go)
- Content patterns (e.g., `<?php` for PHP, `using System;` for C#)
- Directory structures (e.g., `app/controllers` for Rails, `cmd/` for Go)

## Language-Specific Features

### Ruby Analyzer

The Ruby analyzer can detect:

- **Frameworks**: Rails, Sinatra, Hanami, Grape, Jekyll, Jets
- **Test Frameworks**: RSpec, Minitest, Test::Unit, Cucumber, Capybara
- **Build Tools**: Bundler, Rake, Make
- **Additional Info**: Ruby version, Rails API status, database type

### Go Analyzer

The Go analyzer can detect:

- **Frameworks**: Gin, Gorilla/Mux, Echo, Fiber, Chi, gRPC, GraphQL
- **Test Frameworks**: Go test, Testify, GoMock, Ginkgo, GoConvey
- **Build Tools**: Go modules, Dep, Glide, Make, Docker
- **Additional Info**: Module name, Go version, command vs. library, database usage

### Rust Analyzer

The Rust analyzer can detect:

- **Frameworks**: Rocket, Actix-web, Warp, Axum, Iced, Egui, Tokio, Async-std, Diesel, Sea-ORM
- **Test Frameworks**: Rust test, Mockall, Proptest, Criterion, Quickcheck
- **Build Tools**: Cargo, Make, Just, build scripts
- **Additional Info**: Package name, Rust edition, binary vs. library, WASM target, Rust channel

### PHP Analyzer

The PHP analyzer can detect:

- **Frameworks**: Laravel, Symfony, WordPress, CodeIgniter, Yii, CakePHP, Drupal, Slim, Lumen
- **Test Frameworks**: PHPUnit, Codeception, Behat, Pest
- **Build Tools**: Composer, Phing, Make, npm/yarn, Webpack
- **Additional Info**: PHP version, package name, package type, Laravel version, database type

### .NET (C#) Analyzer

The .NET analyzer can detect:

- **Frameworks**: ASP.NET Core, ASP.NET MVC, .NET MAUI, Blazor, WPF, Windows Forms, Entity Framework, Xamarin
- **Test Frameworks**: MSTest, NUnit, xUnit, Moq, FluentAssertions
- **Build Tools**: MSBuild, .NET CLI, Cake, FAKE, NuGet, Docker
- **Additional Info**: .NET version, project type, API status, database type

## Integration with Project Analysis

The language analyzers are integrated into the main project analysis process:

1. Basic language detection is performed first
2. Language-specific analyzers are run for more detailed analysis
3. Results from all analyzers are combined
4. Languages are sorted by confidence level
5. Additional language-specific information is included in the project profile

## Example Output

When a project is analyzed, the language-specific information is displayed in the CLI output:

```
📊 Project Analysis Results:
  Languages: Ruby, JavaScript
  Frameworks: rails, react
  Test Frameworks: rspec, jest
  Build Tools: bundler, rake, webpack

🔍 Language-Specific Details:
  Ruby:
    Ruby version: 3.1.2
    Is rails API: true
    Database: postgresql
```

## Extending Language Analyzers

To add support for a new language:

1. Create a new directory in `src/languages/` for the language
2. Create a new analyzer class that implements the `LanguageAnalyzer` interface
3. Add the analyzer to the `getLanguageAnalyzers()` function in `src/languages/index.ts`
4. Add tests for the new analyzer in `tests/language-analyzers.test.ts`

## Future Improvements

Planned improvements for language analyzers include:

- Support for more languages (Swift, Kotlin, Scala, etc.)
- More detailed framework detection
- Version detection for frameworks and libraries
- Dependency analysis for each language
- Detection of language-specific best practices and patterns
