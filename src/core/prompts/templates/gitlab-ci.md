# GitLab CI/CD Pipeline Generation Request

I need you to generate a complete GitLab CI/CD pipeline configuration file for a project with the following details:

{{PROJECT_DETAILS}}

{{PIPELINE_FEATURES}}

{{LANGUAGE_SPECIFIC_STEPS}}

{{FRAMEWORK_SPECIFIC_STEPS}}

{{SECURITY_STEPS}}

{{SELF_HEALING_STEPS}}

## GitLab CI/CD Specific Requirements
- The pipeline should be defined in a `.gitlab-ci.yml` file at the root of the repository
- Use appropriate GitLab CI/CD features like stages, jobs, and artifacts
- Implement caching for dependencies and build artifacts
- Use GitLab's built-in CI/CD variables where appropriate
- Implement pipeline triggers for branches and merge requests
- Use GitLab's built-in security scanning tools where applicable
- Include detailed comments explaining each section of the configuration
- Structure the YAML file with clear stage and job separation

## Additional Guidelines
- Use the latest stable versions of Docker images for runners
- Implement appropriate timeout values for each job
- Use GitLab's built-in environment variables instead of hardcoded values
- Implement proper error handling and allow_failure settings where appropriate
- Use GitLab's built-in caching mechanisms to speed up builds
- Implement proper dependencies between jobs
- Use GitLab's built-in artifacts to share data between jobs
- Consider using GitLab's built-in templates for common tasks
- Implement proper rules for when jobs should run
- Use GitLab's built-in merge request pipelines where appropriate
- Consider using GitLab's built-in review apps for web applications
- Implement proper notifications for pipeline success/failure

Please generate a complete GitLab CI/CD pipeline YAML file (`.gitlab-ci.yml`) that implements all these requirements. The file should be well-structured, thoroughly commented, and follow best practices for GitLab CI/CD pipelines.

The output should be a complete, production-ready GitLab CI/CD pipeline configuration file that can be directly committed to the repository.
