# GitHub Actions Workflow Generation Request

I need you to generate a complete GitHub Actions workflow file for a project with the following details:

{{PROJECT_DETAILS}}

{{PIPELINE_FEATURES}}

{{LANGUAGE_SPECIFIC_STEPS}}

{{FRAMEWORK_SPECIFIC_STEPS}}

{{SECURITY_STEPS}}

{{SELF_HEALING_STEPS}}

## GitHub Actions Specific Requirements
- The workflow should run on push to main/master branch and on pull requests
- Use the latest stable versions of actions and runners
- Use GitHub's built-in caching mechanisms where appropriate
- Use matrix builds for testing across multiple versions/environments if applicable
- Include detailed comments explaining each section of the workflow
- Structure the YAML file with clear job separation and meaningful names
- Use environment variables for configuration where appropriate
- Consider using composite actions or reusable workflows for complex steps

Please generate a complete GitHub Actions workflow YAML file (.github/workflows/ci.yml) that implements all these requirements. The file should be well-structured, thoroughly commented, and follow best practices for GitHub Actions workflows.

## Additional Guidelines
- Use appropriate timeout values for each job to prevent hanging workflows
- Add appropriate concurrency settings to prevent redundant workflow runs
- Include proper error handling and continue-on-error settings where appropriate
- Add status badges and workflow visualization where helpful
- Ensure proper permissions are set for each job (principle of least privilege)
- Use appropriate conditional execution for jobs that depend on specific conditions
- Consider adding workflow dispatch triggers for manual execution
- Add appropriate notifications for workflow success/failure

The output should be a complete, production-ready GitHub Actions workflow YAML file that can be directly committed to the repository.
