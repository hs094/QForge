# QForge Prompts

This directory contains the prompts used by QForge to generate CI/CD pipelines using Amazon Q Developer CLI.

## Overview

The prompts are designed to generate high-quality, tailored CI/CD pipeline configurations based on the analysis of a project's codebase. The prompts are structured to provide Amazon Q with detailed information about the project and the desired pipeline features.

## Directory Structure

- `index.ts`: Main entry point for the prompts module, containing the `Prompts` class
- `templates/`: Directory containing template files for different CI/CD platforms
  - `github-actions.md`: Template for GitHub Actions workflows
  - `aws-codepipeline.md`: Template for AWS CodePipeline configurations

## How Prompts Work

1. The `Prompts` class loads the appropriate template based on the target CI/CD platform
2. It then replaces placeholders in the template with generated content based on the project profile and options
3. The final prompt is sent to Amazon Q Developer CLI to generate the pipeline configuration

## Placeholder Reference

The following placeholders are used in the templates:

- `{{PROJECT_DETAILS}}`: Details about the project (languages, frameworks, etc.)
- `{{PIPELINE_FEATURES}}`: Description of the requested pipeline features
- `{{LANGUAGE_SPECIFIC_STEPS}}`: Steps specific to the detected languages
- `{{FRAMEWORK_SPECIFIC_STEPS}}`: Steps specific to the detected frameworks
- `{{SECURITY_STEPS}}`: Security scanning steps (if requested)
- `{{SELF_HEALING_STEPS}}`: Self-healing capabilities (if requested)

## Extending Prompts

### Adding Support for a New CI/CD Platform

1. Create a new template file in the `templates/` directory (e.g., `gitlab-ci.md`)
2. Update the `generatePipelinePrompt` method in `index.ts` to use the new template
3. Add any platform-specific content generation methods if needed

### Improving Existing Prompts

To improve the quality of generated pipelines, you can:

1. Enhance the template files with more detailed instructions
2. Add more specific language and framework detection in the content generation methods
3. Include more best practices and recommendations in the prompts

## Best Practices for Prompt Engineering

When modifying prompts, keep the following best practices in mind:

1. **Be Specific**: Provide clear, detailed instructions about what you want
2. **Structure Matters**: Use headings, bullet points, and sections to organize the prompt
3. **Context is Key**: Include relevant information about the project and requirements
4. **Examples Help**: Include examples of desired output when appropriate
5. **Avoid Ambiguity**: Use precise language to avoid misinterpretation
6. **Test Thoroughly**: Test prompt changes with different project types to ensure quality

## Debugging Prompts

To debug prompts:

1. Run QForge with the `--debug` flag: `qforge generate --debug`
2. Check the logs in `~/.qforge/logs/` for the full prompts and responses
3. Analyze the generated pipelines to identify areas for improvement

## Contributing

When contributing new prompts or improvements:

1. Follow the existing structure and naming conventions
2. Document any new placeholders or methods
3. Test with a variety of project types
4. Update this README if you add new features or change existing behavior
