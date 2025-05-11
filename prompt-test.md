# AWS CodePipeline Generation Request

I need you to generate a complete AWS CodePipeline configuration for a project with the following details:


## Project Details
- **Languages**: JavaScript, TypeScript
- **Frameworks**: react, express
- **Test Frameworks**: jest, cypress
- **Build Tools**: webpack, babel
- **Has Dockerfile**: Yes
- **Has Existing CI**: No
- **Package Manager**: npm
- **Key Dependencies**: react, react-dom, express


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
   - Push the image to a container registry


## JavaScript/TypeScript Specific Requirements
- Use Node.js version that's appropriate for the project (preferably the latest LTS)
- Install dependencies using npm
- Compile TypeScript code before running tests or building
- Use Jest, Mocha, or other appropriate test runner with coverage reporting
- Run ESLint or TSLint for code quality checks
- Use npm audit or Snyk for dependency vulnerability scanning


## React Specific Requirements
- Use appropriate build commands (e.g., react-scripts build)
- Run tests with react-scripts test or Jest
- Consider adding end-to-end tests with Cypress or Playwright

## Express.js Specific Requirements
- Run server-side tests
- Consider adding API integration tests
- Ensure proper error handling and logging


## Security Scanning Requirements
- Scan dependencies for known vulnerabilities
- Perform static code analysis for security issues
- Generate security reports
- Consider the following tools based on the project languages:
  - npm audit, Snyk, or OWASP Dependency Check for JavaScript/TypeScript
- Consider implementing secret scanning to prevent credential leaks
- Add SAST (Static Application Security Testing) tools appropriate for the codebase


## Self-Healing Requirements
- Implement automatic retries for flaky tests or network-dependent operations
- Add conditional logic to handle common failure scenarios
- Implement detailed logging for failure analysis
- Consider adding post-failure analysis steps that can suggest fixes
- Implement caching strategies to improve build performance and reliability

## AWS CodePipeline Specific Requirements
- Structure the pipeline with clear stage separation (Source, Build, Test, Security, Deploy)
- Use AWS CodeBuild for build and test stages
- Use appropriate AWS services for deployment (e.g., ECS, EKS, Lambda, etc.)
- Include IAM roles and policies with least privilege principles
- Use AWS Parameter Store or Secrets Manager for sensitive values
- Implement appropriate logging and monitoring
- Consider using AWS CloudFormation for infrastructure as code
- Include detailed comments explaining each section of the configuration

## Additional Guidelines
- Use AWS CodePipeline best practices for stage and action organization
- Implement appropriate retry and timeout settings for each stage
- Consider using approval actions for critical deployment stages
- Implement proper error handling and notification mechanisms
- Use appropriate artifact management between stages
- Consider implementing cross-region and cross-account capabilities if needed
- Implement proper resource tagging for cost allocation and management
- Consider using AWS CodeStar Notifications for pipeline events

Please generate a complete AWS CodePipeline configuration in YAML format (CloudFormation template) that implements all these requirements. The configuration should be well-structured, thoroughly commented, and follow AWS best practices.

The output should be a production-ready AWS CloudFormation template that can be directly deployed to create the complete CI/CD pipeline infrastructure.
