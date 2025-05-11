import { ProjectProfile, GeneratorOptions, CIPlatform } from '../../types';
import fs from 'fs-extra';
import path from 'path';

/**
 * Collection of prompts for Amazon Q Developer CLI
 */
export class Prompts {
  // Template cache to avoid reading files multiple times
  private static templateCache: Record<string, string> = {};
  /**
   * Generates a prompt for pipeline generation based on project profile and options
   * @param projectProfile Project profile from analyzer
   * @param platform Target CI/CD platform
   * @param options Additional options
   * @returns Formatted prompt string
   */
  static generatePipelinePrompt(
    projectProfile: ProjectProfile,
    platform: CIPlatform,
    options: {
      testCoverage: boolean;
      linting: boolean;
      security: boolean;
      selfHealing: boolean;
    }
  ): string {
    // Get platform-specific template
    let templateName: string;

    switch (platform) {
      case 'github':
        templateName = 'github-actions.md';
        break;
      case 'aws':
        templateName = 'aws-codepipeline.md';
        break;
      case 'gitlab':
        templateName = 'gitlab-ci.md';
        break;
      case 'circleci':
        templateName = 'circleci.md';
        break;
      default:
        templateName = 'github-actions.md';
    }

    const template = this.loadTemplate(templateName);

    // Replace placeholders with actual values
    return template
      .replace('{{PROJECT_DETAILS}}', this.generateProjectDetails(projectProfile))
      .replace('{{PIPELINE_FEATURES}}', this.generatePipelineFeatures(projectProfile, options))
      .replace('{{LANGUAGE_SPECIFIC_STEPS}}', this.generateLanguageSpecificSteps(projectProfile, options))
      .replace('{{FRAMEWORK_SPECIFIC_STEPS}}', this.generateFrameworkSpecificSteps(projectProfile))
      .replace('{{SECURITY_STEPS}}', options.security ? this.generateSecuritySteps(projectProfile) : '')
      .replace('{{SELF_HEALING_STEPS}}', options.selfHealing ? this.generateSelfHealingSteps() : '');
  }

  /**
   * Generates a detailed description of the project
   * @param projectProfile Project profile from analyzer
   * @returns Formatted project details string
   */
  private static generateProjectDetails(projectProfile: ProjectProfile): string {
    const languages = projectProfile.languages.join(', ');
    const frameworks = projectProfile.frameworks.join(', ');
    const testFrameworks = projectProfile.testFrameworks.join(', ');
    const buildTools = projectProfile.buildTools.join(', ');

    let details = `
## Project Details
- **Languages**: ${languages || 'Not detected'}
- **Frameworks**: ${frameworks || 'Not detected'}
- **Test Frameworks**: ${testFrameworks || 'Not detected'}
- **Build Tools**: ${buildTools || 'Not detected'}
- **Has Dockerfile**: ${projectProfile.hasDockerfile ? 'Yes' : 'No'}
- **Has Existing CI**: ${projectProfile.hasCI ? 'Yes' : 'No'}`;

    // Add package manager details for Node.js projects
    if (projectProfile.packageManager) {
      details += `
- **Package Manager**: ${projectProfile.packageManager}`;
    }

    // Add dependency details if available
    if (projectProfile.dependencies && Object.keys(projectProfile.dependencies).length > 0) {
      const keyDependencies = Object.keys(projectProfile.dependencies)
        .filter(dep => !dep.startsWith('@types/'))
        .slice(0, 5)
        .join(', ');

      details += `
- **Key Dependencies**: ${keyDependencies}`;
    }

    return details;
  }

  /**
   * Generates a description of the requested pipeline features
   * @param projectProfile Project profile from analyzer
   * @param options Generator options
   * @returns Formatted pipeline features string
   */
  private static generatePipelineFeatures(
    projectProfile: ProjectProfile,
    options: {
      testCoverage: boolean;
      linting: boolean;
      security: boolean;
      selfHealing: boolean;
    }
  ): string {
    let features = `
## Pipeline Requirements
1. **Source Control**: Checkout the latest code from the repository
2. **Environment Setup**: Configure the correct runtime environment`;

    // Add build step if build tools are detected
    if (projectProfile.buildTools.length > 0) {
      features += `
3. **Build Process**: Compile and build the project using ${projectProfile.buildTools.join(' or ')}`;
    } else {
      features += `
3. **Build Process**: Compile and build the project using appropriate tools`;
    }

    // Add test step with specific frameworks if detected
    if (projectProfile.testFrameworks.length > 0) {
      if (options.testCoverage) {
        features += `
4. **Testing with Coverage**: Run tests using ${projectProfile.testFrameworks.join(' or ')} with coverage reporting
   - Set minimum coverage thresholds (80% for lines, functions, and branches)
   - Generate coverage reports in a standard format (lcov, cobertura, etc.)
   - Fail the build if coverage thresholds are not met`;
      } else {
        features += `
4. **Testing**: Run tests using ${projectProfile.testFrameworks.join(' or ')}`;
      }
    } else if (options.testCoverage) {
      features += `
4. **Testing with Coverage**: Implement test running with coverage reporting
   - Set minimum coverage thresholds (80% for lines, functions, and branches)
   - Generate coverage reports in a standard format
   - Fail the build if coverage thresholds are not met`;
    } else {
      features += `
4. **Testing**: Implement appropriate test running`;
    }

    // Add linting if requested
    if (options.linting) {
      features += `
5. **Code Quality**: Implement linting and code quality checks
   - Use appropriate linters for the detected languages (${projectProfile.languages.join(', ')})
   - Enforce code style and quality standards
   - Fail the build if linting errors are found`;
    }

    // Add security scanning if requested
    if (options.security) {
      features += `
6. **Security Scanning**: Implement security scanning
   - Scan dependencies for vulnerabilities
   - Perform static code analysis for security issues
   - Generate security reports
   - Optionally fail the build on critical vulnerabilities`;
    }

    // Add self-healing if requested
    if (options.selfHealing) {
      features += `
7. **Advanced Self-Healing**: Implement sophisticated self-healing capabilities
   - Add intelligent failure analysis with pattern recognition for common failure types
   - Implement automatic retries with exponential backoff for flaky tests or intermittent failures
   - Provide detailed failure diagnostics with log collection and analysis
   - Generate smart fix suggestions based on failure patterns
   - Create self-healing reports with failure trends and insights
   - Implement environment diagnostics to detect resource constraints`;
    }

    // Add deployment if Docker is detected
    if (projectProfile.hasDockerfile) {
      features += `
8. **Containerization**: Build and publish Docker images
   - Build the Docker image using the Dockerfile
   - Tag the image appropriately (with version, commit hash, etc.)
   - Push the image to a container registry`;
    }

    return features;
  }

  /**
   * Generates language-specific pipeline steps
   * @param projectProfile Project profile from analyzer
   * @param options Generator options
   * @returns Formatted language-specific steps string
   */
  private static generateLanguageSpecificSteps(
    projectProfile: ProjectProfile,
    options: {
      testCoverage: boolean;
      linting: boolean;
      security: boolean;
      selfHealing: boolean;
    }
  ): string {
    let steps = '';

    // JavaScript/TypeScript specific steps
    if (projectProfile.languages.includes('JavaScript') || projectProfile.languages.includes('TypeScript')) {
      steps += `
## JavaScript/TypeScript Specific Requirements
- Use Node.js version that's appropriate for the project (preferably the latest LTS)
- Install dependencies using ${projectProfile.packageManager || 'npm'}
- ${projectProfile.languages.includes('TypeScript') ? 'Compile TypeScript code before running tests or building' : 'Bundle JavaScript code if needed'}
- ${options.testCoverage ? 'Use Jest, Mocha, or other appropriate test runner with coverage reporting' : 'Use appropriate test runner'}
- ${options.linting ? 'Run ESLint or TSLint for code quality checks' : ''}
- ${options.security ? 'Use npm audit or Snyk for dependency vulnerability scanning' : ''}`;
    }

    // Python specific steps
    if (projectProfile.languages.includes('Python')) {
      steps += `
## Python Specific Requirements
- Use Python version that's appropriate for the project
- Set up a virtual environment
- Install dependencies from requirements.txt, Pipfile, or pyproject.toml
- ${options.testCoverage ? 'Use pytest with coverage plugins for test coverage reporting' : 'Use pytest or unittest for running tests'}
- ${options.linting ? 'Run pylint, flake8, or black for code quality checks' : ''}
- ${options.security ? 'Use bandit or safety for security scanning' : ''}`;
    }

    // Java specific steps
    if (projectProfile.languages.includes('Java')) {
      steps += `
## Java Specific Requirements
- Use appropriate JDK version
- Build with ${projectProfile.buildTools.includes('maven') ? 'Maven' : projectProfile.buildTools.includes('gradle') ? 'Gradle' : 'Maven or Gradle'}
- ${options.testCoverage ? 'Use JaCoCo for code coverage' : 'Run JUnit or TestNG tests'}
- ${options.linting ? 'Use CheckStyle, PMD, or SpotBugs for code quality' : ''}
- ${options.security ? 'Use OWASP Dependency Check for security scanning' : ''}`;
    }

    // Go specific steps
    if (projectProfile.languages.includes('Go')) {
      steps += `
## Go Specific Requirements
- Use appropriate Go version
- Run go build and go test commands
- ${options.testCoverage ? 'Enable test coverage with -cover flags' : ''}
- ${options.linting ? 'Use golangci-lint for code quality checks' : ''}
- ${options.security ? 'Use gosec for security scanning' : ''}`;
    }

    return steps;
  }

  /**
   * Generates framework-specific pipeline steps
   * @param projectProfile Project profile from analyzer
   * @returns Formatted framework-specific steps string
   */
  private static generateFrameworkSpecificSteps(projectProfile: ProjectProfile): string {
    let steps = '';

    // React specific steps
    if (projectProfile.frameworks.includes('react')) {
      steps += `
## React Specific Requirements
- Use appropriate build commands (e.g., react-scripts build)
- Run tests with react-scripts test or Jest
- Consider adding end-to-end tests with Cypress or Playwright`;
    }

    // Next.js specific steps
    if (projectProfile.frameworks.includes('next.js')) {
      steps += `
## Next.js Specific Requirements
- Use next build for production builds
- Use next lint for linting
- Consider adding both unit tests and integration tests`;
    }

    // Express specific steps
    if (projectProfile.frameworks.includes('express')) {
      steps += `
## Express.js Specific Requirements
- Run server-side tests
- Consider adding API integration tests
- Ensure proper error handling and logging`;
    }

    // Django specific steps
    if (projectProfile.frameworks.includes('django')) {
      steps += `
## Django Specific Requirements
- Run Django migrations
- Use Django test framework
- Consider adding database setup and teardown steps`;
    }

    // Spring specific steps
    if (projectProfile.frameworks.includes('spring')) {
      steps += `
## Spring Framework Specific Requirements
- Use Spring Boot build tools if applicable
- Run Spring Boot tests
- Consider adding integration tests with test containers`;
    }

    return steps;
  }

  /**
   * Generates security scanning steps
   * @param projectProfile Project profile from analyzer
   * @returns Formatted security steps string
   */
  private static generateSecuritySteps(projectProfile: ProjectProfile): string {
    return `
## Security Scanning Requirements
- Scan dependencies for known vulnerabilities
- Perform static code analysis for security issues
- Generate security reports
- Consider the following tools based on the project languages:
  ${projectProfile.languages.includes('JavaScript') || projectProfile.languages.includes('TypeScript') ? '- npm audit, Snyk, or OWASP Dependency Check for JavaScript/TypeScript' : ''}
  ${projectProfile.languages.includes('Python') ? '- bandit, safety, or OWASP Dependency Check for Python' : ''}
  ${projectProfile.languages.includes('Java') ? '- OWASP Dependency Check or Snyk for Java' : ''}
  ${projectProfile.languages.includes('Go') ? '- gosec or Snyk for Go' : ''}
- Consider implementing secret scanning to prevent credential leaks
- Add SAST (Static Application Security Testing) tools appropriate for the codebase`;
  }

  /**
   * Generates self-healing steps
   * @returns Formatted self-healing steps string
   */
  private static generateSelfHealingSteps(): string {
    return `
## Self-Healing Requirements
- Implement sophisticated failure analysis with pattern recognition for common failure types:
  - Test failures (assertion errors, flaky tests)
  - Build failures (compilation errors, missing modules)
  - Dependency issues (version conflicts, missing packages)
  - Resource constraints (memory limits, disk space)
  - Network issues (timeouts, connection failures)
  - Permission problems (access denied, authentication failures)
  - Configuration errors (invalid syntax, missing settings)
  - Timeout issues (long-running operations)

- Implement intelligent automatic retry mechanisms:
  - Add retry logic for flaky tests or network-dependent operations
  - Use exponential backoff for retries
  - Set appropriate retry limits and conditions
  - Track retry attempts and success rates

- Provide detailed failure diagnostics:
  - Collect and analyze logs from failed steps
  - Extract relevant error messages and context
  - Identify the root cause of failures when possible
  - Generate comprehensive failure reports

- Implement smart fix suggestions:
  - Provide specific recommendations based on failure patterns
  - Include code snippets or commands to fix common issues
  - Prioritize suggestions based on likelihood of success
  - Link to documentation or resources for complex issues

- Add self-healing reporting:
  - Generate periodic reports on pipeline health
  - Track failure trends and patterns over time
  - Measure effectiveness of self-healing mechanisms
  - Provide insights for long-term improvements

- Implement environment diagnostics:
  - Capture system information (memory, disk space, etc.)
  - Monitor resource usage during pipeline execution
  - Detect and report on resource constraints
  - Provide recommendations for resource optimization`;
  }

  /**
   * Loads a template from the templates directory
   * @param templateName Name of the template file
   * @returns Template content
   */
  private static loadTemplate(templateName: string): string {
    // Check if template is already cached
    if (this.templateCache[templateName]) {
      return this.templateCache[templateName];
    }

    try {
      // Determine template path
      const templatePath = path.join(__dirname, 'templates', templateName);

      // Read template file
      const template = fs.readFileSync(templatePath, 'utf-8');

      // Cache template for future use
      this.templateCache[templateName] = template;

      return template;
    } catch (error) {
      console.error(`Error loading template ${templateName}: ${error instanceof Error ? error.message : String(error)}`);

      // Return a basic fallback template if file loading fails
      return `# ${templateName.includes('github') ? 'GitHub Actions' : 'AWS CodePipeline'} Generation Request

I need you to generate a complete ${templateName.includes('github') ? 'GitHub Actions workflow' : 'AWS CodePipeline configuration'} for a project with the following details:

{{PROJECT_DETAILS}}

{{PIPELINE_FEATURES}}

{{LANGUAGE_SPECIFIC_STEPS}}

{{FRAMEWORK_SPECIFIC_STEPS}}

{{SECURITY_STEPS}}

{{SELF_HEALING_STEPS}}

Please generate a complete, well-structured, and thoroughly commented configuration file.`;
    }
  }
}
