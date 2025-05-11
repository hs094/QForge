#!/usr/bin/env node

/**
 * Script to test Amazon Q prompts without running the full pipeline generation
 *
 * Usage:
 *   node scripts/test-prompt.js [options]
 *
 * Options:
 *   --platform <platform>  CI/CD platform (github or aws) (default: "github")
 *   --template <template>  Template file to use (default: platform-specific template)
 *   --output <file>        Output file for the prompt (default: "./prompt-test.md")
 *   --debug                Enable debug output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  platform: 'github',
  template: null,
  output: './prompt-test.md',
  debug: false
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--platform' && i + 1 < args.length) {
    options.platform = args[++i];
  } else if (arg === '--template' && i + 1 < args.length) {
    options.template = args[++i];
  } else if (arg === '--output' && i + 1 < args.length) {
    options.output = args[++i];
  } else if (arg === '--debug') {
    options.debug = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Test Amazon Q prompts without running the full pipeline generation

Usage:
  node scripts/test-prompt.js [options]

Options:
  --platform <platform>  CI/CD platform (github or aws) (default: "github")
  --template <template>  Template file to use (default: platform-specific template)
  --output <file>        Output file for the prompt (default: "./prompt-test.md")
  --debug                Enable debug output
  --help, -h             Show this help message
`);
    process.exit(0);
  }
}

// Validate platform
if (options.platform !== 'github' && options.platform !== 'aws') {
  console.error(`Error: Invalid platform "${options.platform}". Must be "github" or "aws".`);
  process.exit(1);
}

// Determine template path
const templatePath = options.template || path.join(
  __dirname,
  '../src/core/prompts/templates',
  options.platform === 'github' ? 'github-actions.md' : 'aws-codepipeline.md'
);

// Check if template exists
if (!fs.existsSync(templatePath)) {
  console.error(`Error: Template file "${templatePath}" does not exist.`);
  process.exit(1);
}

// Read template
let template;
try {
  template = fs.readFileSync(templatePath, 'utf-8');
  if (options.debug) {
    console.log(`Read template from ${templatePath}`);
  }
} catch (error) {
  console.error(`Error reading template: ${error.message}`);
  process.exit(1);
}

// Create a mock project profile
const mockProfile = {
  languages: ['JavaScript', 'TypeScript'],
  frameworks: ['react', 'express'],
  testFrameworks: ['jest', 'cypress'],
  buildTools: ['webpack', 'babel'],
  hasDockerfile: true,
  hasCI: false,
  packageManager: 'npm',
  dependencies: {
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
    'express': '^4.18.2'
  },
  devDependencies: {
    'jest': '^29.5.0',
    'webpack': '^5.80.0',
    'typescript': '^5.0.4'
  }
};

// Create mock options
const mockOptions = {
  testCoverage: true,
  linting: true,
  security: true,
  selfHealing: true
};

// Replace placeholders in template
let prompt = template;

// PROJECT_DETAILS placeholder
const projectDetails = `
## Project Details
- **Languages**: ${mockProfile.languages.join(', ')}
- **Frameworks**: ${mockProfile.frameworks.join(', ')}
- **Test Frameworks**: ${mockProfile.testFrameworks.join(', ')}
- **Build Tools**: ${mockProfile.buildTools.join(', ')}
- **Has Dockerfile**: ${mockProfile.hasDockerfile ? 'Yes' : 'No'}
- **Has Existing CI**: ${mockProfile.hasCI ? 'Yes' : 'No'}
- **Package Manager**: ${mockProfile.packageManager}
- **Key Dependencies**: react, react-dom, express`;

prompt = prompt.replace('{{PROJECT_DETAILS}}', projectDetails);

// PIPELINE_FEATURES placeholder
const pipelineFeatures = `
## Pipeline Requirements
1. **Source Control**: Checkout the latest code from the repository
2. **Environment Setup**: Configure the correct runtime environment
3. **Build Process**: Compile and build the project using webpack or babel
4. **Testing with Coverage**: Run tests using jest or cypress with coverage reporting
   - Set minimum coverage thresholds (80% for lines, functions, and branches)
   - Generate coverage reports in a standard format (lcov, cobertura, etc.)
   - Fail the build if coverage thresholds are not met
5. **Code Quality**: Implement linting and code quality checks
   - Use appropriate linters for the detected languages (JavaScript, TypeScript)
   - Enforce code style and quality standards
   - Fail the build if linting errors are found
6. **Security Scanning**: Implement security scanning
   - Scan dependencies for vulnerabilities
   - Perform static code analysis for security issues
   - Generate security reports
   - Optionally fail the build on critical vulnerabilities
7. **Self-Healing**: Implement self-healing capabilities
   - Add automatic retries for flaky tests or intermittent failures
   - Implement failure analysis and reporting
   - Add steps to automatically fix common issues when possible
8. **Containerization**: Build and publish Docker images
   - Build the Docker image using the Dockerfile
   - Tag the image appropriately (with version, commit hash, etc.)
   - Push the image to a container registry`;

prompt = prompt.replace('{{PIPELINE_FEATURES}}', pipelineFeatures);

// LANGUAGE_SPECIFIC_STEPS placeholder
const languageSpecificSteps = `
## JavaScript/TypeScript Specific Requirements
- Use Node.js version that's appropriate for the project (preferably the latest LTS)
- Install dependencies using npm
- Compile TypeScript code before running tests or building
- Use Jest, Mocha, or other appropriate test runner with coverage reporting
- Run ESLint or TSLint for code quality checks
- Use npm audit or Snyk for dependency vulnerability scanning`;

prompt = prompt.replace('{{LANGUAGE_SPECIFIC_STEPS}}', languageSpecificSteps);

// FRAMEWORK_SPECIFIC_STEPS placeholder
const frameworkSpecificSteps = `
## React Specific Requirements
- Use appropriate build commands (e.g., react-scripts build)
- Run tests with react-scripts test or Jest
- Consider adding end-to-end tests with Cypress or Playwright

## Express.js Specific Requirements
- Run server-side tests
- Consider adding API integration tests
- Ensure proper error handling and logging`;

prompt = prompt.replace('{{FRAMEWORK_SPECIFIC_STEPS}}', frameworkSpecificSteps);

// SECURITY_STEPS placeholder
const securitySteps = `
## Security Scanning Requirements
- Scan dependencies for known vulnerabilities
- Perform static code analysis for security issues
- Generate security reports
- Consider the following tools based on the project languages:
  - npm audit, Snyk, or OWASP Dependency Check for JavaScript/TypeScript
- Consider implementing secret scanning to prevent credential leaks
- Add SAST (Static Application Security Testing) tools appropriate for the codebase`;

prompt = prompt.replace('{{SECURITY_STEPS}}', securitySteps);

// SELF_HEALING_STEPS placeholder
const selfHealingSteps = `
## Self-Healing Requirements
- Implement automatic retries for flaky tests or network-dependent operations
- Add conditional logic to handle common failure scenarios
- Implement detailed logging for failure analysis
- Consider adding post-failure analysis steps that can suggest fixes
- Implement caching strategies to improve build performance and reliability`;

prompt = prompt.replace('{{SELF_HEALING_STEPS}}', selfHealingSteps);

// Write prompt to output file
try {
  fs.writeFileSync(options.output, prompt);
  console.log(`Prompt written to ${options.output}`);
} catch (error) {
  console.error(`Error writing prompt: ${error.message}`);
  process.exit(1);
}

// If Amazon Q CLI is installed, optionally test the prompt
try {
  execSync('q --version', { stdio: 'ignore' });

  console.log('\nAmazon Q CLI is installed. You can test this prompt with:');
  console.log(`q chat < "${options.output}" > "q-response.txt"`);
  console.log('\nOr in interactive mode:');
  console.log(`cat "${options.output}" | q chat`);
} catch (error) {
  console.log('\nAmazon Q CLI is not installed. Install it to test this prompt:');
  console.log('pip install amazon-q-cli');
}
