import { FailureFix, FailureType } from './types';
import { CIPlatform } from '../../types';

/**
 * Collection of common fixes for different failure types
 */
export const COMMON_FIXES: FailureFix[] = [
  // Test failure fixes
  {
    type: FailureType.TEST,
    description: 'Add retry for flaky tests',
    manualSteps: [
      'Identify the specific tests that are failing',
      'Add retry logic to those tests or test suites',
      'Consider adding timeouts or increasing existing timeouts',
      'Check for race conditions or timing issues in the tests'
    ]
  },
  {
    type: FailureType.TEST,
    description: 'Update test expectations',
    manualSteps: [
      'Review the test failure messages to understand what expectations are not being met',
      'Update test expectations to match the current behavior if appropriate',
      'If the current behavior is incorrect, fix the implementation instead'
    ]
  },
  {
    type: FailureType.TEST,
    description: 'Fix test environment issues',
    manualSteps: [
      'Ensure test environment has all required dependencies',
      'Check for environment-specific issues (file paths, environment variables, etc.)',
      'Verify that test fixtures or mock data are up to date',
      'Consider using containerization to ensure consistent test environments'
    ]
  },

  // Build failure fixes
  {
    type: FailureType.BUILD,
    description: 'Fix compilation errors',
    manualSteps: [
      'Review the build logs to identify specific compilation errors',
      'Fix syntax errors, type errors, or other compilation issues',
      'Ensure all required dependencies are installed',
      'Check for compatibility issues between dependencies'
    ]
  },
  {
    type: FailureType.BUILD,
    description: 'Update build configuration',
    manualSteps: [
      'Review build configuration files for errors or outdated settings',
      'Update build tool versions if necessary',
      'Check for changes in build tool behavior or requirements',
      'Ensure build scripts are compatible with the CI environment'
    ]
  },
  {
    type: FailureType.BUILD,
    description: 'Clean build cache',
    fixScript: `# Clean build cache
rm -rf node_modules/.cache
rm -rf .next
rm -rf dist
rm -rf build
rm -rf target
rm -rf .gradle
rm -rf .nuget
# Reinstall dependencies
npm ci || yarn install --frozen-lockfile || pnpm install --frozen-lockfile
# Rebuild
npm run build || yarn build || pnpm build`,
    manualSteps: [
      'Remove build cache directories',
      'Reinstall dependencies from scratch',
      'Rebuild the project'
    ]
  },

  // Dependency issues
  {
    type: FailureType.DEPENDENCY,
    description: 'Update dependencies',
    manualSteps: [
      'Update dependency versions to resolve conflicts',
      'Check for breaking changes in dependencies',
      'Update lockfiles to ensure consistent dependency versions',
      'Consider using dependency resolution or overrides for conflicting dependencies'
    ]
  },
  {
    type: FailureType.DEPENDENCY,
    description: 'Fix dependency resolution',
    fixScript: `# For npm
npm cache clean --force
rm -rf node_modules
rm -rf package-lock.json
npm install

# For yarn
yarn cache clean
rm -rf node_modules
rm -rf yarn.lock
yarn install

# For pnpm
pnpm store prune
rm -rf node_modules
rm -rf pnpm-lock.yaml
pnpm install`,
    manualSteps: [
      'Clear package manager cache',
      'Remove node_modules directory and lockfiles',
      'Reinstall dependencies from scratch'
    ]
  },
  {
    type: FailureType.DEPENDENCY,
    description: 'Use specific dependency versions',
    manualSteps: [
      'Pin dependency versions to specific versions known to work',
      'Use lockfiles to ensure consistent dependency versions',
      'Consider using a tool like Renovate or Dependabot to manage dependency updates'
    ]
  },

  // Resource constraint fixes
  {
    type: FailureType.RESOURCE,
    description: 'Increase resource limits',
    manualSteps: [
      'Increase memory limits for build or test processes',
      'Increase disk space allocation for the CI environment',
      'Consider using a larger CI runner or instance type',
      'Split large jobs into smaller ones to reduce resource usage'
    ]
  },
  {
    type: FailureType.RESOURCE,
    description: 'Optimize resource usage',
    manualSteps: [
      'Implement more efficient algorithms or processes',
      'Reduce the scope of tests or builds to use fewer resources',
      'Use incremental builds or tests when possible',
      'Implement caching to reduce resource usage'
    ]
  },
  {
    type: FailureType.RESOURCE,
    description: 'Clean up unused resources',
    fixScript: `# Remove temporary files and directories
find . -name "*.tmp" -delete
find . -name "*.log" -delete
# Clean Docker resources
docker system prune -f
# Clean up disk space
df -h
du -sh /* | sort -hr | head -10`,
    manualSteps: [
      'Remove temporary files and directories',
      'Clean up Docker resources (images, containers, volumes)',
      'Remove build artifacts from previous runs',
      'Implement cleanup steps in the CI pipeline'
    ]
  },

  // Network issues
  {
    type: FailureType.NETWORK,
    description: 'Implement retries for network operations',
    manualSteps: [
      'Add retry logic for network operations',
      'Implement exponential backoff for retries',
      'Add timeouts for network operations',
      'Consider using a circuit breaker pattern for unreliable services'
    ]
  },
  {
    type: FailureType.NETWORK,
    description: 'Use reliable package sources',
    manualSteps: [
      'Use reliable package registries or mirrors',
      'Consider using a private package registry',
      'Implement caching for downloaded packages',
      'Add fallback package sources'
    ]
  },
  {
    type: FailureType.NETWORK,
    description: 'Check service status',
    manualSteps: [
      'Check the status of external services being used',
      'Verify that API endpoints are available and responding correctly',
      'Check for service outages or maintenance windows',
      'Consider implementing service mocks for testing'
    ]
  },

  // Permission issues
  {
    type: FailureType.PERMISSION,
    description: 'Update permissions',
    manualSteps: [
      'Review and update permissions for the CI/CD service account',
      'Ensure the CI/CD service has access to required resources',
      'Check for expired credentials or tokens',
      'Verify that environment variables for authentication are set correctly'
    ]
  },
  {
    type: FailureType.PERMISSION,
    description: 'Fix file permissions',
    fixScript: `# Make scripts executable
find . -name "*.sh" -exec chmod +x {} \\;
# Fix common permission issues
chmod -R u+rw .`,
    manualSteps: [
      'Make scripts executable with chmod +x',
      'Fix file ownership issues',
      'Ensure the CI/CD service has write access to required directories',
      'Check for permission issues in mounted volumes or shared directories'
    ]
  },

  // Configuration issues
  {
    type: FailureType.CONFIGURATION,
    description: 'Fix configuration syntax',
    manualSteps: [
      'Validate configuration files with appropriate linters or validators',
      'Fix syntax errors in YAML, JSON, or other configuration formats',
      'Ensure configuration files follow the required schema',
      'Check for typos or incorrect indentation'
    ]
  },
  {
    type: FailureType.CONFIGURATION,
    description: 'Update environment variables',
    manualSteps: [
      'Ensure all required environment variables are set',
      'Check for typos or incorrect values in environment variables',
      'Verify that secret environment variables are properly configured',
      'Consider using a .env file for local development'
    ]
  },

  // Timeout issues
  {
    type: FailureType.TIMEOUT,
    description: 'Increase timeouts',
    manualSteps: [
      'Increase timeouts for long-running operations',
      'Split long-running jobs into smaller ones',
      'Implement progress reporting for long-running operations',
      'Consider using a different approach for operations that consistently time out'
    ]
  },
  {
    type: FailureType.TIMEOUT,
    description: 'Optimize performance',
    manualSteps: [
      'Identify and optimize slow operations',
      'Implement caching to reduce execution time',
      'Use parallel execution where possible',
      'Consider using more powerful CI runners or instances'
    ]
  }
];

/**
 * Platform-specific fixes for different failure types
 */
export const PLATFORM_FIXES: Record<CIPlatform, FailureFix[]> = {
  github: [
    {
      type: FailureType.PERMISSION,
      description: 'Update GitHub Actions permissions',
      platformSpecific: true,
      platforms: ['github'],
      manualSteps: [
        'Check the "permissions" section in your workflow file',
        'Ensure the GITHUB_TOKEN has the required permissions',
        'Consider using a personal access token (PAT) with appropriate scopes',
        'Update repository settings to allow the required actions'
      ]
    },
    {
      type: FailureType.RESOURCE,
      description: 'Optimize GitHub Actions workflow',
      platformSpecific: true,
      platforms: ['github'],
      manualSteps: [
        'Use GitHub-hosted runners with more resources',
        'Implement caching for dependencies and build artifacts',
        'Use GitHub Actions\' built-in caching mechanism',
        'Split large workflows into multiple jobs'
      ]
    },
    {
      type: FailureType.CONFIGURATION,
      description: 'Fix GitHub Actions workflow syntax',
      platformSpecific: true,
      platforms: ['github'],
      manualSteps: [
        'Validate workflow YAML syntax',
        'Check for deprecated actions or syntax',
        'Ensure all required inputs for actions are provided',
        'Use the GitHub Actions workflow validator'
      ]
    }
  ],

  aws: [
    {
      type: FailureType.PERMISSION,
      description: 'Update AWS IAM permissions',
      platformSpecific: true,
      platforms: ['aws'],
      manualSteps: [
        'Review IAM roles and policies for CodePipeline, CodeBuild, and other services',
        'Ensure the service roles have the required permissions',
        'Check for resource-based policies that might be denying access',
        'Verify that cross-account permissions are configured correctly'
      ]
    },
    {
      type: FailureType.CONFIGURATION,
      description: 'Fix AWS CodePipeline configuration',
      platformSpecific: true,
      platforms: ['aws'],
      manualSteps: [
        'Validate CodePipeline configuration',
        'Check artifact configurations between stages',
        'Ensure all required parameters are provided for actions',
        'Verify that service roles are correctly configured'
      ]
    }
  ],

  gitlab: [
    {
      type: FailureType.RESOURCE,
      description: 'Optimize GitLab CI resources',
      platformSpecific: true,
      platforms: ['gitlab'],
      manualSteps: [
        'Use GitLab runners with more resources',
        'Implement caching for dependencies and build artifacts',
        'Use GitLab CI\'s built-in caching mechanism',
        'Split large jobs into multiple smaller jobs'
      ]
    },
    {
      type: FailureType.CONFIGURATION,
      description: 'Fix GitLab CI configuration',
      platformSpecific: true,
      platforms: ['gitlab'],
      manualSteps: [
        'Validate .gitlab-ci.yml syntax',
        'Check for deprecated features or syntax',
        'Ensure all required variables are defined',
        'Use the GitLab CI lint tool to validate configuration'
      ]
    }
  ],

  circleci: [
    {
      type: FailureType.RESOURCE,
      description: 'Optimize CircleCI resources',
      platformSpecific: true,
      platforms: ['circleci'],
      manualSteps: [
        'Use a larger resource class for jobs',
        'Implement caching for dependencies and build artifacts',
        'Use CircleCI\'s built-in caching mechanism',
        'Split large jobs into multiple smaller jobs'
      ]
    },
    {
      type: FailureType.CONFIGURATION,
      description: 'Fix CircleCI configuration',
      platformSpecific: true,
      platforms: ['circleci'],
      manualSteps: [
        'Validate config.yml syntax',
        'Check for deprecated features or syntax',
        'Ensure all required parameters are provided for orbs and executors',
        'Use the CircleCI config validator to validate configuration'
      ]
    }
  ]
};
