# AWS CodePipeline Generation Request

I need you to generate a complete AWS CodePipeline configuration for a project with the following details:

{{PROJECT_DETAILS}}

{{PIPELINE_FEATURES}}

{{LANGUAGE_SPECIFIC_STEPS}}

{{FRAMEWORK_SPECIFIC_STEPS}}

{{SECURITY_STEPS}}

{{SELF_HEALING_STEPS}}

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
