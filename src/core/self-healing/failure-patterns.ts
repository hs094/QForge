import { FailurePattern, FailureType, FailureSeverity } from './types';

/**
 * Collection of common failure patterns for different CI/CD platforms
 */
export const FAILURE_PATTERNS: FailurePattern[] = [
  // Test failures
  {
    type: FailureType.TEST,
    severity: FailureSeverity.MEDIUM,
    patterns: [
      /test(s)?\s+failed/i,
      /failing\s+test(s)?/i,
      /assertion\s+failed/i,
      /expect(ed)?.+to\s+(equal|be|include|contain|have)/i,
      /AssertionError/i,
      /Error:\s+Test\s+suite\s+failed\s+to\s+run/i,
      /FAIL\s+[a-zA-Z0-9_./-]+\s+\(\d+\.\d+s\)/i,
      /FAIL\s+src\/components\/Button\.test\.js/i,
      /expect\(jest\.fn\(\)\)\.toHaveBeenCalledTimes\(1\)/i,
      /● Button component › handles click events/i
    ],
    description: 'One or more tests failed during execution'
  },

  // Flaky tests
  {
    type: FailureType.TEST,
    severity: FailureSeverity.LOW,
    patterns: [
      /intermittent\s+test\s+failure/i,
      /flaky\s+test/i,
      /test\s+sometimes\s+fails/i,
      /timeout\s+exceeded\s+waiting\s+for/i,
      /async\s+callback\s+was\s+not\s+invoked\s+within\s+the\s+\d+ms\s+timeout/i,
      /element\s+not\s+found/i,
      /element\s+not\s+visible/i
    ],
    description: 'Tests appear to be flaky or timing-dependent'
  },

  // Build failures
  {
    type: FailureType.BUILD,
    severity: FailureSeverity.HIGH,
    patterns: [
      /build\s+failed/i,
      /compilation\s+failed/i,
      /cannot\s+find\s+module/i,
      /module\s+not\s+found/i,
      /import\s+error/i,
      /syntax\s+error/i,
      /error\s+TS\d+/i,
      /error\s+C\d+/i,
      /error\s+MSB\d+/i,
      /error\s+NETSDK\d+/i,
      /error\s+CS\d+/i,
      /error\s+LNK\d+/i,
      /error:\s+'[^']+'\s+is\s+not\s+a\s+member\s+of\s+'[^']+'/i,
      /error:\s+use\s+of\s+undeclared\s+identifier/i,
      /error:\s+expected\s+/i
    ],
    description: 'Build or compilation process failed'
  },

  // Dependency issues
  {
    type: FailureType.DEPENDENCY,
    severity: FailureSeverity.HIGH,
    patterns: [
      /could\s+not\s+find\s+a\s+version\s+that\s+satisfies\s+the\s+requirement/i,
      /could\s+not\s+resolve\s+dependencies/i,
      /dependency\s+resolution\s+failed/i,
      /package\s+not\s+found/i,
      /unable\s+to\s+resolve\s+dependency\s+tree/i,
      /npm\s+ERR!\s+404/i,
      /pip\s+install\s+error/i,
      /failed\s+to\s+install\s+dependencies/i,
      /no\s+matching\s+version\s+found\s+for/i,
      /incompatible\s+dependency/i,
      /version\s+conflict/i,
      /peer\s+dependency\s+conflict/i,
      /requires\s+peer\s+dependency/i,
      /npm\s+ERR!\s+code\s+ERESOLVE/i,
      /npm\s+ERR!\s+ERESOLVE\s+could\s+not\s+resolve\s+dependency\s+tree/i,
      /Could\s+not\s+resolve\s+dependency:/i
    ],
    description: 'Issues with dependency resolution or installation'
  },

  // Resource constraints
  {
    type: FailureType.RESOURCE,
    severity: FailureSeverity.HIGH,
    patterns: [
      /out\s+of\s+memory/i,
      /memory\s+limit\s+exceeded/i,
      /disk\s+space\s+limit\s+exceeded/i,
      /no\s+space\s+left\s+on\s+device/i,
      /resource\s+exhausted/i,
      /cpu\s+usage\s+limit\s+exceeded/i,
      /heap\s+limit\s+exceeded/i,
      /JavaScript\s+heap\s+out\s+of\s+memory/i,
      /fatal\s+error:\s+Killed\s+process/i,
      /exit\s+code\s+137/i, // OOM kill
      /exit\s+code\s+143/i  // SIGTERM
    ],
    description: 'Process ran out of memory, disk space, or other resources'
  },

  // Network issues
  {
    type: FailureType.NETWORK,
    severity: FailureSeverity.MEDIUM,
    patterns: [
      /network\s+error/i,
      /connection\s+refused/i,
      /connection\s+reset/i,
      /connection\s+timed\s+out/i,
      /network\s+timeout/i,
      /failed\s+to\s+fetch/i,
      /unable\s+to\s+connect\s+to/i,
      /could\s+not\s+resolve\s+host/i,
      /ECONNREFUSED/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /ENETUNREACH/i,
      /socket\s+hang\s+up/i,
      /TLS\s+handshake\s+failed/i,
      /SSL\s+certificate\s+error/i
    ],
    description: 'Network connectivity issues or service unavailability'
  },

  // Permission issues
  {
    type: FailureType.PERMISSION,
    severity: FailureSeverity.HIGH,
    patterns: [
      /permission\s+denied/i,
      /EACCES/i,
      /insufficient\s+permissions/i,
      /not\s+authorized/i,
      /authorization\s+failed/i,
      /access\s+denied/i,
      /forbidden/i,
      /403\s+Forbidden/i,
      /401\s+Unauthorized/i,
      /authentication\s+failed/i,
      /could\s+not\s+authenticate/i,
      /API\s+key\s+is\s+invalid/i,
      /token\s+is\s+invalid/i,
      /no\s+such\s+key/i
    ],
    description: 'Permission or authentication issues'
  },

  // Configuration issues
  {
    type: FailureType.CONFIGURATION,
    severity: FailureSeverity.MEDIUM,
    patterns: [
      /configuration\s+error/i,
      /invalid\s+configuration/i,
      /missing\s+configuration/i,
      /unknown\s+option/i,
      /unrecognized\s+option/i,
      /invalid\s+option/i,
      /missing\s+required\s+option/i,
      /missing\s+required\s+parameter/i,
      /missing\s+required\s+environment\s+variable/i,
      /environment\s+variable\s+not\s+set/i,
      /invalid\s+yaml/i,
      /invalid\s+json/i,
      /invalid\s+syntax/i,
      /could\s+not\s+parse/i,
      /unexpected\s+token/i
    ],
    description: 'Issues with configuration files or settings'
  },

  // Timeout issues
  {
    type: FailureType.TIMEOUT,
    severity: FailureSeverity.MEDIUM,
    patterns: [
      /timeout\s+exceeded/i,
      /timed\s+out/i,
      /timeout\s+waiting\s+for/i,
      /execution\s+timed\s+out/i,
      /job\s+exceeded\s+maximum\s+execution\s+time/i,
      /task\s+timed\s+out\s+after/i,
      /operation\s+timed\s+out/i,
      /ETIMEDOUT/i,
      /timeout\s+of\s+\d+ms\s+exceeded/i,
      /timeout\s+after\s+\d+s/i
    ],
    description: 'Process or operation timed out'
  }
];

/**
 * Platform-specific failure patterns
 */
export const PLATFORM_FAILURE_PATTERNS: Record<string, FailurePattern[]> = {
  github: [
    {
      type: FailureType.PERMISSION,
      severity: FailureSeverity.HIGH,
      patterns: [
        /refusing\s+to\s+allow\s+a\s+(GitHub App|OAuth App|Personal Access Token)/i,
        /permission\s+to\s+[a-zA-Z0-9_/-]+\s+was\s+denied/i,
        /workflow\s+does\s+not\s+have\s+permission\s+to\s+access\s+the\s+resource/i,
        /Resource\s+not\s+accessible\s+by\s+integration/i
      ],
      description: 'GitHub Actions permission issues'
    },
    {
      type: FailureType.CONFIGURATION,
      severity: FailureSeverity.MEDIUM,
      patterns: [
        /Invalid\s+workflow\s+file/i,
        /Workflow\s+is\s+not\s+valid/i,
        /The\s+workflow\s+is\s+not\s+valid/i,
        /\.github\/workflows\/[a-zA-Z0-9_-]+\.ya?ml:\s+Error/i
      ],
      description: 'GitHub Actions workflow configuration issues'
    }
  ],

  gitlab: [
    {
      type: FailureType.CONFIGURATION,
      severity: FailureSeverity.MEDIUM,
      patterns: [
        /\.gitlab-ci\.ya?ml:\s+([a-zA-Z0-9_-]+):\s+config\s+error/i,
        /Invalid\s+configuration\s+format/i,
        /jobs:[a-zA-Z0-9_-]+\s+config\s+should\s+implement\s+a\s+script\s+or\s+a\s+trigger/i
      ],
      description: 'GitLab CI configuration issues'
    },
    {
      type: FailureType.RESOURCE,
      severity: FailureSeverity.HIGH,
      patterns: [
        /Runner\s+system\s+failure/i,
        /Error:\s+Job\s+failed\s+\(system\s+failure\)/i
      ],
      description: 'GitLab CI runner resource issues'
    }
  ],

  circleci: [
    {
      type: FailureType.CONFIGURATION,
      severity: FailureSeverity.MEDIUM,
      patterns: [
        /Error:\s+Workflow\s+validation\s+error/i,
        /Error:\s+Could\s+not\s+find\s+a\s+definition\s+for\s+job/i,
        /Error:\s+Unknown\s+executor/i
      ],
      description: 'CircleCI configuration issues'
    },
    {
      type: FailureType.RESOURCE,
      severity: FailureSeverity.HIGH,
      patterns: [
        /Error:\s+Resource\s+class\s+[a-zA-Z0-9_-]+\s+is\s+not\s+available/i,
        /Error:\s+No\s+available\s+resource\s+found/i
      ],
      description: 'CircleCI resource issues'
    }
  ],

  aws: [
    {
      type: FailureType.PERMISSION,
      severity: FailureSeverity.HIGH,
      patterns: [
        /User:\s+arn:aws:[a-zA-Z0-9:-]+\s+is\s+not\s+authorized\s+to\s+perform/i,
        /AccessDenied/i,
        /not\s+authorized\s+to\s+perform\s+action/i
      ],
      description: 'AWS CodePipeline permission issues'
    },
    {
      type: FailureType.CONFIGURATION,
      severity: FailureSeverity.MEDIUM,
      patterns: [
        /Invalid\s+action\s+configuration/i,
        /Action\s+configuration\s+validation\s+failed/i,
        /The\s+action\s+failed\s+because\s+the\s+artifact/i
      ],
      description: 'AWS CodePipeline configuration issues'
    }
  ]
};
