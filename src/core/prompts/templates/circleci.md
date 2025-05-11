# CircleCI Pipeline Generation Request

I need you to generate a complete CircleCI configuration file for a project with the following details:

{{PROJECT_DETAILS}}

{{PIPELINE_FEATURES}}

{{LANGUAGE_SPECIFIC_STEPS}}

{{FRAMEWORK_SPECIFIC_STEPS}}

{{SECURITY_STEPS}}

{{SELF_HEALING_STEPS}}

## CircleCI Specific Requirements
- The configuration should be defined in a `.circleci/config.yml` file
- Use CircleCI 2.1 configuration format with appropriate orbs
- Implement workflows to organize jobs
- Use CircleCI's built-in caching mechanisms for dependencies
- Implement appropriate resource classes for jobs
- Use CircleCI's built-in environment variables where appropriate
- Include detailed comments explaining each section of the configuration
- Structure the YAML file with clear job and workflow separation

## Additional Guidelines
- Use the latest stable versions of Docker images for executors
- Implement appropriate timeout values for each job
- Use CircleCI's built-in environment variables instead of hardcoded values
- Implement proper error handling and when/unless conditions where appropriate
- Use CircleCI's built-in caching mechanisms to speed up builds
- Implement proper job dependencies using requires
- Use CircleCI's built-in artifacts to share data between jobs
- Consider using CircleCI's built-in orbs for common tasks
- Implement proper filters for when jobs should run
- Use CircleCI's built-in approval jobs for manual interventions where needed
- Consider using CircleCI's built-in contexts for sensitive environment variables
- Implement proper notifications for workflow success/failure

Please generate a complete CircleCI configuration YAML file (`.circleci/config.yml`) that implements all these requirements. The file should be well-structured, thoroughly commented, and follow best practices for CircleCI configuration.

The output should be a complete, production-ready CircleCI configuration file that can be directly committed to the repository.
