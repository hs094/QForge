# Prompt Development Guide

This guide provides information on developing and improving prompts for QForge's pipeline generation.

## Introduction

QForge uses Amazon Q Developer CLI to generate CI/CD pipeline configurations. The quality of these configurations depends heavily on the prompts we provide to Amazon Q. This guide will help you understand how to develop effective prompts and test them.

## Prompt Structure

Our prompts are structured as follows:

1. **Header**: Introduces the task to Amazon Q
2. **Project Details**: Information about the project's languages, frameworks, etc.
3. **Pipeline Features**: Description of the requested pipeline features
4. **Language-Specific Steps**: Steps specific to the detected languages
5. **Framework-Specific Steps**: Steps specific to the detected frameworks
6. **Security Steps**: Security scanning steps (if requested)
7. **Self-Healing Steps**: Self-healing capabilities (if requested)
8. **Platform-Specific Requirements**: Requirements specific to the target CI/CD platform
9. **Additional Guidelines**: Extra guidelines for generating high-quality configurations

## Prompt Templates

Prompt templates are stored in `src/core/prompts/templates/`:

- `github-actions.md`: Template for GitHub Actions workflows
- `aws-codepipeline.md`: Template for AWS CodePipeline configurations

These templates use placeholders that are replaced with generated content:

- `{{PROJECT_DETAILS}}`: Details about the project
- `{{PIPELINE_FEATURES}}`: Description of the requested pipeline features
- `{{LANGUAGE_SPECIFIC_STEPS}}`: Steps specific to the detected languages
- `{{FRAMEWORK_SPECIFIC_STEPS}}`: Steps specific to the detected frameworks
- `{{SECURITY_STEPS}}`: Security scanning steps
- `{{SELF_HEALING_STEPS}}`: Self-healing capabilities

## Prompt Generation

The `Prompts` class in `src/core/prompts/index.ts` is responsible for generating prompts:

1. It loads the appropriate template based on the target CI/CD platform
2. It generates content for each placeholder based on the project profile and options
3. It replaces the placeholders in the template with the generated content
4. It returns the final prompt to be sent to Amazon Q

## Testing Prompts

You can test prompts without running the full pipeline generation using the `test-prompt.js` script:

```bash
# Test GitHub Actions prompt
npm run test:prompt:github

# Test AWS CodePipeline prompt
npm run test:prompt:aws

# Test with custom options
node scripts/test-prompt.js --platform github --output custom-prompt.md
```

This will generate a prompt file that you can review or test with Amazon Q CLI directly:

```bash
# Non-interactive mode (output to file)
q chat --no-interactive < prompt-test.md > q-response.txt

# Or using redirection
cat prompt-test.md | q chat --no-interactive > q-response.txt

# Interactive mode
cat prompt-test.md | q chat
```

## Debugging Prompts

When running QForge with the `--debug` flag, prompts and responses are saved to `~/.qforge/logs/`:

```bash
qforge generate --debug
```

You can review these files to understand how Amazon Q is interpreting your prompts and identify areas for improvement.

## Prompt Engineering Best Practices

### 1. Be Specific and Clear

- Provide clear, detailed instructions about what you want
- Use precise language to avoid ambiguity
- Specify exactly what the output should look like

### 2. Structure Your Prompts

- Use headings, bullet points, and sections to organize the prompt
- Present information in a logical order
- Use consistent formatting throughout

### 3. Provide Context

- Include relevant information about the project
- Explain why certain features are important
- Provide background information when necessary

### 4. Use Examples

- Include examples of desired output when appropriate
- Show examples of good practices
- Demonstrate the expected format

### 5. Set Constraints

- Specify any limitations or requirements
- Define what should and shouldn't be included
- Set clear expectations for the output

### 6. Iterate and Refine

- Test prompts with different project types
- Analyze the generated outputs
- Refine prompts based on results

## Common Issues and Solutions

### Issue: Generated Pipeline is Too Generic

**Solution**: Add more specific details about the project and requirements. Include language-specific best practices and platform-specific features.

### Issue: Missing Important Steps

**Solution**: Explicitly mention required steps in the prompt. Use bullet points to list all necessary steps in detail.

### Issue: Incorrect Syntax in Generated Pipeline

**Solution**: Include examples of correct syntax in the prompt. Specify the exact format expected for critical sections.

### Issue: Too Much Boilerplate

**Solution**: Ask for concise, focused output. Specify that comments should be meaningful and not just repeat what the code does.

### Issue: Security Steps Are Inadequate

**Solution**: Provide detailed security requirements, including specific tools and thresholds. Explain the importance of security scanning.

## Contributing New Prompts

When contributing new prompts or improvements:

1. Start by testing the existing prompts to understand their strengths and weaknesses
2. Make incremental changes and test after each change
3. Document your changes and the reasoning behind them
4. Test with a variety of project types
5. Submit a pull request with before/after examples of generated pipelines
