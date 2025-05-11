# QForge - Intelligent CI/CD Pipeline Generator

QForge is an AI-powered tool that analyzes your codebase and automatically generates tailored CI/CD pipelines for GitHub Actions, AWS CodePipeline, GitLab CI, or CircleCI. It leverages Amazon Q Developer CLI to create context-aware pipeline configurations, identifies test coverage gaps, inserts security scan gates, and implements advanced self-healing mechanisms with intelligent failure analysis and fix suggestions.

## Features

- **Advanced Codebase Analysis**: Automatically detects languages, frameworks, test tools, and build systems with specialized analyzers for Ruby, Go, Rust, PHP, and .NET
- **Pipeline Generation**: Creates GitHub Actions workflows, AWS CodePipeline, GitLab CI, or CircleCI configurations
- **Test Coverage**: Adds test coverage reporting and thresholds
- **Security Scanning**: Integrates security scanning tools based on your project's languages
- **Advanced Self-Healing**: Implements intelligent failure analysis, automatic retries, and fix suggestions
  - Pattern recognition for common failure types (tests, builds, dependencies, etc.)
  - Detailed failure diagnostics with log collection and analysis
  - Smart fix suggestions based on failure patterns
  - Self-healing reports with failure trends and insights
- **CLI Interface**: Easy-to-use command-line interface

## Prerequisites

- Node.js 16 or higher
- Amazon Q Developer CLI installed (`pip install amazon-q-cli`)
- Amazon Q Developer CLI configured with appropriate credentials

## Installation

### From npm (coming soon)

```bash
npm install -g qforge
```

### From source

```bash
git clone https://github.com/yourusername/qforge.git
cd qforge
npm install
npm run build
npm link
```

## Usage

### CLI

Generate a pipeline for the current project:

```bash
qforge generate
```

Specify options:

```bash
qforge generate --platform github --directory ./my-project --output ./custom-pipeline.yml
```

### Options

- `--platform, -p`: CI/CD platform (github, aws, gitlab, circleci, default: github)
- `--directory, -d`: Project directory (default: current directory)
- `--output, -o`: Output file path (default: .github/workflows/ci.yml or aws-pipeline.yml)
- `--yes, -y`: Skip confirmation prompts

## How It Works

1. **Advanced Project Analysis**: QForge scans your project files using specialized language analyzers to detect languages, frameworks, test tools, build systems, and language-specific characteristics.
2. **Pipeline Generation**: Using the detailed analysis results, QForge constructs a sophisticated prompt for Amazon Q Developer CLI to generate a tailored pipeline configuration for your chosen CI/CD platform.
3. **Enhancement**: The generated pipeline is enhanced with best practices, security scanning, and advanced self-healing capabilities including intelligent failure analysis and fix suggestions.
4. **Output**: The final pipeline configuration is saved to the appropriate location in your project.

### Language-Specific Analysis

QForge includes specialized analyzers for multiple programming languages:

- **Ruby**: Detects Rails, Sinatra, RSpec, Minitest, Bundler, and more
- **Go**: Identifies Gin, Echo, Go modules, Testify, and other Go-specific tools
- **Rust**: Recognizes Rocket, Actix-web, Cargo, and Rust-specific characteristics
- **PHP**: Detects Laravel, Symfony, WordPress, PHPUnit, Composer, and more
- **.NET**: Identifies ASP.NET Core, Blazor, xUnit, MSBuild, and other .NET technologies
- **And more**: Basic support for JavaScript, TypeScript, Python, Java, and other languages

### Advanced Prompting System

QForge uses a sophisticated prompting system to generate high-quality CI/CD pipelines:

- **Template-Based**: Prompts are loaded from template files for easy maintenance and customization
- **Context-Aware**: Prompts include detailed information about the project's languages, frameworks, and tools
- **Feature-Specific**: Different sections of the prompt are generated based on requested features
- **Platform-Optimized**: Separate templates for GitHub Actions, AWS CodePipeline, GitLab CI, and CircleCI ensure platform-specific best practices
- **Debuggable**: Prompts and responses are logged for debugging and improvement

## Development

### Project Structure

```
qforge/
├── src/
│   ├── core/                  # Core engine components
│   │   ├── analyzer/          # Codebase analysis modules
│   │   ├── generator/         # Pipeline generation logic
│   │   ├── amazon-q/          # Amazon Q CLI integration
│   │   ├── prompts/           # Amazon Q prompts and templates
│   │   │   └── templates/     # Prompt template files
│   │   ├── self-healing/      # Advanced self-healing capabilities
│   │   │   ├── analyzer.ts    # Failure analysis engine
│   │   │   ├── manager.ts     # Self-healing orchestration
│   │   │   ├── failure-patterns.ts # Common failure patterns
│   │   │   └── failure-fixes.ts    # Fix suggestions
│   │   └── utils/             # Utility functions
│   ├── languages/             # Language-specific modules
│   │   ├── ruby/              # Ruby language analyzer
│   │   ├── go/                # Go language analyzer
│   │   ├── rust/              # Rust language analyzer
│   │   ├── php/               # PHP language analyzer
│   │   ├── dotnet/            # .NET language analyzer
│   │   └── language-analyzer.ts # Base analyzer interface
│   ├── platforms/             # CI/CD platform support
│   │   ├── github/            # GitHub Actions support
│   │   ├── aws/               # AWS CodePipeline support
│   │   ├── gitlab/            # GitLab CI support
│   │   └── circleci/          # CircleCI support
│   ├── cli.ts                 # CLI entry point
│   └── types.ts               # Type definitions
├── dist/                      # Compiled JavaScript
├── tests/                     # Test suite
├── docs/                      # Documentation
│   └── language-analyzers.md  # Language analyzers documentation
└── README.md                  # Documentation
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Amazon Q Developer](https://aws.amazon.com/q/developer/) for providing the AI capabilities