import path from 'path';
import { AmazonQClient } from '../amazon-q';
import { GeneratorOptions, PipelineConfig, ProjectProfile, CIPlatform } from '../../types';
import { enhanceGitHubWorkflow } from './github-enhancer';
import { enhanceAwsPipeline } from './aws-enhancer';
import { enhanceGitLabPipeline } from './gitlab-enhancer';
import { enhanceCircleCIPipeline } from './circleci-enhancer';
import { extractYamlFromText } from '../utils/yaml-extractor';

// Initialize Amazon Q client
const amazonQClient = new AmazonQClient();

/**
 * Generates a CI/CD pipeline configuration based on project profile and options
 * @param projectProfile Project profile from analyzer
 * @param options Generator options
 * @returns Promise resolving to the generated pipeline configuration
 */
export async function generatePipeline(
  projectProfile: ProjectProfile,
  options: GeneratorOptions
): Promise<PipelineConfig> {
  try {
    // Generate base pipeline using Amazon Q
    // Ensure platform is compatible with Amazon Q client
    const platform = options.platform === 'github' || options.platform === 'aws'
      ? options.platform
      : 'github'; // Default to github for other platforms

    const response = await amazonQClient.generatePipeline(
      projectProfile,
      platform,
      {
        testCoverage: options.testCoverage,
        linting: options.linting,
        security: options.security,
        selfHealing: options.selfHealing
      }
    );

    if (!response.success || !response.content) {
      throw new Error(response.error || 'Failed to generate pipeline configuration');
    }

    // Extract pipeline content and clean up any non-YAML text
    let pipelineContent = extractYamlFromText(response.content);

    // Enhance the pipeline with additional features
    switch (options.platform) {
      case 'github':
        pipelineContent = enhanceGitHubWorkflow(pipelineContent, projectProfile, options);
        break;
      case 'aws':
        pipelineContent = enhanceAwsPipeline(pipelineContent, projectProfile, options);
        break;
      case 'gitlab':
        pipelineContent = enhanceGitLabPipeline(pipelineContent, projectProfile, options);
        break;
      case 'circleci':
        pipelineContent = enhanceCircleCIPipeline(pipelineContent, projectProfile, options);
        break;
      default:
        // Default to GitHub Actions if platform is not recognized
        pipelineContent = enhanceGitHubWorkflow(pipelineContent, projectProfile, options);
    }

    // Determine output file path
    let filePath: string;
    switch (options.platform) {
      case 'github':
        filePath = '.github/workflows/ci.yml';
        break;
      case 'aws':
        filePath = 'aws-pipeline.yml';
        break;
      case 'gitlab':
        filePath = '.gitlab-ci.yml';
        break;
      case 'circleci':
        filePath = '.circleci/config.yml';
        break;
      default:
        filePath = '.github/workflows/ci.yml';
    }

    return {
      platform: options.platform,
      content: pipelineContent,
      filePath
    };
  } catch (error) {
    throw new Error(`Failed to generate pipeline: ${error instanceof Error ? error.message : String(error)}`);
  }
}
