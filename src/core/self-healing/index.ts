import { FailureAnalyzer } from './analyzer';
import { SelfHealingManager } from './manager';
import { 
  FailureType, 
  FailureSeverity, 
  FailurePattern, 
  DetectedFailure, 
  FailureFix, 
  FixSuggestion, 
  SelfHealingOptions, 
  DEFAULT_SELF_HEALING_OPTIONS 
} from './types';
import { FAILURE_PATTERNS, PLATFORM_FAILURE_PATTERNS } from './failure-patterns';
import { COMMON_FIXES, PLATFORM_FIXES } from './failure-fixes';

export {
  FailureAnalyzer,
  SelfHealingManager,
  FailureType,
  FailureSeverity,
  FailurePattern,
  DetectedFailure,
  FailureFix,
  FixSuggestion,
  SelfHealingOptions,
  DEFAULT_SELF_HEALING_OPTIONS,
  FAILURE_PATTERNS,
  PLATFORM_FAILURE_PATTERNS,
  COMMON_FIXES,
  PLATFORM_FIXES
};
